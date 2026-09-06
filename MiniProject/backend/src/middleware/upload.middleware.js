import multer from "multer";
import { config } from '../config/config.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Now depends on centralized configuration
        cb(null, config.dirs.upload);
    },

    filename : function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSize
    }
});

export default upload;