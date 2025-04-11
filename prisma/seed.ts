import { PrismaClient, CuisineType, PriceRange } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add a few sample restaurants
  await prisma.restaurant.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Sample Restaurant',
      cuisine: CuisineType.MIDDLE_EASTERN,
      address: '123 Main St, Atlanta, GA 30303',
      description: 'A sample restaurant for testing',
      priceRange: PriceRange.MEDIUM,
      imageUrl: 'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80',
    },
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