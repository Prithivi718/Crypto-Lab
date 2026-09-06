// errorMiddleware.js
import { errorResponse } from '../utils/responseUtils.js';
import { config } from '../config/config.js';

export const errorHandler = (err, req, res, next) => {
    console.error(`[Error Handler] ${err.name}: ${err.message}`);

    if (config.env === 'development' && err.stack) {
        console.error(err.stack);
    }

    // Multer upload errors
    if (err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File is too large'
            : 'File upload error';
        return errorResponse(res, message, `UPLOAD_${err.code}`, 400);
    }

    // Generic request/payload validation errors
    if (err.type === 'entity.parse.failed') {
        return errorResponse(res, "Invalid JSON payload", "BAD_REQUEST", 400);
    }

    // Default error
    return errorResponse(
        res,
        err.message || 'Internal Server Error',
        err.code || 'INTERNAL_ERROR',
        err.statusCode || 500
    );
};
