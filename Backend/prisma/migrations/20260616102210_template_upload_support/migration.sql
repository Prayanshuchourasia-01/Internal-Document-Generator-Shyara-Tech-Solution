-- AlterTable
ALTER TABLE "Document" ADD COLUMN "filePath" TEXT;
ALTER TABLE "Document" ADD COLUMN "metadata" TEXT;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "filePath" TEXT;
ALTER TABLE "Template" ADD COLUMN "placeholders" TEXT;
