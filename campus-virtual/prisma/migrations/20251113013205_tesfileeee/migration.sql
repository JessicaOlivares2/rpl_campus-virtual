/*
  Warnings:

  - You are about to drop the column `storagePath` on the `TestFile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "assignmentId" INTEGER NOT NULL,
    CONSTRAINT "TestFile_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestFile" ("assignmentId", "filename", "id") SELECT "assignmentId", "filename", "id" FROM "TestFile";
DROP TABLE "TestFile";
ALTER TABLE "new_TestFile" RENAME TO "TestFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
