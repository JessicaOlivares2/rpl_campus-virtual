-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "failedTests" INTEGER;
ALTER TABLE "Submission" ADD COLUMN "passedTests" INTEGER;
ALTER TABLE "Submission" ADD COLUMN "rawResult" TEXT;
