import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Drop all tables
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Comment" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Restaurant" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE`;
    
    // Drop enums
    await prisma.$executeRaw`DROP TYPE IF EXISTS "CuisineType" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "PriceRange" CASCADE`;

    console.log('Database reset successful');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase(); 