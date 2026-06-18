import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const allowedExtensions = ['.docx'];
    const blockedExtensions = ['.exe', '.js', '.bat', '.com', '.msi', '.scr', '.cmd', '.vbs'];
    const extension = path.extname(file.originalname || '').toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
        return cb(new Error('Only DOCX files are allowed'), false);
    }

    if (blockedExtensions.includes(extension)) {
        return cb(new Error('Blocked file type'), false);
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});