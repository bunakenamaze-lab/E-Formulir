import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
['images', 'documents', 'signatures'].forEach((dir) => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = file.mimetype;
    let subDir = 'documents';
    if (mimeType.startsWith('image/')) subDir = 'images';
    cb(null, path.join(uploadDir, subDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
});

router.post('/file', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'File tidak ditemukan', 400);
  }

  const fileUrl = `${process.env.APP_URL}/uploads/${
    req.file.mimetype.startsWith('image/') ? 'images' : 'documents'
  }/${req.file.filename}`;

  sendSuccess(res, {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    url: fileUrl,
  }, 'File berhasil diupload', 201);
});

router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'Gambar tidak ditemukan', 400);
  }

  const imageUrl = `${process.env.APP_URL}/uploads/images/${req.file.filename}`;

  sendSuccess(res, {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: imageUrl,
  }, 'Gambar berhasil diupload', 201);
});

router.post('/avatar', authenticate, upload.single('avatar'), (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'Avatar tidak ditemukan', 400);
  }

  const avatarUrl = `${process.env.APP_URL}/uploads/images/${req.file.filename}`;

  sendSuccess(res, { url: avatarUrl }, 'Avatar berhasil diupload', 201);
});

export default router;
