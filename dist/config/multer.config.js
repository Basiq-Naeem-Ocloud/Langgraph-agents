"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const fs_1 = require("fs");
const createDirIfNotExists = (dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
};
createDirIfNotExists('./uploads/documents');
createDirIfNotExists('./uploads/images');
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const isImage = file.mimetype.startsWith('image/');
            const destination = isImage ? './uploads/images' : './uploads/documents';
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map