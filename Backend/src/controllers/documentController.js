import prisma from '../config/prisma.js';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

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

export const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await prisma.document.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        res.status(200).json(document);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Pdf Generation 
export const generatePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await prisma.document.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

     const browser = await puppeteer.launch({
    headless: true
});

        const page = await browser.newPage();

        await page.setContent(document.content);

        const pdf = await page.pdf({
            format: 'A4'
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=document-${id}.pdf`
        });

        res.send(pdf);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};