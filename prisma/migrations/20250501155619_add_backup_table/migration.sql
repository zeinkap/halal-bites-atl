-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "isFullyHalal" SET DEFAULT false,
ALTER COLUMN "zabihaVerified" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);
