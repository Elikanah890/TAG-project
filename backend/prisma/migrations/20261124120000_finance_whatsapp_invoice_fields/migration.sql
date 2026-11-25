-- AlterTable
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "recipientWhatsapp" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "paymentInstructions" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Member_whatsappNumber_idx" ON "Member"("whatsappNumber");
