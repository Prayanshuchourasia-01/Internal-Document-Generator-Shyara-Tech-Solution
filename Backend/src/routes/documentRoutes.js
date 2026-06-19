import express from 'express';
import {
  generateDocument,
  getDocuments,
  getDocumentById,
  generatePDF,
  previewDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  regenerateDocument  // <-- ADD
} from '../controllers/documentController.js';

const router = express.Router();
router.post('/preview', previewDocument);
router.post('/generate', generateDocument);
router.post('/:id/regenerate', regenerateDocument);  // <-- ADD THIS LINE
router.get('/search', getDocuments);
router.get('/history', getDocuments);
router.get('/', getDocuments);
router.get('/:id/download', downloadDocument);
router.get('/:id/pdf', generatePDF);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/:id', getDocumentById);

export default router;