// reportRoutes.js
import express from 'express';
import { getReport, generateReportFileController } from '../controllers/analysisController.js';

const router = express.Router();

// POST /api/report/generate
router.post('/generate', generateReportFileController);

// GET /api/report/:executionId
router.get('/:executionId', getReport);

export default router;
