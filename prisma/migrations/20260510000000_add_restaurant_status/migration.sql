-- AddColumn: Restaurant.status
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'approved';
