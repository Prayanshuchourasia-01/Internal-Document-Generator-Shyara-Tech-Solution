import prisma from '../config/prisma.js';
import Handlebars from 'handlebars';

export const generateDocument = async (req, res) => {
    try {
        const { templateId, data } = req.body;

        const template = await prisma.template.findUnique({
            where: {
                id: Number(templateId)
            }
        });

        if (!template) {
            return res.status(404).json({
                message: 'Template not found'
            });
        }

        const compiledTemplate = Handlebars.compile(template.content);

        const generatedContent = compiledTemplate(data);

        const document = await prisma.document.create({
            data: {
                templateId: template.id,
                content: generatedContent
            }
        });

        res.status(201).json(document);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};