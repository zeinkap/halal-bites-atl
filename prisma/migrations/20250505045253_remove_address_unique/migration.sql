/*
  Warnings:

  - A unique constraint covering the columns `[name,address]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Restaurant_address_key";

-- DropIndex
DROP INDEX "Restaurant_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_name_address_key" ON "Restaurant"("name", "address");
