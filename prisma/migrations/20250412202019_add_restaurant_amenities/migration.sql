-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "hasHighChair" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasOutdoorSeating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPrayerRoom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isZabiha" BOOLEAN NOT NULL DEFAULT true;
