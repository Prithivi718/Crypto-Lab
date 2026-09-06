import multer from "multer";
import path from "node:path";
import { config } from '../config/config.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Now depends on centralized configuration
        cb(null, config.dirs.upload);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || ".txt";
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

export default upload;