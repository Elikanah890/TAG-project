-- Enum reconciliation (runs before schema so new enum values are committed before use).

DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "FinancialAccountType" AS ENUM ('CASH', 'BANK', 'MOBILE_MONEY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVERSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExpenseApprovalAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'REVERSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WhatsAppMessageType" AS ENUM ('RECEIPT', 'INVOICE', 'REMINDER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('PENDING', 'OPENED', 'SENT', 'DELIVERED', 'READ', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typnamespace = current_schema()::regnamespace AND t.typname='MembershipStatus' AND e.enumlabel='PENDING') THEN
    ALTER TYPE "MembershipStatus" ADD VALUE 'PENDING';
  END IF;
END $$;
