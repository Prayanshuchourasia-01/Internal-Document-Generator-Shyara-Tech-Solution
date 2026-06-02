import express from 'express';
import { generateDocument } from '../controllers/documentController.js';

const router = express.Router();

router.post('/generate', generateDocument);

export default router;