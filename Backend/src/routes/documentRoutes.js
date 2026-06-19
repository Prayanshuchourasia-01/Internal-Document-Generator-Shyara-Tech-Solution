import express from 'express';
import {
  generateDocument,
  getDocuments,
  getDocumentById,
  generatePDF,
  previewDocument,
  downloadDocument,
  updateDocument,      // <-- ADD
  deleteDocument       // <-- ADD
} from '../controllers/documentController.js';

const router = express.Router();
router.post('/preview', previewDocument);
router.post('/generate', generateDocument);
router.get('/search', getDocuments);
router.get('/history', getDocuments);
router.get('/', getDocuments);
router.get('/:id/download', downloadDocument);
router.get('/:id/pdf', generatePDF);
router.put('/:id', updateDocument);       // <-- ADD THIS LINE
router.delete('/:id', deleteDocument);  // <-- ADD THIS LINE
router.get('/:id', getDocumentById);

export default router;