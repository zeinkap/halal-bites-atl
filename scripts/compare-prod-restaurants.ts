import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
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
  "Olomi's Grill",
  'Spices Hut Food Court',
  'Pista House Alpharetta',
  'Namak',
  'Biryani House Atlanta',
  'Al Zein Shawarma & Mediterranean Grill',
  'Kimchi Red - Johns Creek',
  'Cafe Efendi Mediterranean Restaurant',
  'Karachi Broast & Grill - Roswell',
  'Karachi Broast & Grill - Marietta',
  'Karachi Broast & Grill - Norcross',
  'Zyka: The Taste | Indian Restaurant | Decatur',
  'The Halal Guys',
  "Khan's Kitchen",
  'Shibam Coffee',
  'MOTW Coffee and Pastries',
  '967 Coffee Co',
  'Baladi Coffee',
  'Jerusalem Bakery & Grill - Marietta',
  'Jerusalem Bakery & Grill - Roswell',
  'Jerusalem Bakery & Grill - Alpharetta',
  'Bismillah Cafe',
  'Merhaba Shawarma',
  'Delbar - Old Milton',
  'Sabri Kabab House',
  'Al-Amin Supermarket & Restaurant',
  'ZamZam Halal Supermarket & Restaurant',
  'Kabul Kabob',
  'Al Madina Grocery & Restaurant',
  'Chinese Dhaba',
  'Star Pizza',
  'PONKO Chicken - Alpharetta',
  'PONKO Chicken - Duluth',
  'PONKO Chicken - Midtown',
  'Express Burger & Grill',
  'Moctezuma Mexican Grill',
  'Adana Atl - Restaurant & Lounge',
  'Dil Bahar Cafe & Market',
  'Briskfire BBQ',
  'Stone Creek Halal Pizza',
  'Salsa Taqueria & Wings',
  'Auntie Vees Kitchen',
  'Springreens at Community Cafe',
  'Mukja Korean Fried Chicken',
  'Baraka Shawarma Atlanta',
  'Baraka Shawarma Stone Mountain',
  'Botiwalla by Chai Pani',
  "Dantanna's",
  'Jaffa Restaurant Atl (Halal)',
  "Talkin' Tacos Buckhead",
  'Ariana Kabob House',
  'Hyderabad House Atlanta - Biryani Place',
  "Asma's Cuisine",
  'Three Buddies',
  'Alif Cafe',
  'NaanStop',
  'Mashawi Mediterranean',
  'Laghman Express',
  'Kabob Land',
  "Ali N' One Zabiha Halal Kitchen",
  'Nature Village Restaurant',
  'Halal Pizza and cafe',
  'Bawarchi Biryanis Atlanta',
  "Shah's Halal Food - Peachtree Corners",
  "Shah's Halal Food - Marietta",
  "Shah's Halal Food - Lawrenceville",
  'Lahore Grill',
  'AZ Pizza, Wings & Fish (Halal)',
  'Scoville Hot Chicken - Buckhead',
  'Desi Spice Indian Cuisine',
  'Halal Guys - Midtown',
  "Rumi's Kitchen - Sandy Springs",
  "Rumi's Kitchen Avalon",
  'Mediterranean Grill - Decatur',
  "BaBa's Wings & Platters",
  'Biryani Pot',
  "Murrays In A Hurry",
  'Pizza Wali ',
  'Mokhaport',
  'Wowbõõza',
  'Nara Cuisine & Lounge',
  'Bezoria Alpharetta',
  'Buzzin Burgers',
  'Shalimar Kabab House',
  'Bezoria - Duluth',
  'Bezoria - Cumberland',
  "Ibu's Kitchen",
  'Craft Burger By Shane Old Milton',
  'Craft Burger by Shane North Main',
  'Craft Burger By Shane Jones Bridgen',
  'Sauce Wing Co',
  'Diyar Al Yemen restaurant',
  'Wimal Authentic Thai Food',
  'RUCHI Bangladeshi Cuisine',
  'Arhiboo Shawarma',
  'Al-Sultan Mediterranean food (Halal)',
  'Wings 2 Go (Halal Kitchen)',
  'Mint Chinese & Thai Cuisine',
  'Mazaj Atlanta',
  'Sahirah Kebab & Curry',
  'Sahirah Kebab & Curry - Peachtree Corners',
  'The Shawarma Spot',
  'Kabab Hut',
  "Kay's Pizza BBQ & Wings حلال",
  "Mi Pizza (Norcross حلال)",
  "Mi Pizza (Doraville حلال)",
  "Purnima Bangladeshi Cuisine",
  "Hook's Catch Seafood and Wings - Atlanta",
  "Desi District",
  "Zafron Restaurant",
  "The Halal Guys - Dunwoody",
  "Incredible Burger",
  "Falafel Cafe",
  "Kabobwich",
  "DiBar Grill",
  "Darbar Halal Restaurant",
  "Louisiana Famous Fried Chicken-Halal Food",
  "Noosh Kitchen",
  'Adriatic Grill | Mediterranean Restaurant',
  '98K - Fried Chicken & Sandwiches',
  'Kabab King',
  'Q Korean Steakhouse',
  'Yalda',
  "Jay's Deli",
  'Naan N Curry',
  'DESI STREET - Flavour of India',
  'Kakatiya Indian Kitchen',
  'Zyka',
  'Chutney Express',
  "Chick'nCone",
  "Khan's Halal Food (Truck)",
  "MRR's Deli",
  "Gas Bros Hot Foods",
];

async function main() {
  try {
    console.log(chalk.cyan('\nGetting all restaurants from production database...'));
    console.log(chalk.gray(`Using environment: ${envFile}\n`));

    // Get all restaurants from production
    const prodRestaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' }
    });

    // Print all restaurant names and the total count for debugging
    console.log('\nAll restaurant names fetched from production:');
    for (const prod of prodRestaurants) {
      console.log(`${prod.name}`);
    }
    console.log(`\nTotal fetched from production: ${prodRestaurants.length}\n`);

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