// fileUtils.js
import fs from 'node:fs/promises';
import { config } from '../config/config.js';

export const readTextFile = async (filePath) => {
    try {
        const stat = await fs.stat(filePath);
        if (stat.size > config.upload.maxFileSize) {
            throw Object.assign(new Error(`File exceeds maximum size of ${config.upload.maxFileSize} bytes`), { code: 'FILE_TOO_LARGE' });
        }

        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        throw error;
    }
};

export const deleteFile = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        // If file doesn't exist, ignore
        if (error.code === 'ENOENT') return false;
        console.error(`Failed to delete file ${filePath}:`, error.message);
        throw error;
    }
};

export const validateTextFile = (file) => {
    if (!file) throw new Error("No file provided");
    if (!config.upload.allowedTypes.includes(file.mimetype)) {
        throw Object.assign(new Error("Unsupported file type"), { code: 'INVALID_FILE_TYPE' });
    }
    return true;
};

export const getFileMetadata = async (filePath) => {
    try {
        const stat = await fs.stat(filePath);
        return {
            size: stat.size,
            createdAt: stat.birthtime,
            modifiedAt: stat.mtime
        };
    } catch (error) {
        return null;
    }
};
