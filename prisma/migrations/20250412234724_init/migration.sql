-- Drop existing types if they exist
DROP TYPE IF EXISTS "CuisineType";
DROP TYPE IF EXISTS "PriceRange";

-- Create types
CREATE TYPE "CuisineType" AS ENUM ('MIDDLE_EASTERN', 'MEDITERRANEAN', 'INDIAN_PAKISTANI', 'AFGHAN', 'CAFE', 'OTHER');
CREATE TYPE "PriceRange" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create Restaurant table
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cuisine" "CuisineType" NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceRange" "PriceRange" NOT NULL DEFAULT 'MEDIUM',
    "imageUrl" TEXT NOT NULL,
    "hasPrayerRoom" BOOLEAN NOT NULL DEFAULT false,
    "hasOutdoorSeating" BOOLEAN NOT NULL DEFAULT false,
    "isZabiha" BOOLEAN NOT NULL DEFAULT false,
    "hasHighChair" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Restaurant_name_key" ON "Restaurant"("name");

-- Create Comment table
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE; 