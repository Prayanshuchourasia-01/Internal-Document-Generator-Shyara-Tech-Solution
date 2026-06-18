import prisma from '../config/prisma.js';

export const generateReferenceNumber = async (department, documentType) => {
  const normalizedDepartment = String(department).trim();
  const normalizedDocumentType = String(documentType).trim().toUpperCase();

  if (!normalizedDepartment) {
    throw new Error('Department is required for reference generation');
  }

  if (!normalizedDocumentType) {
    throw new Error('Document type is required for reference generation');
  }

  const departmentRecord = await prisma.department.findFirst({
    where: {
      name: normalizedDepartment
    }
  });

  const departmentCode =
    departmentRecord?.shortCode ||
    normalizedDepartment.toUpperCase();

  const counter = await prisma.referenceCounter.upsert({
    where: {
      department_documentType: {
        department: departmentCode,
        documentType: normalizedDocumentType
      }
    },
    update: {
      currentValue: {
        increment: 1
      }
    },
    create: {
      department: departmentCode,
      documentType: normalizedDocumentType,
      currentValue: 1
    }
  });

  const sequence = String(counter.currentValue).padStart(3, '0');

  return `SHY/${departmentCode}/${normalizedDocumentType}/${sequence}`;
};