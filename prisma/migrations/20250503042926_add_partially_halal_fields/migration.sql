-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "isPartiallyHalal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partiallyHalalBeef" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partiallyHalalChicken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partiallyHalalGoat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partiallyHalalLamb" BOOLEAN NOT NULL DEFAULT false;
