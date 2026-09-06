import fs from 'node:fs/promises';
import { startWorkflow } from '../services/workflow.service.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export const handleUpload = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 'MISSING_FILE', 400);
        }

        const filePath = req.file.path;
        const fileContent = await fs.readFile(filePath, 'utf8');

        if (!fileContent || fileContent.trim() === '') {
            return errorResponse(res, 'File is empty', 'EMPTY_FILE', 400);
        }

        return successResponse(
            res,
            {
                filename: req.file.originalname || req.file.filename,
                fileSize: req.file.size,
                extractedText: fileContent
            },
            'File uploaded and processed successfully.',
            200
        );
    } catch (error) {
        console.error('Upload processing error:', error);
        return errorResponse(res, 'Failed to process uploaded file.', 'UPLOAD_ERROR', 500);
    }
};
