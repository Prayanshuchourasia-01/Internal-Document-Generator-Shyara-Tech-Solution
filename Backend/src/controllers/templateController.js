import mammoth from 'mammoth';
import { extractPlaceholders } from '../utils/extractPlaceholders.js';
import prisma from '../config/prisma.js';

const resolveDepartment = async ({ departmentId, department }) => {
  if (departmentId) {
    const dep = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
    return dep ? { name: dep.name } : null;
  }

  if (!department) return null;

  // If department is a string, prefer the department name as provided
  return { name: department.trim() };
};

const normalizeTemplate = (template) => ({
  id: template.id,
  name: template.name,
  templateCode: template.templateCode,
  content: template.content,
  filePath: template.filePath,
  placeholders: template.placeholders ? JSON.parse(template.placeholders) : [],
  createdAt: template.createdAt,
  department: template.department ?? null
});

export const createTemplate = async (req, res) => {
  try {
    const { name, departmentId, department, content } = req.body;

    if (!name || !content || (!departmentId && !department)) {
      return res.status(400).json({ success: false, message: 'Template name, content, and department are required.' });
    }

    const resolvedDepartment = await resolveDepartment({ departmentId, department });
    if (!resolvedDepartment) {
      return res.status(404).json({ success: false, message: 'Department not found. Provide a valid department id or name.' });
    }

    const placeholders = extractPlaceholders(content);
    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        department: resolvedDepartment.name,
        content,
        placeholders: JSON.stringify(placeholders),
        filePath: null
      }
    });

    res.status(201).json({ success: true, template: normalizeTemplate(template) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });

    res.status(200).json({ success: true, templates: templates.map(normalizeTemplate) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({ where: { id: Number(id) } });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({ success: true, template: normalizeTemplate(template) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId, department, content } = req.body;

    if (!name && !departmentId && !department && !content) {
      return res.status(400).json({ success: false, message: 'Provide at least one field to update: name, department, or content.' });
    }

    let resolvedDepartment;
    if (departmentId || department) {
      resolvedDepartment = await resolveDepartment({ departmentId, department });
      if (!resolvedDepartment) {
        return res.status(404).json({ success: false, message: 'Department not found for update. Provide a valid department id or name.' });
      }
    }

    const template = await prisma.template.update({
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        department: resolvedDepartment?.name,
        content,
        placeholders: content ? JSON.stringify(extractPlaceholders(content)) : undefined
      }
    });

    res.status(200).json({ success: true, template: normalizeTemplate(template) });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.template.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTemplate = async (req, res) => {
  try {
//     console.log("BODY:", req.body);
// console.log("FILE:", req.file);
    const { name, templateCode,departmentId, department } = req.body;

 if (!name || !templateCode || (!departmentId && !department)) {
  return res.status(400).json({
    success: false,
    message: 'Template name, template code and department are required.'
  });
}

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'DOCX file is required.'
      });
    }

    const resolvedDepartment = await resolveDepartment({ departmentId, department });
    if (!resolvedDepartment) {
      return res.status(404).json({ success: false, message: 'Department not found. Provide a valid department id or name.' });
    }

    const result = await mammoth.extractRawText({ path: req.file.path });
    const content = result.value;
    const placeholders = extractPlaceholders(content);

const template = await prisma.template.create({
  data: {
    name: name.trim(),
    templateCode: templateCode.trim().toUpperCase(),
    department: resolvedDepartment.name,
    content,
    filePath: req.file.path,
    placeholders: JSON.stringify(placeholders)
  }
});

    res.status(201).json({ success: true, message: 'Template uploaded successfully', template: normalizeTemplate(template), placeholders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTemplatePlaceholders = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({ where: { id: Number(id) } });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({
      success: true,
      templateId: template.id,
      templateName: template.name,
      placeholders: JSON.parse(template.placeholders || '[]')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


