import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestRestaurant() {
  try {
    // First delete any comments associated with the restaurant
    await prisma.comment.deleteMany({
      where: {
        restaurant: {
          name: {
            startsWith: 'Test Restaurant for Comments'
          }
        }
      }
    });

    // Then delete the restaurant
    const result = await prisma.restaurant.deleteMany({
      where: {
        name: {
          startsWith: 'Test Restaurant for Comments'
        }
      }
    });

    console.log(`Deleted ${result.count} test restaurants`);
  } catch (error) {
    console.error('Error deleting test restaurant:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestRestaurant(); 