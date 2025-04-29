"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'document') {
            const allowedMimeTypes = ['application/pdf', 'text/csv'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid document file type. Only PDF and CSV files are allowed.'), false);
            }
        }
        else if (file.fieldname === 'image') {
            const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid image file type. Only PNG and JPG files are allowed.'), false);
            }
        }
        else {
            cb(new Error('Invalid field name. Only "document" and "image" fields are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map