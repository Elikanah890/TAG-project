CREATE TABLE IF NOT EXISTS "ContactMessage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx" ON "ContactMessage"("status");
CREATE INDEX IF NOT EXISTS "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
