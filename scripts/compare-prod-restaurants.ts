import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

// Load production environment variables by default, but allow override
const envFile = process.argv[2] === '--dev' ? '.env' : '.env.production';
dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  console.error(chalk.red(`Error: DATABASE_URL is not set in ${envFile}`));
  process.exit(1);
}

// Debug: Log the database URL (but mask sensitive parts)
const dbUrl = process.env.DATABASE_URL;
console.log(chalk.blue('Using database URL:'), dbUrl.replace(/:\/\/.*@/, '://*****@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Helper function to normalize strings for comparison
function normalizeString(str: string): string {
  return str.toLowerCase()
    .replace(/['']/g, '')  // Remove all types of apostrophes
    .replace(/[^a-z0-9]/g, '')  // Remove all non-alphanumeric characters
    .trim();
}

// List of restaurant names from seed.ts file
const seedRestaurants = [
  'Shawarma Press - Johns Creek',
  'Kimchi Red - Alpharetta',
  'Olomi\'s Grill',
  'Spices Hut Food Court',
  'Pista House Alpharetta',
  'Namak',
  'Biryani House Atlanta',
  'Al Zein Shawarma & Mediterranean Grill',
  'Kimchi Red - Johns Creek',
  'Cafe Efendi Mediterranean Restaurant',
  'Karachi Broast & Grill',
  'Zyka: The Taste | Indian Restaurant | Decatur',
  'The Halal Guys',
  'Khan\'s Kitchen',
  'Shibam Coffee',
  'MOTW Coffee and Pastries',
  '967 Coffee Co',
  'Baladi Coffee',
  'Jerusalem Bakery & Grill',
  'Bismillah Cafe',
  'Merhaba Shawarma',
  'Delbar - Old Milton',
  'Sabri Kabab House',
  'Al-Amin Supermarket & Restaurant',
  'ZamZam Halal Supermarket & Restaurant',
  'Kabul Kabob',
  'Al Madina Restaurant',
  'Scoville Hot Chicken - Buckhead',
  'Desi Spice',
  'Halal Pizza and cafe',
  'Hyderabad House Atlanta - Biryani Place',
  'Jaffa Restaurant Atl (Halal)',
  'Kabob Land',
  'Karachi Grill & BBQ',
  'Laghman Express',
  'Lahore Grill',
  'Mashawi Mediterranean',
  'Mediterranean Grill - Decatur',
  'Moctezuma Mexican Grill',
  'Mukja Korean Fried Chicken',
  'NaanStop',
  'Nature Village Restaurant',
  'PONKO Chicken - Alpharetta',
  'Pita Palace Mediterranean Grill',
  'Rumi\'s Kitchen - Sandy Springs',
  'Salsa Taqueria & Wings',
  'Shah\'s Halal Food',
  'Springreens at Community Cafe',
  'Star Pizza',
  'Stone Creek Halal Pizza',
  'Talkin\' Tacos Buckhead',
  'Three Buddies'
];

async function main() {
  try {
    console.log(chalk.cyan('\nGetting all restaurants from production database...'));
    console.log(chalk.gray(`Using environment: ${envFile}\n`));

    // Get all restaurants from production
    const prodRestaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(chalk.blue(`Found ${prodRestaurants.length} restaurants in production database`));

    // Find restaurants that exist in production but not in seed file
    const missingRestaurants = prodRestaurants.filter(prodRestaurant => {
      const normalizedProdName = normalizeString(prodRestaurant.name);
      return !seedRestaurants.some(seedName => normalizeString(seedName) === normalizedProdName);
    });

    if (missingRestaurants.length === 0) {
      console.log(chalk.green('\nAll production restaurants are in the seed file!'));
    } else {
      console.log(chalk.yellow(`\nFound ${missingRestaurants.length} restaurants in production that are not in seed file:`));
      missingRestaurants.forEach((r, i) => {
        console.log(chalk.red(`${i + 1}. ${r.name}`));
        console.log(chalk.gray(`   Address: ${r.address}`));
        console.log(chalk.gray(`   Cuisine: ${r.cuisineType}`));
        console.log('');
      });

      console.log(chalk.yellow('\nHere are the missing restaurants formatted for seed.ts:\n'));
      missingRestaurants.forEach((restaurant, index) => {
        console.log(`    await upsertRestaurant('${restaurant.name}', {`);
        console.log(`      name: '${restaurant.name}',`);
        console.log(`      cuisineType: CuisineType.${restaurant.cuisineType},`);
        console.log(`      address: '${restaurant.address}',`);
        console.log(`      description: '${restaurant.description || ''}',`);
        console.log(`      priceRange: PriceRange.${restaurant.priceRange},`);
        console.log(`      hasPrayerRoom: ${restaurant.hasPrayerRoom},`);
        console.log(`      hasOutdoorSeating: ${restaurant.hasOutdoorSeating},`);
        console.log(`      isZabiha: ${restaurant.isZabiha},`);
        console.log(`      hasHighChair: ${restaurant.hasHighChair},`);
        console.log(`      servesAlcohol: ${restaurant.servesAlcohol},`);
        console.log(`      isFullyHalal: ${restaurant.isFullyHalal},`);
        console.log(`      imageUrl: '${restaurant.imageUrl}',`);
        console.log(`      zabihaChicken: ${restaurant.zabihaChicken},`);
        console.log(`      zabihaLamb: ${restaurant.zabihaLamb},`);
        console.log(`      zabihaBeef: ${restaurant.zabihaBeef},`);
        console.log(`      zabihaGoat: ${restaurant.zabihaGoat},`);
        console.log(`      zabihaVerified: ${restaurant.zabihaVerified ? `new Date('${restaurant.zabihaVerified.toISOString().split('T')[0]}')` : 'null'},`);
        console.log(`      zabihaVerifiedBy: ${restaurant.zabihaVerifiedBy ? `'${restaurant.zabihaVerifiedBy}'` : 'null'}`);
        console.log('    });\n');
      });
    }
  } catch (error) {
    console.error(chalk.red('\nError:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('Error details:'), error.message);
      console.error(chalk.gray('Stack trace:'), error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Add command line help
if (process.argv.includes('--help')) {
  console.log(`
Usage: node scripts/compare-prod-restaurants.ts [options]

Options:
  --dev     Use development environment (.env)
  --help    Show this help message

By default, the script uses production environment (.env.production)
  `);
  process.exit(0);
}

main(); 