-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "zabihaBeef" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zabihaChicken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zabihaGoat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zabihaLamb" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zabihaVerified" TIMESTAMP(3),
ADD COLUMN     "zabihaVerifiedBy" TEXT,
ALTER COLUMN "isFullyHalal" SET DEFAULT true;
