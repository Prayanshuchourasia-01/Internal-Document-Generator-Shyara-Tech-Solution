import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const resolvePath = (relativePath) => path.resolve(relativePath);

const ensureDirectory = (directoryPath) => {
  const absolutePath = resolvePath(directoryPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

export const createBackup = async (req, res) => {
  try {
    const databaseFile = resolvePath('prisma/dev.db');
    const uploadsFolder = resolvePath('uploads');
    const generatedFolder = resolvePath('generated-documents');
    const backupFolder = resolvePath('backups');

    if (!fs.existsSync(databaseFile)) {
      return res.status(404).json({ success: false, message: 'Database file not found' });
    }

    ensureDirectory(backupFolder);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `backup-${timestamp}.zip`;
    const archivePath = path.join(backupFolder, archiveName);
    const zip = new AdmZip();

    zip.addLocalFile(databaseFile, 'database');
    if (fs.existsSync(uploadsFolder)) {
      zip.addLocalFolder(uploadsFolder, 'uploads');
    }
    if (fs.existsSync(generatedFolder)) {
      zip.addLocalFolder(generatedFolder, 'generated-documents');
    }

    zip.writeZip(archivePath);
    return res.download(archivePath, archiveName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const archivePath = resolvePath(path.join('backups', filename));

    if (!fs.existsSync(archivePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    return res.download(archivePath, filename);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Backup ZIP file is required.' });
    }

    const backupZipPath = resolvePath(req.file.path);
    if (!fs.existsSync(backupZipPath)) {
      return res.status(404).json({ success: false, message: 'Uploaded backup file not found.' });
    }

    const tempDir = resolvePath('temp-restore');
    fs.rmSync(tempDir, { recursive: true, force: true });
    ensureDirectory(tempDir);

    const zip = new AdmZip(backupZipPath);

    // Validate entries to prevent zip-slip
    const entries = zip.getEntries();
    for (const entry of entries) {
      const name = entry.entryName;
      if (name.includes('..') || path.isAbsolute(name) || name.startsWith('/') || name.match(/^[A-Za-z]:\\/)) {
        return res.status(400).json({ success: false, message: 'Invalid backup archive (contains unsafe paths)' });
      }
    }

    zip.extractAllTo(tempDir, true);

    const restoredDbPath = path.join(tempDir, 'database', 'dev.db');
    if (!fs.existsSync(restoredDbPath)) {
      return res.status(400).json({ success: false, message: 'Backup ZIP must contain database/dev.db' });
    }

    fs.copyFileSync(restoredDbPath, resolvePath('prisma/dev.db'));

    const restoreFolder = (sourceDir, targetDir) => {
      if (fs.existsSync(sourceDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(sourceDir, targetDir, { recursive: true });
      }
    };

    restoreFolder(path.join(tempDir, 'uploads'), resolvePath('uploads'));
    restoreFolder(path.join(tempDir, 'generated-documents'), resolvePath('generated-documents'));

    fs.rmSync(tempDir, { recursive: true, force: true });

    return res.status(200).json({ success: true, message: 'Backup restored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};