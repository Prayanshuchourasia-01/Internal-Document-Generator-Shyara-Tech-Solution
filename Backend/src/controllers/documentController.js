
import prisma from '../config/prisma.js';
import { generateReferenceNumber } from '../utils/generateReferenceNumber.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { convertDocxBufferToPdf, saveBufferToFile } from '../utils/convertDocx.js';

const ensureDirectory = (directoryPath) => {
  const absolutePath = path.resolve(directoryPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

const replacePlaceholdersInZip = (zip, placeholders) => {
  const xmlFileNames = Object.keys(zip.files).filter((name) => /^word\/.*\.xml$/.test(name));
  xmlFileNames.forEach((entryName) => {
    const file = zip.file(entryName);
    if (!file) return;
    let xml = file.asText();
    placeholders.forEach((ph) => {
      const safe = ph.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const rx = new RegExp(`<\\s*${safe}\\s*>`, 'g');
      xml = xml.replace(rx, `{${ph}}`);
    });
    zip.file(entryName, xml);
  });
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

    const template = await prisma.template.findUnique({ where: { id: Number(templateId) } });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // In current DB schema, template.department may be a string (shortCode or name)
    if (!template.department) {
      return res.status(400).json({ success: false, message: 'Associated department not found for the selected template' });
    }

    // If the template has an original DOCX file, produce a DOCX-preserving render
    let generatedContent = template.content;
    let savedDocxPath = null;
    let savedPdfPath = null;

    if (template.filePath && fs.existsSync(template.filePath)) {
      // Read original DOCX as binary
      const content = fs.readFileSync(template.filePath, 'binary');
      const zip = new PizZip(content);
      const placeholders = template.placeholders ? JSON.parse(template.placeholders || '[]') : [];

      if (placeholders.length) {
        replacePlaceholdersInZip(zip, placeholders);
      }

      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      try {
        doc.render(values || {});
      } catch (err) {
        console.error('Docxtemplater render error', err);
        throw err;
      }

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      // Save DOCX
      const outDocxDir = path.join('generated-documents', 'docx');
      const docxName = `document-${Date.now()}.docx`;
      savedDocxPath = saveBufferToFile(buffer, path.join(outDocxDir, docxName));

      // Convert to PDF if possible
      try {
        const pdfBuffer = await convertDocxBufferToPdf(buffer);
        const outPdfDir = path.join('generated-documents', 'pdf');
        const pdfName = `document-${Date.now()}.pdf`;
        savedPdfPath = saveBufferToFile(pdfBuffer, path.join(outPdfDir, pdfName));
      } catch (convErr) {
        console.warn('DOCX -> PDF conversion failed, continuing without PDF', convErr?.message || convErr);
      }
    } else {
      // Fallback: simple placeholder replacement in plain text content (legacy)
      Object.entries(values).forEach(([key, value]) => {
        const regex = new RegExp(`<\\s*${key}\\s*>`, 'g');
        generatedContent = generatedContent.replace(regex, value ?? '');
      });
    }

    const normalizedDocumentCode = documentCode.trim().toUpperCase();

    // Determine department short code/name from template (DB has department as string)
    const deptValue = typeof template.department === 'string' ? template.department : (template.department?.shortCode || template.department?.name || String(template.department));
    const referenceNumber = await generateReferenceNumber(deptValue, normalizedDocumentCode);

    const document = await prisma.document.create({
      data: {
        templateId: template.id,
        documentName: template.name,
        department: deptValue,
        referenceNumber,
        content: generatedContent,
        filePath: savedPdfPath || savedDocxPath || undefined,
        docxPath: savedDocxPath || undefined,
        pdfPath: savedPdfPath || undefined,
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
          { department: { contains: query, mode: 'insensitive' } },
          { metadata: { contains: query, mode: 'insensitive' } }
        ]
      });
    }

    if (department) {
      const normalizedDepartment = department.trim();
      filters.push({
        OR: [
          { department: { contains: normalizedDepartment, mode: 'insensitive' } }
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

    // If stored filePath is a DOCX, convert that to PDF
    const currentPath = document.filePath;
    if (!currentPath) return res.status(400).json({ success: false, message: 'No file available to convert' });

    const ext = path.extname(currentPath).toLowerCase();
    if (ext === '.pdf') {
      return res.status(200).json({ success: true, message: 'PDF already available', filePath: currentPath });
    }

    if (ext === '.docx') {
      const docxBuffer = fs.readFileSync(path.resolve(currentPath));
      try {
        const pdfBuffer = await convertDocxBufferToPdf(docxBuffer);
        const outPdfDir = path.join('generated-documents', 'pdf');
        const pdfName = `document-${document.id}-${Date.now()}.pdf`;
        const savedPdf = saveBufferToFile(pdfBuffer, path.join(outPdfDir, pdfName));
        await prisma.document.update({ where: { id: document.id }, data: { filePath: savedPdf, pdfPath: savedPdf, docxPath: currentPath } });
        return res.status(200).json({ success: true, message: 'PDF generated successfully', filePath: savedPdf, pdfPath: savedPdf, docxPath: currentPath });
      } catch (err) {
        console.error('Conversion error', err);
        return res.status(500).json({ success: false, message: 'DOCX -> PDF conversion failed' });
      }
    }

    // Otherwise fallback to Puppeteer rendering of HTML content
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
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    // Prevent path traversal by ensuring file is inside allowed directories
    const allowedBases = [path.resolve('uploads'), path.resolve('generated-documents')];
    const isAllowed = allowedBases.some((b) => absolutePath.startsWith(b + path.sep) || absolutePath === b);
    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Access to this file is forbidden' });
    }

    return res.download(absolutePath, `${document.documentName || 'document'}${path.extname(absolutePath)}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};