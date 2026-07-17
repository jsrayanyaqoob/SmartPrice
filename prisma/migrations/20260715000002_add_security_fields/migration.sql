-- AlterTable
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT,
ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailChangeToken" TEXT,
ADD COLUMN "emailChangeNewEmail" TEXT;
