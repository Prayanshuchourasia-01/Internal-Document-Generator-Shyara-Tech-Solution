
import prisma from '../config/prisma.js';
import { generateReferenceNumber } from '../utils/generateReferenceNumber.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ensureDirectory = (directoryPath) => {
  const absolutePath = path.resolve(directoryPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

export const generateDocument = async (req, res) => {
  try {
    const { templateId, documentCode, values } = req.body;

    if (!templateId || !documentCode) {
      return res.status(400).json({
        success: false,
        message: 'templateId and documentCode are required'
      });
    }

    if (!values || typeof values !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'values must be a valid object'
      });
    }

    const template = await prisma.template.findUnique({
      where: { id: Number(templateId) },
      include: { department: true }
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (!template.department) {
      return res.status(400).json({
        success: false,
        message: 'Associated department not found for the selected template'
      });
    }

    let generatedContent = template.content;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`<\\s*${key}\\s*>`, 'g');
      generatedContent = generatedContent.replace(regex, value ?? '');
    });

    const normalizedDocumentCode = documentCode.trim().toUpperCase();
    const referenceNumber = await generateReferenceNumber(template.department.shortCode, normalizedDocumentCode);

    const document = await prisma.document.create({
      data: {
        templateId: template.id,
        documentName: template.name,
        departmentId: template.department.id,
        departmentName: template.department.name,
        departmentShortCode: template.department.shortCode,
        documentCode: normalizedDocumentCode,
        referenceNumber,
        content: generatedContent,
        metadata: JSON.stringify(values)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document generated successfully',
      referenceNumber,
      document
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { search, department, startDate, endDate } = req.query;
    const filters = [];

    if (search) {
      const query = search.trim();
      filters.push({
        OR: [
          { documentName: { contains: query, mode: 'insensitive' } },
          { referenceNumber: { contains: query, mode: 'insensitive' } },
          { departmentName: { contains: query, mode: 'insensitive' } },
          { documentCode: { contains: query, mode: 'insensitive' } },
          { metadata: { contains: query, mode: 'insensitive' } }
        ]
      });
    }

    if (department) {
      const normalizedDepartment = department.trim();
      filters.push({
        OR: [
          { departmentShortCode: { equals: normalizedDepartment.toUpperCase(), mode: 'insensitive' } },
          { departmentName: { contains: normalizedDepartment, mode: 'insensitive' } }
        ]
      });
    }

    if (startDate || endDate) {
      const createdAtFilter = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid startDate format' });
        }
        createdAtFilter.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid endDate format' });
        }
        createdAtFilter.lte = end;
      }
      filters.push({ createdAt: createdAtFilter });
    }

    const where = filters.length ? { AND: filters } : {};
    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({ where: { id: Number(id) } });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const previewDocument = async (req, res) => {
  try {
    const { templateId, values } = req.body;

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'templateId is required' });
    }

    if (!values || typeof values !== 'object') {
      return res.status(400).json({ success: false, message: 'values must be a valid object' });
    }

    const template = await prisma.template.findUnique({ where: { id: Number(templateId) } });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    let previewContent = template.content;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`<\\s*${key}\\s*>`, 'g');
      previewContent = previewContent.replace(regex, value ?? '');
    });

    res.status(200).json({ success: true, templateId, preview: previewContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({ where: { id: Number(id) } });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const outputDirectory = ensureDirectory('generated-documents');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(document.content, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const fileName = `document-${document.id}.pdf`;
    const filePath = path.join(outputDirectory, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    await prisma.document.update({ where: { id: document.id }, data: { filePath } });

    res.status(200).json({ success: true, message: 'PDF generated successfully', filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({ where: { id: Number(id) } });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!document.filePath) {
      return res.status(404).json({ success: false, message: 'PDF not generated yet' });
    }

    const absolutePath = path.resolve(document.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on disk' });
    }

    return res.download(absolutePath, `${document.documentName || 'document'}.pdf`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};