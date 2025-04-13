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
    "description" TEXT,
    "priceRange" "PriceRange" NOT NULL,
    "website" TEXT,
    "imageUrl" TEXT,
    "hasPrayerRoom" BOOLEAN NOT NULL DEFAULT false,
    "hasOutdoorSeating" BOOLEAN NOT NULL DEFAULT false,
    "isZabiha" BOOLEAN NOT NULL DEFAULT false,
    "hasHighChair" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "authorName" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_name_key" ON "Restaurant"("name");

-- CreateIndex
CREATE INDEX "Comment_restaurantId_idx" ON "Comment"("restaurantId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
