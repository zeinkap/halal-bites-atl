import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load production environment variables if in production
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Loading production environment...');
  const envPath = resolve(process.cwd(), '.env.production');
  console.log('📁 Loading environment from:', envPath);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('❌ Error loading .env.production:', result.error);
    process.exit(1);
  }
}

// Log the environment we're operating in
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('📊 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function deleteTestRestaurant() {
  try {
    console.log('🔍 Finding test restaurants and their comments...');

    // First count how many we'll delete
    const commentCount = await prisma.comment.count({
      where: {
        restaurant: {
          name: {
            startsWith: 'Test Restaurant for Comments'
          }
        }
      }
    });

    const restaurantCount = await prisma.restaurant.count({
      where: {
        name: {
          startsWith: 'Test Restaurant for Comments'
        }
      }
    });

    console.log(`Found ${restaurantCount} test restaurants with ${commentCount} comments`);

    // First delete any comments associated with the restaurant
    console.log('🗑️  Deleting associated comments...');
    const deletedComments = await prisma.comment.deleteMany({
      where: {
        restaurant: {
          name: {
            startsWith: 'Test Restaurant for Comments'
          }
        }
      }
    });

    // Then delete the restaurant
    console.log('🗑️  Deleting test restaurants...');
    const deletedRestaurants = await prisma.restaurant.deleteMany({
      where: {
        name: {
          startsWith: 'Test Restaurant for Comments'
        }
      }
    });

    console.log('✅ Cleanup complete:');
    console.log(`- Deleted ${deletedComments.count} comments`);
    console.log(`- Deleted ${deletedRestaurants.count} test restaurants`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
  }
}

deleteTestRestaurant(); 