-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    CONSTRAINT "Resource_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
