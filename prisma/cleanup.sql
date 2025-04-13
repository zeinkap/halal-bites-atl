-- Drop existing tables if they exist
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "Restaurant" CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS "CuisineType";
DROP TYPE IF EXISTS "PriceRange"; 