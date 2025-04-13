-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM ('MIDDLE_EASTERN', 'INDIAN_PAKISTANI', 'TURKISH', 'PERSIAN', 'MEDITERRANEAN', 'AFGHAN', 'CAFE', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('$', '$$', '$$$');

-- CreateTable
CREATE TABLE "Restaurant" (
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

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);
