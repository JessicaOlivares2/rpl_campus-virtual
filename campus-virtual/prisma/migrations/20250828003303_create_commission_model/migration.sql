/*
  Warnings:

  - You are about to drop the column `courseCode` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Commission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CommissionToCourse" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CommissionToCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "Commission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CommissionToCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "DNI" TEXT,
    "birthDate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "commissionId" INTEGER,
    CONSTRAINT "User_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("DNI", "birthDate", "email", "id", "lastName", "name", "password", "role") SELECT "DNI", "birthDate", "email", "id", "lastName", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_DNI_key" ON "User"("DNI");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Commission_registrationCode_key" ON "Commission"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "_CommissionToCourse_AB_unique" ON "_CommissionToCourse"("A", "B");

-- CreateIndex
CREATE INDEX "_CommissionToCourse_B_index" ON "_CommissionToCourse"("B");
