-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "responseTime" INTEGER NOT NULL DEFAULT 9;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "maxResponseTime" INTEGER NOT NULL DEFAULT 9;
