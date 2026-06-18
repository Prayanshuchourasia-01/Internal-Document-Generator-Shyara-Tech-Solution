/*
  Warnings:

  - Added the required column `templateCode` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT,
    "placeholders" TEXT
);
INSERT INTO "new_Template" ("content", "createdAt", "department", "filePath", "id", "name", "placeholders") SELECT "content", "createdAt", "department", "filePath", "id", "name", "placeholders" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
