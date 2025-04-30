import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load production environment variables
dotenv.config({ path: '.env.production' });

if (!process.env.DATABASE_URL) {
  throw new Error('Production DATABASE_URL is not set in .env.production');
}

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
    .replace(/['']/g, "'")  // Normalize different types of apostrophes
    .replace(/[^a-z0-9]/g, '');  // Remove all non-alphanumeric characters
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
  'Karachi Broast & Grill',
  'Zyka: The Taste | Indian Restaurant | Decatur',
  'The Halal Guys',
  "Khan's Kitchen",
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
  'Al Madina Grocery & Restaurant',
  'Chinese Dhaba',
  'Star Pizza',
  'PONKO Chicken - Alpharetta',
  'Express Burger & Grill',
  'Moctezuma Mexican Grill',
  'Adana Mediterranean Grill',
  'Dil Bahar Cafe & Market',
  'Briskfire BBQ',
  'Stone Creek Halal Pizza',
  'Salsa Taqueria & Wings',
  'Auntie Vees Kitchen',
  'Springreens at Community Cafe',
  'Mukja Korean Fried Chicken',
  'Baraka Shawarma Atlanta',
  'Botiwalla by Chai Pani',
  "Dantanna's",
  'Jaffa Restaurant Atl (Halal)',
  'Talkin\' Tacos Buckhead',
  'Ariana Kabob House',
  'Hyderabad House Atlanta - Biryani Place',
  'Asma\'s Cuisine',
  'Three Buddies',
  'Alif Cafe',
  'NaanStop',
  'Mashawi Mediterranean',
  'Laghman Express',
  'Kabob Land',
  'Ali N\' One Zabiha Halal Kitchen',
  'Nature Village Restaurant',
  'Halal Pizza and cafe',
  'Bawarchi Biryanis Atlanta',
  'Shah\'s Halal Food',
  'Lahore Grill',
  'AZ Pizza, Wings & Fish (Halal)',
  'Scoville Hot Chicken - Buckhead'
];

async function main() {
  try {
    console.log('Fetching restaurants from production database...');
    const prodRestaurants = await prisma.restaurant.findMany({
      select: {
        name: true,
        cuisineType: true,
        address: true,
        description: true,
        priceRange: true,
        hasPrayerRoom: true,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
        servesAlcohol: true,
        isFullyHalal: true,
        imageUrl: true
      }
    });

    console.log(`\nFound ${prodRestaurants.length} restaurants in production database`);
    console.log(`${seedRestaurants.length} restaurants in seed file`);

    // Find restaurants in production but not in seed
    console.log('\nRestaurants in production but not in seed file:');
    const missingFromSeed = prodRestaurants.filter(
      restaurant => !seedRestaurants.some(seedName => 
        normalizeString(seedName) === normalizeString(restaurant.name)
      )
    );

    if (missingFromSeed.length === 0) {
      console.log('No missing restaurants found in production.');
    } else {
      console.log(`Found ${missingFromSeed.length} restaurants that need to be added to seed file:`);
      missingFromSeed.forEach(restaurant => {
        console.log('\n---');
        console.log(`Restaurant: ${restaurant.name}`);
        console.log('Details:');
        console.log(JSON.stringify(restaurant, null, 2));
        
        // Print the restaurant entry in seed.ts format
        console.log('\nSeed entry:');
        console.log(`    await upsertRestaurant('${restaurant.name}', {`);
        console.log(`      name: '${restaurant.name}',`);
        console.log(`      cuisineType: CuisineType.${restaurant.cuisineType},`);
        console.log(`      address: '${restaurant.address}',`);
        console.log(`      description: '${(restaurant.description || '').replace(/'/g, "\\'")}',`);
        console.log(`      priceRange: PriceRange.${restaurant.priceRange},`);
        console.log(`      hasPrayerRoom: ${restaurant.hasPrayerRoom},`);
        console.log(`      hasOutdoorSeating: ${restaurant.hasOutdoorSeating},`);
        console.log(`      isZabiha: ${restaurant.isZabiha},`);
        console.log(`      hasHighChair: ${restaurant.hasHighChair},`);
        console.log(`      servesAlcohol: ${restaurant.servesAlcohol},`);
        console.log(`      isFullyHalal: ${restaurant.isFullyHalal},`);
        console.log(`      imageUrl: '${restaurant.imageUrl}'`);
        console.log('    });');
      });
    }

    // Find restaurants in seed but not in production
    console.log('\nRestaurants in seed file but not in production:');
    const missingFromProd = seedRestaurants.filter(
      seedName => !prodRestaurants.some(restaurant => 
        normalizeString(restaurant.name) === normalizeString(seedName)
      )
    );

    if (missingFromProd.length === 0) {
      console.log('No missing restaurants found in seed file.');
    } else {
      console.log(`Found ${missingFromProd.length} restaurants that are in seed but not in production:`);
      missingFromProd.forEach(name => {
        console.log(`- ${name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main(); 