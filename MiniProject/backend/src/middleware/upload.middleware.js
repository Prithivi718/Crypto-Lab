import multer from "multer";
import { config } from '../config/config.js';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

export default upload;