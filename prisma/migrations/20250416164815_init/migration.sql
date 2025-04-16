-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM ('MIDDLE_EASTERN', 'MEDITERRANEAN', 'INDIAN', 'PAKISTANI', 'TURKISH', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('INEXPENSIVE', 'MODERATE', 'EXPENSIVE', 'VERY_EXPENSIVE');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "cuisineType" "CuisineType" NOT NULL DEFAULT 'OTHER',
    "priceRange" "PriceRange" NOT NULL DEFAULT 'MODERATE',
    "isHalalCertified" BOOLEAN NOT NULL DEFAULT false,
    "servesAlcohol" BOOLEAN NOT NULL DEFAULT false,
    "hasHalalSign" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_name_key" ON "Restaurant"("name");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE; 