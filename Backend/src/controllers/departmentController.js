import prisma from '../config/prisma.js';

export const createDepartment = async (req, res) => {
  try {
    const { name, shortCode } = req.body;

    if (!name || !shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Department name and shortCode are required'
      });
    }

    const normalizedShortCode = shortCode.trim().toUpperCase();

    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { shortCode: normalizedShortCode }
        ]
      }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with that name or shortCode already exists'
      });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        shortCode: normalizedShortCode
      }
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortCode } = req.body;

    if (!name && !shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or shortCode to update'
      });
    }

    const normalizedShortCode = shortCode?.trim().toUpperCase();

    const existingDepartment = await prisma.department.findFirst({
      where: {
        NOT: {
          id: Number(id)
        },
        OR: [
          name ? { name: name.trim() } : undefined,
          normalizedShortCode ? { shortCode: normalizedShortCode } : undefined
        ].filter(Boolean)
      }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Another department with that name or shortCode already exists'
      });
    }

    const department = await prisma.department.update({
      where: {
        id: Number(id)
      },
      data: {
        name: name?.trim(),
        shortCode: normalizedShortCode
      }
    });

    res.status(200).json({ success: true, department });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: {
        id: Number(id)
      }
    });

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};