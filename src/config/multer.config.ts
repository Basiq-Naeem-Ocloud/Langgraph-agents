import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Create necessary directories
const createDirIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
createDirIfNotExists('./uploads/documents');
createDirIfNotExists('./uploads/images');

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Determine the destination based on file type
      const isImage = file.mimetype.startsWith('image/');
      const destination = isImage ? './uploads/images' : './uploads/documents';
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      // Keep original filename
      cb(null, file.originalname);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}; 