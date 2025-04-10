import { PrismaClient } from '@prisma/client';
import { restaurants } from './seed-data.ts';

const prisma = new PrismaClient();

async function main() {
  for (const restaurant of restaurants) {
    await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        description: restaurant.description,
        priceRange: restaurant.priceRange,
        imageUrl: restaurant.imageUrl,
      },
      create: {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        description: restaurant.description,
        priceRange: restaurant.priceRange,
        imageUrl: restaurant.imageUrl,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 