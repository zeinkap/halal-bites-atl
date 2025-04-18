import { PrismaClient, CuisineType, PriceRange } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add sample restaurants
  await prisma.restaurant.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Shawarma Press - Johns Creek',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '11035 Medlock Bridge Rd #50, Johns Creek, GA 30097',
      description: 'The go-to place for authentic and innovative shawarma, a symbol of modern, fast, fresh, and tasty Mediterranean Eatery offering flavorful Shawarma and Mediterranean food using premium beef, all-natural chicken and made from scratch falafels and Hummus!',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Kimchi Red - Alpharetta',
      cuisineType: CuisineType.OTHER,
      address: '3630 Old Milton Pkwy #110, Alpharetta, GA 30005',
      description: 'Authentic Korean halal restaurant serving a variety of Korean dishes including bulgogi, bibimbap, and their signature kimchi dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: "Olomi's Grill",
      cuisineType: CuisineType.AFGHAN,
      address: '11670 Jones Bridge Rd suite a, Johns Creek, GA 30005',
      description: 'Traditional Afghan cuisine featuring kabobs, rice dishes, and freshly baked naan. Known for their authentic flavors and warm hospitality.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '4' },
    update: {},
    create: {
      id: '4',
      name: "Aachi's Indian Restaurant and Bakery",
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '11550 Jones Bridge Rd #14, Johns Creek, GA 30022',
      description: 'Authentic Indian cuisine and fresh bakery items. Famous for their biryanis, curries, and freshly baked bread. Also offers a variety of Indian sweets and snacks.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '5' },
    update: {},
    create: {
      id: '5',
      name: 'Spices Hut Food Court',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4150 Old Milton Pkwy #134, Alpharetta, GA 30005',
      description: 'A vibrant food court offering a diverse selection of Indian and Pakistani dishes. Known for their street food, chaat, and authentic regional specialties.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '6' },
    update: {},
    create: {
      id: '6',
      name: 'Pista House Alpharetta',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5530 Windward Pkwy, Alpharetta, GA 30004',
      description: 'Famous for their Hyderabadi biryani and Indian cuisine. Offers a wide variety of vegetarian and non-vegetarian dishes, known for authentic flavors and generous portions.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '7' },
    update: {},
    create: {
      id: '7',
      name: 'Namak',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5220 McGinnis Ferry Rd, Alpharetta, GA 30005',
      description: 'Modern Indian dining experience offering innovative takes on traditional dishes. Known for their sophisticated ambiance and contemporary interpretation of classic flavors.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '8' },
    update: {},
    create: {
      id: '8',
      name: 'Biryani House Atlanta',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '3455 Peachtree Pkwy #201, Suwanee, GA 30024',
      description: 'Specializing in authentic biryani dishes from various regions of India. Offering a wide variety of flavorful rice dishes, curries, and traditional Indian specialties.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '9' },
    update: {},
    create: {
      id: '9',
      name: 'Al Zein Shawarma & Mediterranean Grill',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '11875 Jones Bridge Rd Suite F, Alpharetta, GA 30005',
      description: 'Authentic Mediterranean and Middle Eastern cuisine featuring fresh shawarma, falafel, and grilled specialties. Known for their generous portions and homemade sauces.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '10' },
    update: {},
    create: {
      id: '10',
      name: 'Kimchi Red - Johns Creek',
      cuisineType: CuisineType.OTHER,
      address: '3651 Peachtree Pkwy Suite D, Suwanee, GA 30024',
      description: 'Authentic Korean halal cuisine offering a delightful mix of traditional Korean dishes with a halal twist. Famous for their Korean BBQ and signature kimchi dishes.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '11' },
    update: {},
    create: {
      id: '11',
      name: 'Cafe Efendi Mediterranean Restaurant',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '488 N Main St, Alpharetta, GA 30009',
      description: 'Elegant Mediterranean dining featuring Turkish and Mediterranean specialties. Known for their authentic dishes, fresh ingredients, and warm hospitality.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '12' },
    update: {},
    create: {
      id: '12',
      name: 'Karachi Broast & Grill',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '11235 Alpharetta Hwy #140, Roswell, GA 30076',
      description: 'Authentic Pakistani cuisine specializing in broasted chicken and traditional grilled items. Famous for their unique spice blends and authentic flavors.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: true,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '13' },
    update: {},
    create: {
      id: '13',
      name: 'Zyka: The Taste | Indian Restaurant | Decatur',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '1677 Scott Blvd, Decatur, GA 30033',
      description: 'A Decatur institution serving authentic Indian cuisine since 1997. Known for their signature dishes, fresh tandoor items, and extensive vegetarian options.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '14' },
    update: {},
    create: {
      id: '14',
      name: 'The Halal Guys',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '4929 Buford Hwy NE, Chamblee, GA 30341',
      description: 'Famous New York-based halal food chain known for their platters, gyros, and signature white sauce. Serving generous portions of Middle Eastern and Mediterranean favorites.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '15' },
    update: {},
    create: {
      id: '15',
      name: "Khan's Kitchen",
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5310 Windward Pkwy suite d, Alpharetta, GA 30004',
      description: 'Family-owned restaurant serving authentic Indian and Pakistani cuisine. Known for their fresh, made-to-order dishes and traditional recipes passed down through generations.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  // Now adding the cafes...
  await prisma.restaurant.upsert({
    where: { id: '16' },
    update: {},
    create: {
      id: '16',
      name: 'Shibam Coffee',
      cuisineType: CuisineType.CAFE,
      address: '4000 North Point Pkwy Suite #900, Alpharetta, GA 30022',
      description: 'A cozy Muslim-owned coffee shop offering specialty coffee drinks, teas, and light refreshments in a welcoming atmosphere. Perfect spot for work, study, or casual meetups.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: true,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '17' },
    update: {},
    create: {
      id: '17',
      name: 'MOTW Coffee and Pastries',
      cuisineType: CuisineType.CAFE,
      address: '5202 McGinnis Ferry Rd, Alpharetta, GA 30005',
      description: 'Modern coffee shop serving artisanal coffee and freshly baked pastries. Known for their unique blend of traditional and contemporary flavors, creating a perfect fusion of taste and ambiance.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: true,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '18' },
    update: {},
    create: {
      id: '18',
      name: '967 Coffee Co',
      cuisineType: CuisineType.CAFE,
      address: '11235 Alpharetta Hwy Suite 136, Roswell, GA 30076',
      description: 'A community-focused coffee shop offering premium coffee beverages, fresh pastries, and a warm, inviting space. Perfect for coffee enthusiasts seeking quality brews in a relaxed setting.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '19' },
    update: {},
    create: {
      id: '19',
      name: 'Baladi Coffee',
      cuisineType: CuisineType.CAFE,
      address: '3061 George Busbee Pkwy NW suite 2000, Kennesaw, GA 30144',
      description: 'Experience authentic Middle Eastern coffee culture with a modern twist. Serving specialty Arabic coffee, traditional treats, and contemporary cafe favorites in a welcoming environment.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '20' },
    update: {},
    create: {
      id: '20',
      name: 'Mukja Korean Fried Chicken',
      cuisineType: CuisineType.OTHER,
      address: '933 Peachtree St NE, Atlanta, GA 30309',
      description: '',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '21' },
    update: {},
    create: {
      id: '21',
      name: 'Baraka Shawarma Atlanta',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '68 Walton St NW, Atlanta, GA 30303',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '22' },
    update: {},
    create: {
      id: '22',
      name: 'Botiwalla by Chai Pani',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: 'Ponce City Market, 675 Ponce De Leon Ave NE n134, Atlanta, GA 30308',
      description: '',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '23' },
    update: {},
    create: {
      id: '23',
      name: 'Dantanna\'s',
      cuisineType: CuisineType.OTHER,
      address: '3400 Around Lenox Rd NE #304, Atlanta, GA 30326',
      description: '',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '24' },
    update: {},
    create: {
      id: '24',
      name: 'Jerusalem Bakery & Grill',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '11235 Alpharetta Hwy, Roswell, GA 30076',
      description: 'Authentic Middle Eastern bakery and restaurant known for their fresh pita bread, manakeesh, and traditional Middle Eastern dishes. Features an extensive bakery selection with fresh pastries, bread, and groceries.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '25' },
    update: {},
    create: {
      id: '25',
      name: 'Bismillah Cafe',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '4022 Buford Hwy NE, Atlanta, GA 30345',
      description: 'Popular spot for authentic Pakistani street food and traditional dishes. Known for their chai, paratha rolls, and authentic South Asian breakfast items.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '26' },
    update: {},
    create: {
      id: '26',
      name: 'Merhaba Shawarma',
      address: '2126 Pleasant Hill Rd #108, Duluth, GA 30096',
      cuisineType: CuisineType.MEDITERRANEAN,
      description: 'Authentic Mediterranean shawarma and kebab restaurant offering fresh, halal meats and homemade sauces.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: true,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '27' },
    update: {},
    create: {
      id: '27',
      name: 'Delbar - Old Milton',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '4120 Old Milton Pkwy, Alpharetta, GA 30005',
      description: 'Modern Middle Eastern restaurant offering a fresh take on traditional dishes. Features family-style dining with an emphasis on Persian and Mediterranean flavors.',
      priceRange: PriceRange.HIGH,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '28' },
    update: {},
    create: {
      id: '28',
      name: 'Sufi\'s Kitchen',
      cuisineType: CuisineType.PERSIAN,
      address: '1814 Peachtree St NE, Atlanta, GA 30309',
      description: 'Family-owned Persian restaurant specializing in authentic Iranian cuisine. Known for their kabobs, rice dishes, and traditional stews.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '29' },
    update: {},
    create: {
      id: '29',
      name: 'Sabri Kabab House',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '6075 Singleton Rd, Norcross, GA 30093',
      description: 'Traditional Indian fare & sweets in a counter-serve setup with vibrant orange walls & blue booths.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '30' },
    update: {},
    create: {
      id: '30',
      name: 'Al-Amin Supermarket & Restaurant',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5466 Buford Hwy NE, Doraville, GA 30340',
      description: 'Family-owned Bangladeshi and Indian restaurant serving authentic dishes. Known for their biryani, curries, and fresh tandoor items.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '31' },
    update: {},
    create: {
      id: '31',
      name: 'Cafe Bombay',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '2615 Briarcliff Rd NE, Atlanta, GA 30329',
      description: 'Indian restaurant serving both vegetarian and halal meat dishes. Known for their extensive menu, lunch buffet, and catering services.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '32' },
    update: {},
    create: {
      id: '32',
      name: 'ZamZam Halal Supermarket & Restaurant',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5432 Buford Hwy NE, Doraville, GA 30340',
      description: 'Authentic Pakistani and Indian cuisine serving traditional dishes. Known for their biryani, kebabs, and fresh naan bread.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '33' },
    update: {},
    create: {
      id: '33',
      name: 'Kabul Kabob',
      cuisineType: CuisineType.AFGHAN,
      address: '1475 Holcomb Bridge Rd, Roswell, GA 30076',
      description: 'Afghan restaurant specializing in authentic kabobs, rice dishes, and traditional Afghan cuisine. Features fresh-baked Afghan bread.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '34' },
    update: {},
    create: {
      id: '34',
      name: 'Al Madina Grocery & Restaurant',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '5345 Jimmy Carter Blvd suite c, Norcross, GA 30093',
      description: 'Middle Eastern restaurant and grocery store serving fresh shawarma, falafel, and grilled items. Features an in-house bakery and grocery section.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: false,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '35' },
    update: {},
    create: {
      id: '35',
      name: 'Chinese Dhaba',
      cuisineType: CuisineType.OTHER,
      address: '5675 Jimmy Carter Blvd, Norcross, GA 30071',
      description: 'Chinese halal restaurant serving authentic Chinese cuisine made with halal ingredients. Known for their hand-pulled noodles and lamb dishes.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '36' },
    update: {},
    create: {
      id: '36',
      name: 'Star Pizza',
      cuisineType: CuisineType.OTHER,
      address: '11490 Alpharetta Highway, Roswell, GA',
      description: 'Italian pizza restaurant serving halal options. Known for their pizza varieties and Italian specialties.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '37' },
    update: {},
    create: {
      id: '37',
      name: 'PONKO Chicken - Alpharetta',
      cuisineType: CuisineType.OTHER,
      address: '220 South Main Street, Alpharetta, GA',
      description: 'Japanese-American fusion restaurant specializing in halal chicken tenders with unique Asian-inspired sauces. Known for their crispy chicken and signature PONKO sauce.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '38' },
    update: {},
    create: {
      id: '38',
      name: 'Express Burger & Grill',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '7291 North Point Parkway, Alpharetta, GA',
      description: 'Mediterranean fusion restaurant offering halal burgers, grilled specialties, and Mediterranean favorites. Known for their fresh ingredients and generous portions.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '39' },
    update: {},
    create: {
      id: '39',
      name: 'Bombay Flames',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '3050 Mansell Road, Alpharetta, GA',
      description: 'Authentic Indian restaurant serving a variety of traditional dishes. Known for their flavorful curries, biryanis, and tandoor specialties.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '40' },
    update: {},
    create: {
      id: '40',
      name: 'Jerusalem Chef',
      cuisineType: CuisineType.MIDDLE_EASTERN,
      address: '10684 Alpharetta Highway, Roswell, GA',
      description: 'Authentic Middle Eastern cuisine featuring traditional dishes, fresh-baked bread, and grilled specialties. Known for their shawarma, falafel, and homemade hummus.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '41' },
    update: {},
    create: {
      id: '41',
      name: 'Gyro Café',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '869 North Main Street, Alpharetta, GA',
      description: 'Mediterranean restaurant specializing in gyros and Greek specialties. Offers a variety of halal meat options and traditional Mediterranean dishes.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '42' },
    update: {},
    create: {
      id: '42',
      name: 'India Chef',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '720 Holcomb Bridge Road, Roswell, GA',
      description: 'Traditional Indian restaurant offering a wide range of North and South Indian dishes. Known for their authentic flavors and extensive menu options.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '43' },
    update: {},
    create: {
      id: '43',
      name: 'Desi Tadka',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5250 Windward Parkway, Alpharetta, GA',
      description: 'Casual Indian eatery serving authentic desi cuisine. Features a variety of street food, curries, and Indo-Chinese fusion dishes.',
      priceRange: PriceRange.LOW,
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '44' },
    update: {},
    create: {
      id: '44',
      name: 'Loqoum Lounge',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '915 Holcomb Bridge Road, Roswell, GA',
      description: 'Turkish café and lounge offering authentic Turkish cuisine and desserts. Known for their traditional Turkish coffee, tea, and Mediterranean specialties.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '45' },
    update: {},
    create: {
      id: '45',
      name: 'Moctezuma Mexican Grill',
      cuisineType: CuisineType.OTHER,
      address: '13020 Morris Road, Alpharetta, GA',
      description: 'Mexican restaurant offering halal options. Features authentic Mexican dishes and specialties made with halal meats.',
      priceRange: PriceRange.MEDIUM,
      hasPrayerRoom: false,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
    },
  });

  await prisma.restaurant.upsert({
    where: { id: '46' },
    update: {},
    create: {
      id: '46',
      name: 'Adana Mediterranean Grill',
      cuisineType: CuisineType.MEDITERRANEAN,
      address: '585 Franklin Gateway Southeast, unit B-3, Marietta, GA 30067',
      description: 'A Turkish and Greek spot with an entirely halal menu. Choose from a selection of mezze, grilled meats, and baked foods. The adana kebap, made with ground beef and lamb, is among the best around.',
      priceRange: PriceRange.MEDIUM,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: true,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '47' },
    update: {},
    create: {
      id: '47',
      name: 'Dil Bahar Cafe & Market',
      cuisineType: CuisineType.INDIAN_PAKISTANI,
      address: '5825 Glenridge Drive Northeast, Sandy Springs, GA 30328',
      description: 'Beloved local Pakistani bakery cafe serving Karachi-style chaat, Masala fries, panipuri, and samosas. Try the chicken roll, bun kabab, or kachori with sabzi. Features desserts like shahi tukray and refreshing falooda.',
      priceRange: PriceRange.LOW,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasPrayerRoom: true,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '48' },
    update: {},
    create: {
      id: '48',
      name: 'Briskfire BBQ',
      cuisineType: CuisineType.OTHER,
      address: '900 Indian Trail Lilburn Road Northwest, Lilburn, GA 30047',
      description: 'A unique halal barbecue spot offering beef brisket and short ribs. The Lilburn restaurant is completely halal and has a robust selection of burgers, sandwiches, and smoked meats.',
      priceRange: PriceRange.MEDIUM,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: false,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '49' },
    update: {},
    create: {
      id: '49',
      name: 'Stone Creek Halal Pizza',
      cuisineType: CuisineType.OTHER,
      address: '5330 Lilburn Stone Mountain Rd #108, Lilburn, GA 30047',
      description: 'The best bet for halal pizza, subs, and wings in metro Atlanta. Try their signature spicy tandoori chicken pizza topped with green peppers, onions, and mozzarella.',
      priceRange: PriceRange.LOW,
      hasOutdoorSeating: false,
      isZabiha: true,
      hasPrayerRoom: false,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '50' },
    update: {},
    create: {
      id: '50',
      name: 'Salsa Taqueria & Wings',
      cuisineType: CuisineType.OTHER,
      address: '3799 Buford Hwy NE, Brookhaven, GA 30329',
      description: 'A counter-service taqueria serving a halal menu of Mexican-American comfort foods, including beef and chicken birria tacos, tamales, wings, tortas, and burgers. Features special weekend menu items.',
      priceRange: PriceRange.LOW,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: false,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '51' },
    update: {},
    create: {
      id: '51',
      name: 'Bibi Persian Eatery',
      address: '675 Ponce, Atlanta, GA 30308',
      cuisineType: CuisineType.PERSIAN,
      description: 'A 100% halal Persian eatery offering sandwiches and kebabs served with rice, grilled tomato, and torshi pickles. Features unique halal beverages including doogh (yogurt soda) and sharbat (homemade soda).',
      priceRange: PriceRange.MEDIUM,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: true,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '52' },
    update: {},
    create: {
      id: '52',
      name: 'Auntie Vees Kitchen',
      cuisineType: CuisineType.OTHER,
      address: '209 Edgewood Avenue Northeast, Atlanta, GA 30303',
      description: 'A fusion of soul food classics and Caribbean flavors in halal dishes. Famous for jerk chicken fried rice, oxtail dinner, and specialty mac and cheese bowls like the Kamalee with jerk chicken and house sauce.',
      priceRange: PriceRange.MEDIUM,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: false,
      hasHighChair: true,
    }
  });

  await prisma.restaurant.upsert({
    where: { id: '53' },
    update: {},
    create: {
      id: '53',
      name: 'Springreens at Community Cafe',
      cuisineType: CuisineType.CAFE,
      address: '566 Fayetteville Rd SE, Atlanta, GA 30316',
      description: 'A cafe near East Lake Golf Club serving halal Southern comfort foods. Features chicken plates with black eyed peas, turkey meatloaf, halal burgers, seafood gumbo, and daily hot bar specials.',
      priceRange: PriceRange.LOW,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasPrayerRoom: false,
      hasHighChair: true,
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 