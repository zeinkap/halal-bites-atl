import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_pUj5oqMIwgJ4@ep-divine-math-a5w9i64h-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

// List of restaurant names from seed.prod.ts file
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
  'Asma\'s Cuisine'
];

async function main() {
  try {
    console.log('Fetching restaurants from production database...');
    const prodRestaurants = await prisma.restaurant.findMany({
      select: {
        name: true,
        cuisineType: true,
        address: true,
        priceRange: true,
        hasPrayerRoom: true,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
        servesAlcohol: true,
        isFullyHalal: true
      }
    });

    console.log('\nRestaurants in production but not in seed file:');
    const missingRestaurants = prodRestaurants.filter(
      restaurant => !seedRestaurants.includes(restaurant.name)
    );

    if (missingRestaurants.length === 0) {
      console.log('No missing restaurants found.');
    } else {
      missingRestaurants.forEach(restaurant => {
        console.log('\n---');
        console.log(`Restaurant: ${restaurant.name}`);
        console.log('Details:');
        console.log(JSON.stringify(restaurant, null, 2));
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 