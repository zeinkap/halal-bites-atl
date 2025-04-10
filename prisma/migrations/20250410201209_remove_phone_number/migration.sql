/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Restaurant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "website" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Restaurant" ("address", "createdAt", "cuisine", "description", "id", "imageUrl", "name", "priceRange", "updatedAt", "website") SELECT "address", "createdAt", "cuisine", "description", "id", "imageUrl", "name", "priceRange", "updatedAt", "website" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
