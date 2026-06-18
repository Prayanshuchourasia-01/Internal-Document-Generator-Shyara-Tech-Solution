/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ReferenceCounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "department" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceCounter_department_documentType_key" ON "ReferenceCounter"("department", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "Document_referenceNumber_key" ON "Document"("referenceNumber");

-- CreateIndex
CREATE INDEX "Document_department_idx" ON "Document"("department");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");
