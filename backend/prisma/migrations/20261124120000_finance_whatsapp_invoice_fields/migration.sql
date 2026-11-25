-- AlterTable
ALTER TABLE "Member" ADD COLUMN "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "recipientWhatsapp" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "category" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "paymentInstructions" TEXT;

-- CreateIndex
CREATE INDEX "Member_whatsappNumber_idx" ON "Member"("whatsappNumber");
