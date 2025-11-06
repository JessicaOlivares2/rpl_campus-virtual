/*
  Warnings:

  - Added the required column `slug` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Assignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("description", "id", "moduleId", "title", "type") SELECT "description", "id", "moduleId", "title", "type" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE UNIQUE INDEX "Assignment_slug_key" ON "Assignment"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
