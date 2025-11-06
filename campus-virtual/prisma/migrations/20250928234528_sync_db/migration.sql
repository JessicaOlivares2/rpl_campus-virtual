/*
  Warnings:

  - Added the required column `slug` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" INTEGER NOT NULL,
    CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("description", "id", "teacherId", "title") SELECT "description", "id", "teacherId", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_Teacher" ("email", "id", "lastName", "name") SELECT "email", "id", "lastName", "name" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
