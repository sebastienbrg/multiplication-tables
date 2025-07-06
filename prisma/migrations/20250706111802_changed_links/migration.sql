-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incorrectCount" INTEGER NOT NULL DEFAULT 0;
