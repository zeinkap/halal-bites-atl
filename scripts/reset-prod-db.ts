import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load production environment variables
console.log('🔧 Loading production environment...');
const envPath = resolve(process.cwd(), '.env.production');
console.log('📁 Loading environment from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.production:', result.error);
  process.exit(1);
}

// Log the loaded environment
console.log('📊 Loaded environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Hide password in logs
});

// Verify we have the production database URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function resetDb() {
  try {
    console.log('\n🔄 Starting production database reset...');
    console.log('📊 Database URL:', process.env.DATABASE_URL);

    // First verify we can connect and have proper permissions
    console.log('\n🔍 Verifying database connection and permissions...');
    try {
      await prisma.$queryRaw`SELECT current_user, current_database()`;
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    // Check existing tables and count
    console.log('\n📊 Current database state:');
    const restaurantCount = await prisma.restaurant.count();
    const commentCount = await prisma.comment.count();
    console.log(`Found ${restaurantCount} restaurants and ${commentCount} comments`);

    // Delete all existing records first
    console.log('\n🗑️  Deleting existing records...');
    const deletedComments = await prisma.comment.deleteMany();
    console.log(`Deleted ${deletedComments.count} comments`);
    const deletedRestaurants = await prisma.restaurant.deleteMany();
    console.log(`Deleted ${deletedRestaurants.count} restaurants`);

    // Verify records are deleted
    const remainingRestaurants = await prisma.restaurant.count();
    const remainingComments = await prisma.comment.count();
    console.log(`\nVerifying deletion: ${remainingRestaurants} restaurants and ${remainingComments} comments remaining`);

    // Disconnect Prisma to ensure no active connections when dropping tables
    console.log('\n🔌 Disconnecting Prisma client...');
    await prisma.$disconnect();

    // Create a new connection for raw SQL
    console.log('🔄 Creating raw connection...');
    const rawClient = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    try {
      // Drop tables with CASCADE to handle dependencies automatically
      console.log('\n🗑️  Dropping tables...');
      
      // First check if tables exist
      const existingTables = await rawClient.$executeRawUnsafe(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_type = \'BASE TABLE\';'
      );
      console.log('Existing tables before drop:', existingTables);

      // Drop tables
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "Comment" CASCADE;');
      console.log('✅ Dropped Comment table');
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "Restaurant" CASCADE;');
      console.log('✅ Dropped Restaurant table');
      await rawClient.$executeRawUnsafe('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');
      console.log('✅ Dropped _prisma_migrations table');

      // Drop enums with detailed error handling
      console.log('\n🗑️  Dropping enums...');
      try {
        await rawClient.$executeRawUnsafe('DROP TYPE IF EXISTS "CuisineType" CASCADE;');
        console.log('✅ Successfully dropped CuisineType enum');
      } catch (enumError) {
        console.error('❌ Error dropping CuisineType:', enumError);
      }

      try {
        await rawClient.$executeRawUnsafe('DROP TYPE IF EXISTS "PriceRange" CASCADE;');
        console.log('✅ Successfully dropped PriceRange enum');
      } catch (enumError) {
        console.error('❌ Error dropping PriceRange:', enumError);
      }

      // Final verification
      console.log('\n🔍 Final verification:');
      const tables = await rawClient.$executeRawUnsafe(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_type = \'BASE TABLE\';'
      );
      console.log('Remaining tables:', tables);
      
      const enums = await rawClient.$executeRawUnsafe(
        'SELECT t.typname FROM pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = \'public\' AND t.typtype = \'e\';'
      );
      console.log('Remaining enums:', enums);

      // Check if we can create a test table to verify permissions
      try {
        await rawClient.$executeRawUnsafe('CREATE TABLE test_permissions (id serial primary key);');
        await rawClient.$executeRawUnsafe('DROP TABLE test_permissions;');
        console.log('✅ Successfully verified CREATE/DROP TABLE permissions');
      } catch (error) {
        console.error('❌ Permission verification failed:', error);
        throw error;
      }

      console.log('\n✅ Database reset completed successfully.');
    } catch (error) {
      console.error('\n❌ Error during raw SQL operations:', error);
      throw error;
    } finally {
      // Ensure raw client is disconnected
      console.log('\n🔌 Disconnecting raw client...');
      await rawClient.$disconnect();
    }
  } catch (error) {
    console.error('\n❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDb(); 