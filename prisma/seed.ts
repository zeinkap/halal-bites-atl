import { PrismaClient, CuisineType, PriceRange, Prisma, Restaurant } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Helper function to identify test restaurants
function isTestRestaurant(name: string): boolean {
  // Test restaurants have timestamps and UUIDs in their names
  // Pattern: "Test Restaurant {timestamp}-{uuid}" or "Duplicate Restaurant {timestamp}-{uuid}"
  return /^(Test|Duplicate) Restaurant \d+-[\w-]+$/.test(name);
}

async function main() {
  try {
    console.log(`Starting database seed... (${process.env.NODE_ENV || 'development'} environment)`);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors: Array<{ id: string; error: Error | Prisma.PrismaClientKnownRequestError }> = [];

    // Helper function to handle restaurant upsert
    async function upsertRestaurant(name: string, data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) {
      // Skip test restaurants in production
      if (process.env.NODE_ENV === 'production' && isTestRestaurant(name)) {
        console.log(`⚠ Skipping test restaurant in production: ${name}`);
        skippedCount++;
        return;
      }

      try {
        const id = createId();
        await prisma.restaurant.upsert({
          where: { name },
          update: data,     // Update with the new data if record exists
          create: { ...data, id },
        });
        successCount++;
        console.log(`✓ Successfully upserted restaurant: ${name}`);
      } catch (error) {
        errorCount++;
        errors.push({ id: name, error: error as Error | Prisma.PrismaClientKnownRequestError });
        console.error(`✗ Failed to upsert restaurant ${name}:`, error instanceof Prisma.PrismaClientKnownRequestError ? `[${error.code}] ${error.message}` : error);
      }
    }

    // Add sample restaurants
    await upsertRestaurant('Shawarma Press - Johns Creek', {
      name: 'Shawarma Press - Johns Creek',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '11035 Medlock Bridge Rd #50, Johns Creek, GA 30097',
      description: 'The go-to place for authentic and innovative shawarma, a symbol of modern, fast, fresh, and tasty Mediterranean Eatery offering flavorful Shawarma and Mediterranean food using premium beef, all-natural chicken and made from scratch falafels and Hummus!',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Kimchi Red - Alpharetta', {
      name: 'Kimchi Red - Alpharetta',
      cuisineType: CuisineType.OTHER,
      address: '3630 Old Milton Pkwy #110, Alpharetta, GA 30005',
      description: 'Authentic Korean halal restaurant serving a variety of Korean dishes including bulgogi, bibimbap, and their signature kimchi dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant("Olomi's Grill", {
      name: "Olomi's Grill",
      cuisineType: CuisineType.AFGHAN,
      address: '11670 Jones Bridge Rd suite a, Johns Creek, GA 30005',
      description: 'Traditional Afghan cuisine featuring kabobs, rice dishes, and freshly baked naan. Known for their authentic flavors and warm hospitality.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Spices Hut Food Court', {
      name: 'Spices Hut Food Court',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4150 Old Milton Pkwy #134, Alpharetta, GA 30005',
      description: 'A vibrant food court offering a diverse selection of Indian and Pakistani dishes. Known for their street food, chaat, and authentic regional specialties.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Pista House Alpharetta', {
      name: 'Pista House Alpharetta',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5530 Windward Pkwy, Alpharetta, GA 30004',
      description: 'Famous for their Hyderabadi biryani and Indian cuisine. Offers a wide variety of vegetarian and non-vegetarian dishes, known for authentic flavors and generous portions.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Namak', {
      name: 'Namak',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5220 McGinnis Ferry Rd, Alpharetta, GA 30005',
      description: 'Modern Indian dining experience offering innovative takes on traditional dishes. Known for their sophisticated ambiance and contemporary interpretation of classic flavors.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Biryani House Atlanta', {
      name: 'Biryani House Atlanta',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '3455 Peachtree Pkwy #201, Suwanee, GA 30024',
      description: 'Specializing in authentic biryani dishes from various regions of India. Offering a wide variety of flavorful rice dishes, curries, and traditional Indian specialties.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Al Zein Shawarma & Mediterranean Grill', {
      name: 'Al Zein Shawarma & Mediterranean Grill',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '11875 Jones Bridge Rd Suite F, Alpharetta, GA 30005',
      description: 'Authentic Mediterranean and Middle Eastern cuisine featuring fresh shawarma, falafel, and grilled specialties. Known for their generous portions and homemade sauces.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Kimchi Red - Johns Creek', {
      name: 'Kimchi Red - Johns Creek',
      cuisineType: CuisineType.OTHER,
      address: '3651 Peachtree Pkwy Suite D, Suwanee, GA 30024',
      description: 'Authentic Korean halal cuisine offering a delightful mix of traditional Korean dishes with a halal twist. Famous for their Korean BBQ and signature kimchi dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Cafe Efendi Mediterranean Restaurant', {
      name: 'Cafe Efendi Mediterranean Restaurant',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '488 N Main St, Alpharetta, GA 30009',
      description: 'Elegant Mediterranean dining featuring Turkish and Mediterranean specialties. Known for their authentic dishes, fresh ingredients, and warm hospitality.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Karachi Broast & Grill', {
      name: 'Karachi Broast & Grill',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '11235 Alpharetta Hwy #140, Roswell, GA 30076',
      description: 'Authentic Pakistani cuisine specializing in broasted chicken and traditional grilled items. Famous for their unique spice blends and authentic flavors.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: true,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Zyka: The Taste | Indian Restaurant | Decatur', {
      name: 'Zyka: The Taste | Indian Restaurant | Decatur',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '1677 Scott Blvd, Decatur, GA 30033',
      description: 'A Decatur institution serving authentic Indian cuisine since 1997. Known for their signature dishes, fresh tandoor items, and extensive vegetarian options.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('The Halal Guys', {
      name: 'The Halal Guys',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '4929 Buford Hwy NE, Chamblee, GA 30341',
      description: 'Famous New York-based halal food chain known for their platters, gyros, and signature white sauce. Serving generous portions of Middle Eastern and Mediterranean favorites.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant("Khan's Kitchen", {
      name: "Khan's Kitchen",
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5310 Windward Pkwy suite d, Alpharetta, GA 30004',
      description: 'Family-owned restaurant serving authentic Indian and Pakistani cuisine. Known for their fresh, made-to-order dishes and traditional recipes passed down through generations.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    // Now adding the cafes...
    await upsertRestaurant('Shibam Coffee', {
      name: 'Shibam Coffee',
      cuisineType: CuisineType.CAFE,
      address: '4000 North Point Pkwy Suite #900, Alpharetta, GA 30022',
      description: 'A cozy Muslim-owned coffee shop offering specialty coffee drinks, teas, and light refreshments in a welcoming atmosphere. Perfect spot for work, study, or casual meetups.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: true,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('MOTW Coffee and Pastries', {
      name: 'MOTW Coffee and Pastries',
      cuisineType: CuisineType.CAFE,
      address: '5202 McGinnis Ferry Rd, Alpharetta, GA 30005',
      description: 'Modern coffee shop serving artisanal coffee and freshly baked pastries. Known for their unique blend of traditional and contemporary flavors, creating a perfect fusion of taste and ambiance.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: true,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: true,
      zabihaLamb: false,
      zabihaBeef: true,
      zabihaGoat: false,
      zabihaVerified: new Date('2025-04-30'),
      zabihaVerifiedBy: 'Mudassir Uddin'
    });

    await upsertRestaurant('967 Coffee Co', {
      name: '967 Coffee Co',
      cuisineType: CuisineType.CAFE,
      address: '11235 Alpharetta Hwy Suite 136, Roswell, GA 30076',
      description: 'A community-focused coffee shop offering premium coffee beverages, fresh pastries, and a warm, inviting space. Perfect for coffee enthusiasts seeking quality brews in a relaxed setting.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Baladi Coffee', {
      name: 'Baladi Coffee',
      cuisineType: CuisineType.CAFE,
      address: '3061 George Busbee Pkwy NW suite 2000, Kennesaw, GA 30144',
      description: 'Experience authentic Middle Eastern coffee culture with a modern twist. Serving specialty Arabic coffee, traditional treats, and contemporary cafe favorites in a welcoming environment.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Jerusalem Bakery & Grill', {
      name: 'Jerusalem Bakery & Grill',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '585 Franklin Gateway SE, Marietta, GA 30067',
      description: 'Authentic Middle Eastern bakery and grill.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Bismillah Cafe', {
      name: 'Bismillah Cafe',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4022 Buford Hwy NE, Atlanta, GA 30345',
      description: 'Traditional Indian and Pakistani cuisine.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Merhaba Shawarma', {
      name: 'Merhaba Shawarma',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '2960 Buford Hwy NE, Atlanta, GA 30329',
      description: 'Mediterranean street food with authentic shawarma and falafel.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Delbar - Old Milton', {
      name: 'Delbar - Old Milton',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '5486 Chamblee Dunwoody Rd, Atlanta, GA 30338',
      description: 'Modern Middle Eastern cuisine with a contemporary twist.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Sabri Kabab House', {
      name: 'Sabri Kabab House',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '2895 N Decatur Rd, Decatur, GA 30033',
      description: 'Authentic Pakistani grilled specialties and curries.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Al-Amin Supermarket & Restaurant', {
      name: 'Al-Amin Supermarket & Restaurant',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '3675 Satellite Blvd, Duluth, GA 30096',
      description: 'Combination grocery store and restaurant serving authentic South Asian cuisine.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('ZamZam Halal Supermarket & Restaurant', {
      name: 'ZamZam Halal Supermarket & Restaurant',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4027 Buford Hwy NE, Atlanta, GA 30345',
      description: 'Grocery store with a restaurant serving fresh Indian and Pakistani dishes.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Kabul Kabob', {
      name: 'Kabul Kabob',
      cuisineType: CuisineType.AFGHAN,
      address: '3125 Peachtree Industrial Blvd, Duluth, GA 30097',
      description: 'Authentic Afghan cuisine and grilled specialties.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Al Madina Grocery & Restaurant', {
      name: 'Al Madina Grocery & Restaurant',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5290 Jimmy Carter Blvd, Norcross, GA 30093',
      description: 'Grocery store with authentic restaurant.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Chinese Dhaba', {
      name: 'Chinese Dhaba',
      cuisineType: CuisineType.CHINESE,
      address: '1713 Church St, Decatur, GA 30033',
      description: 'Indo-Chinese fusion cuisine.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Star Pizza', {
      name: 'Star Pizza',
      cuisineType: CuisineType.FAST_FOOD,
      address: '2200 Lawrenceville Hwy, Decatur, GA 30033',
      description: 'Halal pizza and wings.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('PONKO Chicken - Alpharetta', {
      name: 'PONKO Chicken - Alpharetta',
      cuisineType: CuisineType.FAST_FOOD,
      address: '2100 Ray\'s Way, Alpharetta, GA 30009',
      description: 'Japanese-inspired chicken restaurant.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Express Burger & Grill', {
      name: 'Express Burger & Grill',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '2100 Pleasant Hill Rd, Duluth, GA 30096',
      description: 'Mediterranean grill with burgers.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Moctezuma Mexican Grill', {
      name: 'Moctezuma Mexican Grill',
      cuisineType: CuisineType.MEXICAN,
      address: '6450 Powers Ferry Rd, Sandy Springs, GA 30339',
      description: 'Mexican grill with halal options.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Adana Mediterranean Grill', {
      name: 'Adana Mediterranean Grill',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '4500 Satellite Blvd, Duluth, GA 30096',
      description: 'Turkish and Mediterranean cuisine.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Dil Bahar Cafe & Market', {
      name: 'Dil Bahar Cafe & Market',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4030 Jimmy Carter Blvd, Norcross, GA 30093',
      description: 'Indian and Pakistani cafe with market.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Briskfire BBQ', {
      name: 'Briskfire BBQ',
      cuisineType: CuisineType.OTHER,
      address: '2100 Roswell Rd, Marietta, GA 30062',
      description: 'Halal BBQ restaurant.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Stone Creek Halal Pizza', {
      name: 'Stone Creek Halal Pizza',
      cuisineType: CuisineType.FAST_FOOD,
      address: '5370 Stone Creek Pkwy, Atlanta, GA 30331',
      description: 'Halal pizza restaurant.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Salsa Taqueria & Wings', {
      name: 'Salsa Taqueria & Wings',
      cuisineType: CuisineType.MEXICAN,
      address: '2730 Buford Hwy NE, Atlanta, GA 30324',
      description: 'Mexican restaurant with halal wings.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Auntie Vees Kitchen', {
      name: 'Auntie Vees Kitchen',
      cuisineType: CuisineType.OTHER,
      address: '4650 Jimmy Carter Blvd, Norcross, GA 30093',
      description: 'Home-style halal cooking.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Springreens at Community Cafe', {
      name: 'Springreens at Community Cafe',
      cuisineType: CuisineType.CAFE,
      address: '1110 West Peachtree St NW, Atlanta, GA 30309',
      description: 'Community cafe with halal options.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Mukja Korean Fried Chicken', {
      name: 'Mukja Korean Fried Chicken',
      cuisineType: CuisineType.OTHER,
      address: '933 Peachtree St NE, Atlanta, GA 30309',
      description: 'Korean fried chicken restaurant.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Baraka Shawarma Atlanta', {
      name: 'Baraka Shawarma Atlanta',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '3529 Buford Hwy NE, Atlanta, GA 30329',
      description: 'Middle Eastern shawarma restaurant.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Botiwalla by Chai Pani', {
      name: 'Botiwalla by Chai Pani',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '675 Ponce De Leon Ave NE, Atlanta, GA 30308',
      description: 'Modern Indian street food.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Dantanna\'s', {
      name: 'Dantanna\'s',
      cuisineType: CuisineType.OTHER,
      address: '3400 Around Lenox Rd NE, Atlanta, GA 30326',
      description: 'Upscale sports bar with halal options.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Jaffa Restaurant Atl (Halal)', {
      name: 'Jaffa Restaurant Atl (Halal)',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '2200 Peachtree Rd NW, Atlanta, GA 30309',
      description: 'Mediterranean cuisine with authentic flavors.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Talkin\' Tacos Buckhead', {
      name: 'Talkin\' Tacos Buckhead',
      cuisineType: CuisineType.MEXICAN,
      address: '3167 Peachtree Rd NE, Atlanta, GA 30305',
      description: 'Mexican street tacos with halal options.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Ariana Kabob House', {
      name: 'Ariana Kabob House',
      cuisineType: CuisineType.AFGHAN,
      address: '2870 Peachtree Industrial Blvd, Duluth, GA 30097',
      description: 'Authentic Afghan restaurant specializing in traditional kabobs, rice dishes, and Afghan specialties. Known for their quality meats and generous portions.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Hyderabad House Atlanta - Biryani Place', {
      name: 'Hyderabad House Atlanta - Biryani Place',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '130 Perimeter Center Pl, Dunwoody, GA 30346',
      description: 'Authentic Hyderabadi restaurant specializing in various styles of biryani and Indian cuisine. Known for their traditional recipes and flavorful dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Asma\'s Cuisine', {
      name: 'Asma\'s Cuisine',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '3099 Breckinridge Blvd #114b, Duluth, GA 30096',
      description: 'Family-owned restaurant serving authentic Pakistani and Indian dishes. Known for their home-style cooking and traditional recipes.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Three Buddies', {
      name: 'Three Buddies',
      cuisineType: CuisineType.FAST_FOOD,
      address: '4966 Buford Hwy NE, Chamblee, GA 30341',
      description: 'Quality fresh food at a resonable price. Offers burgers, sandwiches, wings, nachos, and more.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Alif Cafe', {
      name: 'Alif Cafe',
      cuisineType: CuisineType.OTHER,
      address: '4301 Buford Hwy NE, Atlanta, GA 30345',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('NaanStop', {
      name: 'NaanStop',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '64 Broad St NW, Atlanta, GA 30303',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Mashawi Mediterranean', {
      name: 'Mashawi Mediterranean',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '850 Mansell Rd, Roswell, GA 30076',
      description: '',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Laghman Express', {
      name: 'Laghman Express',
      cuisineType: CuisineType.OTHER,
      address: '3070 Windward Plaza x1, Alpharetta, GA 30005, USA',
      description: '',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Kabob Land', {
      name: 'Kabob Land',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '3137 Piedmont Rd NE, Atlanta, GA 30305',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Ali N\' One Zabiha Halal Kitchen', {
      name: 'Ali N\' One Zabiha Halal Kitchen',
      cuisineType: CuisineType.FAST_FOOD,
      address: '5382 Buford Hwy NE, Doraville, GA 30340',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Nature Village Restaurant', {
      name: 'Nature Village Restaurant',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '302 Satellite Blvd NE STE 125, Suwanee, GA 30024',
      description: '',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Halal Pizza and cafe', {
      name: 'Halal Pizza and cafe',
      cuisineType: CuisineType.FAST_FOOD,
      address: '420 N Indian Creek Dr, Clarkston, GA 30021',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Bawarchi Biryanis Atlanta', {
      name: 'Bawarchi Biryanis Atlanta',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '6627-A Roswell Rd NE, Sandy Springs, GA 30328',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Shah\'s Halal Food', {
      name: 'Shah\'s Halal Food',
      cuisineType: CuisineType.FAST_FOOD,
      address: '5450 Peachtree Pkwy NW, Peachtree Corners, GA 30092',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Lahore Grill', {
      name: 'Lahore Grill',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '1869 Cobb Pkwy Suite#150, Marietta, GA 30060',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('AZ Pizza, Wings & Fish (Halal)', {
      name: 'AZ Pizza, Wings & Fish (Halal)',
      cuisineType: CuisineType.FAST_FOOD,
      address: '855 S Cobb Dr SE, Marietta, GA 30060',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Scoville Hot Chicken - Buckhead', {
      name: 'Scoville Hot Chicken - Buckhead',
      cuisineType: CuisineType.FAST_FOOD,
      address: '3420 Piedmont Rd NE Unit B, Atlanta, GA 30305',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });
    
    await upsertRestaurant('Desi Spice', {
      name: 'Desi Spice',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '1248 Clairmont Rd, Decatur, GA 30030',
      description: 'Authentic Indian and Pakistani cuisine with a modern twist.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Pita Palace Mediterranean Grill', {
      name: 'Pita Palace Mediterranean Grill',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '4800 Briarcliff Rd NE, Atlanta, GA 30345',
      description: 'Mediterranean grill offering fresh pitas, shawarma, and falafel.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Karachi Grill & BBQ', {
      name: 'Karachi Grill & BBQ',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '1960 Day Dr SW, Atlanta, GA 30331',
      description: 'Pakistani BBQ restaurant specializing in grilled meats and traditional dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Halal Guys - Midtown', {
      name: 'Halal Guys - Midtown',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '95 8th St NW, Atlanta, GA 30309',
      description: 'Famous New York-based halal food chain known for their platters and sandwiches.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Chai Pani', {
      name: 'Chai Pani',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '406 W Ponce de Leon Ave, Decatur, GA 30030',
      description: 'Modern Indian street food restaurant with creative takes on traditional dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Rumi\'s Kitchen - Sandy Springs', {
      name: 'Rumi\'s Kitchen - Sandy Springs',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '6112 Roswell Rd, Atlanta, GA 30328',
      description: 'Upscale Persian restaurant known for their kabobs and rice dishes.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: true,
      isFullyHalal: false,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Cafe Istanbul', {
      name: 'Cafe Istanbul',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '1850 Lawrenceville Hwy, Decatur, GA 30033',
      description: 'Authentic Turkish cuisine with a cozy atmosphere.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    await upsertRestaurant('Mediterranean Grill - Decatur', {
      name: 'Mediterranean Grill - Decatur',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '1394 Church St, Decatur, GA 30030',
      description: 'Mediterranean restaurant serving authentic halal dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true,
      isZabiha: false,
      imageUrl: '/images/logo.png',
      zabihaChicken: false,
      zabihaLamb: false,
      zabihaBeef: false,
      zabihaGoat: false,
      zabihaVerified: null,
      zabihaVerifiedBy: null
    });

    // Note: This section is for manually verified restaurants only.
    // UI-added restaurants should NOT be added here - they are stored in the database only.
    // This file is for maintaining a backup of verified restaurant data.

    // Log summary
    console.log('\nSeed Summary:');
    console.log(`Total restaurants processed: ${successCount + errorCount + skippedCount}`);
    console.log(`✓ Successful: ${successCount}`);
    if (skippedCount > 0) {
      console.log(`⚠ Skipped test restaurants: ${skippedCount}`);
    }
    if (errorCount > 0) {
      console.error(`✗ Failed: ${errorCount}`);
      console.error('\nDetailed Errors:');
      errors.forEach(({ id, error }) => {
        console.error(`Restaurant ${id}:`, error instanceof Prisma.PrismaClientKnownRequestError ? `[${error.code}] ${error.message}` : error);
      });
    }
  } catch (e) {
    console.error('\nCritical Error during seed:');
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[${e.code}] ${e.message}`);
      console.error('Details:', e.meta);
    } else if (e instanceof Error) {
      console.error(e.message);
      console.error('Stack:', e.stack);
    } else {
      console.error(e);
    }
    throw e;
  }
}

main()
  .catch((e) => {
    console.error('\nFatal Error:');
    console.error('Failed to complete database seed');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('\nClosing database connection...');
    await prisma.$disconnect();
    console.log('Seed script completed.');
  }); 