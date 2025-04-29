import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Handle document files (PDF, CSV)
    if (file.fieldname === 'document') {
      const allowedMimeTypes = ['application/pdf', 'text/csv'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid document file type. Only PDF and CSV files are allowed.'), false);
      }
    }
    // Handle image files (PNG, JPG)
    else if (file.fieldname === 'image') {
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image file type. Only PNG and JPG files are allowed.'), false);
      }
    }
    // Reject other file types
    else {
      cb(new Error('Invalid field name. Only "document" and "image" fields are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}; 