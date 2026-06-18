import prisma from '../config/prisma.js';

export const generateReferenceNumber = async (department, documentType) => {
  const normalizedDepartment = String(department).trim().toUpperCase();
  const normalizedDocumentType = String(documentType).trim().toUpperCase();

  if (!normalizedDepartment) {
    throw new Error('Department is required for reference generation');
  }

  if (!normalizedDocumentType) {
    throw new Error('Document type is required for reference generation');
  }

  const counter = await prisma.referenceCounter.upsert({
    where: {
      department_documentType: {
        department: normalizedDepartment,
        documentType: normalizedDocumentType
      }
    },
    update: {
      currentValue: {
        increment: 1
      }
    },
    create: {
      department: normalizedDepartment,
      documentType: normalizedDocumentType,
      currentValue: 1
    }
  });

  const sequence = String(counter.currentValue).padStart(3, '0');
  return `SHY/${normalizedDepartment}/${normalizedDocumentType}/${sequence}`;
};