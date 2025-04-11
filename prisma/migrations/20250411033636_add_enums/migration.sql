/*
  Warnings:

  - Changed the type of `cuisine` on the `Restaurant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priceRange` on the `Restaurant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM ('MIDDLE_EASTERN', 'INDIAN', 'PAKISTANI', 'TURKISH', 'PERSIAN', 'MEDITERRANEAN', 'MALAYSIAN', 'INDONESIAN', 'AFRICAN', 'CAFE', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create new table with enum columns
CREATE TABLE "RestaurantNew" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cuisine" "CuisineType" NOT NULL,
  "address" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceRange" "PriceRange" NOT NULL,
  "website" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RestaurantNew_pkey" PRIMARY KEY ("id")
);

-- Copy data from old table to new table with converted values
INSERT INTO "RestaurantNew" ("id", "name", "cuisine", "address", "description", "priceRange", "website", "imageUrl", "createdAt", "updatedAt")
SELECT 
  "id",
  "name",
  CASE 
    WHEN "cuisine" = 'Middle Eastern' THEN 'MIDDLE_EASTERN'::"CuisineType"
    WHEN "cuisine" = 'Indian' THEN 'INDIAN'::"CuisineType"
    WHEN "cuisine" = 'Pakistani' THEN 'PAKISTANI'::"CuisineType"
    WHEN "cuisine" = 'Turkish' THEN 'TURKISH'::"CuisineType"
    WHEN "cuisine" = 'Persian' THEN 'PERSIAN'::"CuisineType"
    WHEN "cuisine" = 'Mediterranean' THEN 'MEDITERRANEAN'::"CuisineType"
    WHEN "cuisine" = 'Malaysian' THEN 'MALAYSIAN'::"CuisineType"
    WHEN "cuisine" = 'Indonesian' THEN 'INDONESIAN'::"CuisineType"
    WHEN "cuisine" = 'African' THEN 'AFRICAN'::"CuisineType"
    WHEN "cuisine" = 'Cafe' THEN 'CAFE'::"CuisineType"
    ELSE 'OTHER'::"CuisineType"
  END,
  "address",
  "description",
  CASE 
    WHEN "priceRange" = '$' THEN 'LOW'::"PriceRange"
    WHEN "priceRange" = '$$' THEN 'MEDIUM'::"PriceRange"
    WHEN "priceRange" = '$$$' THEN 'HIGH'::"PriceRange"
    ELSE 'MEDIUM'::"PriceRange"
  END,
  "website",
  "imageUrl",
  "createdAt",
  "updatedAt"
FROM "Restaurant";

-- Drop old table
DROP TABLE "Restaurant";

-- Rename new table to old name
ALTER TABLE "RestaurantNew" RENAME TO "Restaurant";
