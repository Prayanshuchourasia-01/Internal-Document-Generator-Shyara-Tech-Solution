import prisma from '../config/prisma.js';

export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const existingDepartment = await prisma.department.findUnique({
            where: {
                name
            }
        });

        if (existingDepartment) {
            return res.status(400).json({
                message: "Department already exists"
            });
        }

        const department = await prisma.department.create({
            data: {
                name
            }
        });

        res.status(201).json(department);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getDepartments = async (req, res) => {
    try {

        const departments = await prisma.department.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(departments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
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
                message: "Department not found"
            });
        }

        res.status(200).json(department);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateDepartment = async (req, res) => {
    try {

        const { id } = req.params;
        const { name } = req.body;

        const department = await prisma.department.update({
            where: {
                id: Number(id)
            },
            data: {
                name
            }
        });

        res.status(200).json(department);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
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

        res.status(200).json({
            message: "Department deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};