/*
  Warnings:

  - A unique constraint covering the columns `[DNI]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "DNI" TEXT;
ALTER TABLE "User" ADD COLUMN "birthDate" DATETIME;
ALTER TABLE "User" ADD COLUMN "courseCode" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_DNI_key" ON "User"("DNI");
