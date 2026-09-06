// analysisController.js
import { generateReport, generateReportFile } from '../services/report.service.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export const getReport = async (req, res) => {
    try {
        const { executionId } = req.params;

        if (!executionId) {
            return errorResponse(res, 'Execution ID is required', 'MISSING_EXECUTION_ID', 400);
        }

        const report = generateReport(executionId);

        return successResponse(
            res,
            { report },
            'Demonstration report generated successfully'
        );
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return errorResponse(res, error.message, 'REPORT_ERROR', statusCode);
    }
};

export const generateReportFileController = async (req, res) => {
    try {
        const { executionId, format } = req.body;

        if (!executionId) {
            return errorResponse(res, 'Execution ID is required', 'MISSING_EXECUTION_ID', 400);
        }

        const reportFile = await generateReportFile(executionId, format || 'txt');

        res.setHeader('Content-Type', reportFile.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${reportFile.filename}"`);

        return res.send(reportFile.buffer);
    } catch (error) {
        const statusCode = error.message.includes('not found')
            ? 404
            : (error.message.includes('Unsupported') ? 400 : 500);

        return errorResponse(res, error.message, 'REPORT_GENERATION_FAILED', statusCode);
    }
};
