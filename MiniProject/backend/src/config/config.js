import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env relative to the current working environment
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    dirs: {
        upload: path.join(ROOT_DIR, process.env.UPLOAD_DIR || 'upload'),
        reports: path.join(ROOT_DIR, process.env.REPORT_DIR || 'reports'),
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'text/plain').split(',')
    },

    benchmark: {
        iterations: parseInt(process.env.BENCHMARK_ITERATIONS || '1', 10)
    },

    workflow: {
        timeoutMs: parseInt(process.env.WORKFLOW_TIMEOUT || '300000', 10) // 5 mins
    }
};
