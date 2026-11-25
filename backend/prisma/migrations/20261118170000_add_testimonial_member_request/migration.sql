-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "role" TEXT,
    "quoteEn" TEXT NOT NULL,
    "quoteSw" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberRequest_memberId_idx" ON "MemberRequest"("memberId");

-- CreateIndex
CREATE INDEX "MemberRequest_status_idx" ON "MemberRequest"("status");

-- AddForeignKey
ALTER TABLE "MemberRequest" ADD CONSTRAINT "MemberRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

