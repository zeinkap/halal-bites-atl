import { PrismaClient, CuisineType, PriceRange } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProd() {
  try {
    console.log('Starting production database seeding...');

    // Delete all existing comments first
    await prisma.comment.deleteMany({});
    console.log('Cleared existing comments');

    // Delete all existing restaurants
    await prisma.restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Add all restaurants
    const restaurants = [
      {
        id: '1',
        name: 'Shawarma Press - Johns Creek',
        cuisine: CuisineType.MIDDLE_EASTERN,
        address: '11035 Medlock Bridge Rd #50, Johns Creek, GA 30097',
        description: 'The go-to place for authentic and innovative shawarma, a symbol of modern, fast, fresh, and tasty Mediterranean Eatery offering flavorful Shawarma and Mediterranean food using premium beef, all-natural chicken and made from scratch falafels and Hummus!',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '2',
        name: 'Kimchi Red - Alpharetta',
        cuisine: CuisineType.OTHER,
        address: '3630 Old Milton Pkwy #110, Alpharetta, GA 30005',
        description: 'Authentic Korean halal restaurant serving a variety of Korean dishes including bulgogi, bibimbap, and their signature kimchi dishes.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '3',
        name: "Olomi's Grill",
        cuisine: CuisineType.AFGHAN,
        address: '11670 Jones Bridge Rd suite a, Johns Creek, GA 30005',
        description: 'Traditional Afghan cuisine featuring kabobs, rice dishes, and freshly baked naan. Known for their authentic flavors and warm hospitality.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '4',
        name: "Aachi's Indian Restaurant and Bakery",
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '11550 Jones Bridge Rd #14, Johns Creek, GA 30022',
        description: 'Authentic Indian cuisine and fresh bakery items. Famous for their biryanis, curries, and freshly baked bread. Also offers a variety of Indian sweets and snacks.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: false,
      },
      {
        id: '5',
        name: 'Spices Hut Food Court',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '4150 Old Milton Pkwy #134, Alpharetta, GA 30005',
        description: 'A vibrant food court offering a diverse selection of Indian and Pakistani dishes. Known for their street food, chaat, and authentic regional specialties.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: false,
      },
      {
        id: '6',
        name: 'Pista House Alpharetta',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '5530 Windward Pkwy, Alpharetta, GA 30004',
        description: 'Famous for their Hyderabadi biryani and Indian cuisine. Offers a wide variety of vegetarian and non-vegetarian dishes, known for authentic flavors and generous portions.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '7',
        name: 'Namak',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '5220 McGinnis Ferry Rd, Alpharetta, GA 30005',
        description: 'Modern Indian dining experience offering innovative takes on traditional dishes. Known for their sophisticated ambiance and contemporary interpretation of classic flavors.',
        priceRange: PriceRange.HIGH,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '8',
        name: 'Biryani House Atlanta',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '3455 Peachtree Pkwy #201, Suwanee, GA 30024',
        description: 'Specializing in authentic biryani dishes from various regions of India. Offering a wide variety of flavorful rice dishes, curries, and traditional Indian specialties.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '9',
        name: 'Al Zein Shawarma & Mediterranean Grill',
        cuisine: CuisineType.MEDITERRANEAN,
        address: '11875 Jones Bridge Rd Suite F, Alpharetta, GA 30005',
        description: 'Authentic Mediterranean and Middle Eastern cuisine featuring fresh shawarma, falafel, and grilled specialties. Known for their generous portions and homemade sauces.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '10',
        name: 'Kimchi Red - Johns Creek',
        cuisine: CuisineType.OTHER,
        address: '3651 Peachtree Pkwy Suite D, Suwanee, GA 30024',
        description: 'Authentic Korean halal cuisine offering a delightful mix of traditional Korean dishes with a halal twist. Famous for their Korean BBQ and signature kimchi dishes.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '11',
        name: 'Cafe Efendi Mediterranean Restaurant',
        cuisine: CuisineType.MEDITERRANEAN,
        address: '488 N Main St, Alpharetta, GA 30009',
        description: 'Elegant Mediterranean dining featuring Turkish and Mediterranean specialties. Known for their authentic dishes, fresh ingredients, and warm hospitality.',
        priceRange: PriceRange.HIGH,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '12',
        name: 'Karachi Broast & Grill',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '11235 Alpharetta Hwy #140, Roswell, GA 30076',
        description: 'Authentic Pakistani cuisine specializing in broasted chicken and traditional grilled items. Famous for their unique spice blends and authentic flavors.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: true,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '13',
        name: 'Zyka: The Taste | Indian Restaurant | Decatur',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '1677 Scott Blvd, Decatur, GA 30033',
        description: 'A Decatur institution serving authentic Indian cuisine since 1997. Known for their signature dishes, fresh tandoor items, and extensive vegetarian options.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '14',
        name: 'The Halal Guys',
        cuisine: CuisineType.MIDDLE_EASTERN,
        address: '4929 Buford Hwy NE, Chamblee, GA 30341',
        description: 'Famous New York-based halal food chain known for their platters, gyros, and signature white sauce. Serving generous portions of Middle Eastern and Mediterranean favorites.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '15',
        name: "Khan's Kitchen",
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: '5310 Windward Pkwy suite d, Alpharetta, GA 30004',
        description: 'Family-owned restaurant serving authentic Indian and Pakistani cuisine. Known for their fresh, made-to-order dishes and traditional recipes passed down through generations.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '16',
        name: 'Shibam Coffee',
        cuisine: CuisineType.CAFE,
        address: '4000 North Point Pkwy Suite #900, Alpharetta, GA 30022',
        description: 'A cozy Muslim-owned coffee shop offering specialty coffee drinks, teas, and light refreshments in a welcoming atmosphere. Perfect spot for work, study, or casual meetups.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Cafe+Image',
        hasPrayerRoom: true,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: false,
      },
      {
        id: '17',
        name: 'MOTW Coffee and Pastries',
        cuisine: CuisineType.CAFE,
        address: '5202 McGinnis Ferry Rd, Alpharetta, GA 30005',
        description: 'Modern coffee shop serving artisanal coffee and freshly baked pastries. Known for their unique blend of traditional and contemporary flavors, creating a perfect fusion of taste and ambiance.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Cafe+Image',
        hasPrayerRoom: true,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '18',
        name: '967 Coffee Co',
        cuisine: CuisineType.CAFE,
        address: '11235 Alpharetta Hwy Suite 136, Roswell, GA 30076',
        description: 'A community-focused coffee shop offering premium coffee beverages, fresh pastries, and a warm, inviting space. Perfect for coffee enthusiasts seeking quality brews in a relaxed setting.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Cafe+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: true,
        hasHighChair: true,
      },
      {
        id: '19',
        name: 'Baladi Coffee',
        cuisine: CuisineType.CAFE,
        address: '3061 George Busbee Pkwy NW suite 2000, Kennesaw, GA 30144',
        description: 'Experience authentic Middle Eastern coffee culture with a modern twist. Serving specialty Arabic coffee, traditional treats, and contemporary cafe favorites in a welcoming environment.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Cafe+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: false,
      },
      {
        id: '20',
        name: 'Mukja Korean Fried Chicken',
        cuisine: CuisineType.OTHER,
        address: '933 Peachtree St NE, Atlanta, GA 30309',
        description: 'Korean fusion restaurant specializing in halal Korean fried chicken with various flavors and sauces.',
        priceRange: PriceRange.MEDIUM,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '21',
        name: 'Baraka Shawarma Atlanta',
        cuisine: CuisineType.MIDDLE_EASTERN,
        address: '68 Walton St NW, Atlanta, GA 30303',
        description: 'Middle Eastern quick-service restaurant known for their authentic shawarma and falafel.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: false,
      },
      {
        id: '22',
        name: 'Botiwalla by Chai Pani',
        cuisine: CuisineType.INDIAN_PAKISTANI,
        address: 'Ponce City Market, 675 Ponce De Leon Ave NE n134, Atlanta, GA 30308',
        description: 'Modern Indian street food restaurant offering a contemporary take on traditional dishes.',
        priceRange: PriceRange.LOW,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: true,
        isZabiha: false,
        hasHighChair: true,
      },
      {
        id: '23',
        name: "Dantanna's",
        cuisine: CuisineType.OTHER,
        address: '3400 Around Lenox Rd NE #304, Atlanta, GA 30326',
        description: 'Upscale sports bar and restaurant offering halal options on their menu.',
        priceRange: PriceRange.HIGH,
        imageUrl: 'https://placehold.co/800x600/orange/white?text=Restaurant+Image',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: true,
        hasHighChair: true,
      }
    ];

    // Create all restaurants
    await prisma.restaurant.createMany({
      data: restaurants.map(restaurant => ({
        ...restaurant,
        cuisineType: restaurant.cuisine
      })),
      skipDuplicates: true,
    });

    console.log(`Successfully seeded ${restaurants.length} restaurants`);
  } catch (error) {
    console.error('Error seeding production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProd(); 