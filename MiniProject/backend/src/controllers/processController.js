// processController.js
import { process_run } from '../services/process.service.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export const runProcess = async (req, res) => {
    try {
        const { message, filename, fileSize } = req.body;

        if (!message) {
            return errorResponse(res, 'Message is required', 'MISSING_MESSAGE', 400);
        }

        const result = await process_run(message, { filename, fileSize });

        if (!result.success) {
            return errorResponse(res, result.error || 'Process execution failed', 'EXECUTION_FAILED', 500);
        }

        return successResponse(
            res,
            {
                executionId: result.executionId,
                status: result.status,
                summary: result.summary,
                timing: result.timing
            },
            'Process execution completed successfully'
        );
    } catch (error) {
        return errorResponse(res, error.message, 'INTERNAL_ERROR', 500);
    }
};
