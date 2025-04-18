import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDb() {
  try {
    // Delete all existing records first
    console.log('Deleting existing records...');
    await prisma.comment.deleteMany();
    await prisma.restaurant.deleteMany();

    // Disconnect Prisma to ensure no active connections when dropping tables
    console.log('Disconnecting Prisma client...');
    await prisma.$disconnect();

    // Create a new connection for raw SQL
    console.log('Creating raw connection...');
    const rawClient = new PrismaClient();

    try {
      // Drop tables first
      console.log('Dropping tables...');
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "Comment" CASCADE;');
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "Restaurant" CASCADE;');
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');

      // Drop enums with detailed error handling
      console.log('Dropping enums...');
      try {
        await rawClient.$executeRawUnsafe('DROP TYPE IF EXISTS "CuisineType" CASCADE;');
        console.log('Successfully dropped CuisineType enum');
      } catch (enumError) {
        console.error('Error dropping CuisineType:', enumError);
      }

      try {
        await rawClient.$executeRawUnsafe('DROP TYPE IF EXISTS "PriceRange" CASCADE;');
        console.log('Successfully dropped PriceRange enum');
      } catch (enumError) {
        console.error('Error dropping PriceRange:', enumError);
      }

      console.log('Database reset completed successfully.');
    } catch (error) {
      console.error('Error during raw SQL operations:', error);
      throw error;
    } finally {
      // Ensure raw client is disconnected
      await rawClient.$disconnect();
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDb(); 