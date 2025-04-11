/*
  Warnings:

  - The values [LOW,MEDIUM,HIGH] on the enum `PriceRange` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PriceRange_new" AS ENUM ('$', '$$', '$$$');
ALTER TABLE "Restaurant" ALTER COLUMN "priceRange" TYPE "PriceRange_new" USING ("priceRange"::text::"PriceRange_new");
ALTER TYPE "PriceRange" RENAME TO "PriceRange_old";
ALTER TYPE "PriceRange_new" RENAME TO "PriceRange";
DROP TYPE "PriceRange_old";
COMMIT;
