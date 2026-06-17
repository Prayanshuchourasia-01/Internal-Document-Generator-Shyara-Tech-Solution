import prisma from '../config/prisma.js';

export const generateReferenceNumber = async (departmentShortCode, documentCode) => {
  const normalizedShortCode = departmentShortCode.trim().toUpperCase();
  const normalizedDocumentCode = documentCode.trim().toUpperCase();

  const department = await prisma.department.findUnique({
    where: { shortCode: normalizedShortCode }
  });

  if (!department) {
    throw new Error(`Department shortCode '${departmentShortCode}' not found`);
  }

  const counter = await prisma.referenceCounter.upsert({
    where: {
      departmentShortCode_documentCode: {
        departmentShortCode: normalizedShortCode,
        documentCode: normalizedDocumentCode
      }
    },
    update: {
      currentValue: {
        increment: 1
      }
    },
    create: {
      departmentShortCode: normalizedShortCode,
      documentCode: normalizedDocumentCode,
      currentValue: 1
    }
  });

  const sequence = String(counter.currentValue).padStart(3, '0');
  return `SHY/${normalizedShortCode}/${normalizedDocumentCode}/${sequence}`;
};