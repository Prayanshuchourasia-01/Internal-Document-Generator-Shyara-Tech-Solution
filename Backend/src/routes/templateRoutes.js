import express from 'express';

import {
createTemplate,
getTemplates,
getTemplateById,
updateTemplate,
deleteTemplate,
uploadTemplate
} from '../controllers/templateController.js';

import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
'/upload',
upload.single('template'),
uploadTemplate
);

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;

