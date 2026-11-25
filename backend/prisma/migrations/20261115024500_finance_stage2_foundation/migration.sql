-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('CASH', 'BANK', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "ExpenseApprovalAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('RECEIPT', 'INVOICE', 'REMINDER', 'OTHER');

-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('PENDING', 'OPENED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "campaignId" TEXT;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "financialAccountId" TEXT,
ADD COLUMN     "invoiceId" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "financialAccountId" TEXT,
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "targetAmount" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "memberId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "recipientAddress" TEXT,
    "campaignId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "provider" TEXT,
    "identifier" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseApprovalHistory" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "ExpenseApprovalAction" NOT NULL,
    "fromStatus" "ExpenseStatus",
    "toStatus" "ExpenseStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessageLog" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "contributionId" TEXT,
    "invoiceId" TEXT,
    "createdById" TEXT,
    "recipientName" TEXT,
    "recipientPhone" TEXT NOT NULL,
    "messageType" "WhatsAppMessageType" NOT NULL,
    "documentNo" TEXT,
    "messageBody" TEXT,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_startDate_idx" ON "Campaign"("startDate");

-- CreateIndex
CREATE INDEX "Campaign_endDate_idx" ON "Campaign"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_memberId_idx" ON "Invoice"("memberId");

-- CreateIndex
CREATE INDEX "Invoice_campaignId_idx" ON "Invoice"("campaignId");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_name_key" ON "FinancialAccount"("name");

-- CreateIndex
CREATE INDEX "FinancialAccount_type_idx" ON "FinancialAccount"("type");

-- CreateIndex
CREATE INDEX "FinancialAccount_status_idx" ON "FinancialAccount"("status");

-- CreateIndex
CREATE INDEX "ExpenseApprovalHistory_expenseId_idx" ON "ExpenseApprovalHistory"("expenseId");

-- CreateIndex
CREATE INDEX "ExpenseApprovalHistory_actorId_idx" ON "ExpenseApprovalHistory"("actorId");

-- CreateIndex
CREATE INDEX "ExpenseApprovalHistory_createdAt_idx" ON "ExpenseApprovalHistory"("createdAt");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_memberId_idx" ON "WhatsAppMessageLog"("memberId");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_contributionId_idx" ON "WhatsAppMessageLog"("contributionId");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_invoiceId_idx" ON "WhatsAppMessageLog"("invoiceId");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_recipientPhone_idx" ON "WhatsAppMessageLog"("recipientPhone");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_status_idx" ON "WhatsAppMessageLog"("status");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_createdAt_idx" ON "WhatsAppMessageLog"("createdAt");

-- CreateIndex
CREATE INDEX "Budget_campaignId_idx" ON "Budget"("campaignId");

-- CreateIndex
CREATE INDEX "Contribution_invoiceId_idx" ON "Contribution"("invoiceId");

-- CreateIndex
CREATE INDEX "Contribution_campaignId_idx" ON "Contribution"("campaignId");

-- CreateIndex
CREATE INDEX "Contribution_financialAccountId_idx" ON "Contribution"("financialAccountId");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Expense_recordedById_idx" ON "Expense"("recordedById");

-- CreateIndex
CREATE INDEX "Expense_reviewedById_idx" ON "Expense"("reviewedById");

-- CreateIndex
CREATE INDEX "Expense_financialAccountId_idx" ON "Expense"("financialAccountId");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseApprovalHistory" ADD CONSTRAINT "ExpenseApprovalHistory_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseApprovalHistory" ADD CONSTRAINT "ExpenseApprovalHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageLog" ADD CONSTRAINT "WhatsAppMessageLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageLog" ADD CONSTRAINT "WhatsAppMessageLog_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageLog" ADD CONSTRAINT "WhatsAppMessageLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageLog" ADD CONSTRAINT "WhatsAppMessageLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default financial accounts. Opening balances are intentionally zero.
INSERT INTO "FinancialAccount" ("id", "name", "type", "provider", "currency", "openingBalance", "status", "createdAt", "updatedAt")
VALUES
  ('acct_cash_default', 'Cash', 'CASH', NULL, 'TZS', 0, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acct_bank_default', 'Bank', 'BANK', NULL, 'TZS', 0, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acct_mpesa_default', 'M-Pesa', 'MOBILE_MONEY', 'M-Pesa', 'TZS', 0, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
