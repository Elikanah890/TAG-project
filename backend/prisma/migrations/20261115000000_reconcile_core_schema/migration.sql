-- Forward-only reconciliation for databases where the migration history was
-- bootstrapped with `0_init` but the remaining schema was created via `prisma db push`.
-- Creates only the tables/columns/indexes that no existing migration provides.
-- All statements are idempotent so partially-applied environments converge safely.

ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "receiptNo" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "baptismStatus" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "currentDistrict" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "currentPosition" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "currentRegion" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "currentStreet" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "currentWard" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "desiredDepartment" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "employmentStatus" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "expectedStayDuration" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fullName" TEXT NOT NULL;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "occupation" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "originDistrict" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "originRegion" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "preferredDepartment" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "registrationData" JSONB;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "timeInChurch" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "ushemasi" TEXT;

ALTER TABLE "Member" ALTER COLUMN "firstName" DROP NOT NULL;

ALTER TABLE "Member" ALTER COLUMN "lastName" DROP NOT NULL;

ALTER TABLE "Member" ALTER COLUMN "membershipStatus" SET DEFAULT 'PENDING';

ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "action" TEXT;

ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "module" TEXT;

ALTER TABLE "RefreshToken" ADD COLUMN IF NOT EXISTS "ip" TEXT;

ALTER TABLE "RefreshToken" ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMP(3);

ALTER TABLE "RefreshToken" ADD COLUMN IF NOT EXISTS "revokedBy" TEXT;

ALTER TABLE "RefreshToken" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "Pledge" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "recordedById" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "financialAccountId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Fellowship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderName" TEXT,
    "schedule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Fellowship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "location" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT,
    "fullName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SundayAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "firstServiceCount" INTEGER NOT NULL,
    "secondServiceCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "SundayAttendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FollowupCase" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "FollowupCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "campaignId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "period" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Sermon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleSw" TEXT,
    "preacher" TEXT,
    "description" TEXT,
    "descriptionSw" TEXT,
    "scripture" TEXT,
    "preachedAt" TIMESTAMP(3),
    "duration" TEXT,
    "mediaUrl" TEXT,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "series" TEXT,
    "tags" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Sermon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BackupLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "location" TEXT,
    "notes" TEXT,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT DEFAULT 'GENERAL',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Leadership" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleSw" TEXT,
    "ministry" TEXT,
    "bio" TEXT,
    "bioSw" TEXT,
    "imageUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "roleType" TEXT DEFAULT 'LEADER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Leadership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Ministry" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "nameSw" TEXT,
    "description" TEXT,
    "descriptionSw" TEXT,
    "vision" TEXT,
    "visionSw" TEXT,
    "mission" TEXT,
    "missionSw" TEXT,
    "purpose" TEXT,
    "purposeSw" TEXT,
    "revivalHistory" TEXT,
    "revivalHistorySw" TEXT,
    "leaderName" TEXT,
    "logoUrl" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleSw" TEXT,
    "body" TEXT,
    "bodySw" TEXT,
    "type" TEXT NOT NULL DEFAULT 'NEWS',
    "imageUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RoleAssignmentHistory" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "RoleAssignmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserScope" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "UserScope_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Pledge_memberId_idx" ON "Pledge"("memberId");

CREATE INDEX IF NOT EXISTS "Pledge_status_idx" ON "Pledge"("status");

CREATE INDEX IF NOT EXISTS "Pledge_targetDate_idx" ON "Pledge"("targetDate");

CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");

CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category");

CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "Fellowship_name_key" ON "Fellowship"("name");

CREATE INDEX IF NOT EXISTS "Attendance_meetingId_idx" ON "Attendance"("meetingId");

CREATE INDEX IF NOT EXISTS "Attendance_memberId_idx" ON "Attendance"("memberId");

CREATE UNIQUE INDEX IF NOT EXISTS "SundayAttendance_date_key" ON "SundayAttendance"("date");

CREATE INDEX IF NOT EXISTS "SundayAttendance_date_idx" ON "SundayAttendance"("date");

CREATE UNIQUE INDEX IF NOT EXISTS "SystemConfig_key_key" ON "SystemConfig"("key");

CREATE INDEX IF NOT EXISTS "RoleAssignmentHistory_userId_idx" ON "RoleAssignmentHistory"("userId");

CREATE INDEX IF NOT EXISTS "RoleAssignmentHistory_actorId_idx" ON "RoleAssignmentHistory"("actorId");

CREATE INDEX IF NOT EXISTS "RoleAssignmentHistory_createdAt_idx" ON "RoleAssignmentHistory"("createdAt");

CREATE INDEX IF NOT EXISTS "UserScope_scopeType_scopeId_idx" ON "UserScope"("scopeType", "scopeId");

CREATE UNIQUE INDEX IF NOT EXISTS "UserScope_userId_scopeType_scopeId_key" ON "UserScope"("userId", "scopeType", "scopeId");

CREATE UNIQUE INDEX IF NOT EXISTS "Contribution_receiptNo_key" ON "Contribution"("receiptNo");

CREATE INDEX IF NOT EXISTS "Contribution_receiptNo_idx" ON "Contribution"("receiptNo");

CREATE INDEX IF NOT EXISTS "Member_fullName_idx" ON "Member"("fullName");

CREATE INDEX IF NOT EXISTS "Permission_module_idx" ON "Permission"("module");

CREATE INDEX IF NOT EXISTS "RefreshToken_revokedAt_idx" ON "RefreshToken"("revokedAt");

DO $$ BEGIN
  ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "SundayAttendance" ADD CONSTRAINT "SundayAttendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "FollowupCase" ADD CONSTRAINT "FollowupCase_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Budget" ADD CONSTRAINT "Budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "RoleAssignmentHistory" ADD CONSTRAINT "RoleAssignmentHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "RoleAssignmentHistory" ADD CONSTRAINT "RoleAssignmentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "RoleAssignmentHistory" ADD CONSTRAINT "RoleAssignmentHistory_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserScope" ADD CONSTRAINT "UserScope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
