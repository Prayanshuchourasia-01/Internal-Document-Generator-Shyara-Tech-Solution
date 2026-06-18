import prisma from '../config/prisma.js';

export const generateReferenceNumber = async (departmentShortCode, documentCode) => {
  const normalizedShortCode = String(departmentShortCode).trim().toUpperCase();
  const normalizedDocumentCode = String(documentCode).trim().toUpperCase();

  // Upsert using the actual DB column names (department, documentType)
  const counter = await prisma.referenceCounter.upsert({
    where: {
      department_documentType: {
        department: normalizedShortCode,
        documentType: normalizedDocumentCode
      }
    },
    update: {
      currentValue: {
        increment: 1
      }
    },
    create: {
      department: normalizedShortCode,
      documentType: normalizedDocumentCode,
      currentValue: 1
    }
  });

  const sequence = String(counter.currentValue).padStart(3, '0');
  return `SHY/${normalizedShortCode}/${normalizedDocumentCode}/${sequence}`;
};
