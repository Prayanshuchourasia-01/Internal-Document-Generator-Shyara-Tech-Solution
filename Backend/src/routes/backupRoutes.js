import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { createBackup, downloadBackup, restoreBackup } from '../controllers/backupController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const backupDir = path.resolve('backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    cb(null, backupDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const backupUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP backup files are allowed'), false);
    }
  }
});

router.get('/export', createBackup);
router.post('/restore', backupUpload.single('backup'), restoreBackup);
router.get('/download/:filename', downloadBackup);

export default router;