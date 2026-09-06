// workflowController.js
import {
    startWorkflow as serviceStartWorkflow,
    executeStep as serviceExecuteStep,
    getWorkflowState,
    resetWorkflow
} from '../services/workflow.service.js';
import { successResponse, errorResponse, workflowStepResponse } from '../utils/responseUtils.js';

export const startWorkflow = (req, res) => {
    try {
        const { message, filename, fileSize } = req.body;

        if (!message) {
            return errorResponse(res, 'Message is required to start workflow.', 'MISSING_MESSAGE', 400);
        }

        const result = serviceStartWorkflow({ message, filename, fileSize });
        return successResponse(res, result, 'Workflow session initialized successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 'WORKFLOW_INIT_FAILED', 500);
    }
};

export const getState = (req, res) => {
    try {
        const { id } = req.params;
        const state = getWorkflowState(id);

        return successResponse(
            res,
            {
                workflowId: state.workflowId,
                executionId: state.executionId,
                currentStep: state.currentStep,
                status: state.status,
                completedSteps: state.completedSteps
            },
            'Workflow state retrieved'
        );
    } catch (error) {
        return errorResponse(res, error.message, 'WORKFLOW_NOT_FOUND', 404);
    }
};

export const executeStep = async (req, res) => {
    try {
        const { workflowId, step } = req.body;

        if (!workflowId || step === undefined) {
            return errorResponse(res, 'workflowId and step are required.', 'INVALID_INPUT', 400);
        }

        const stepNumber = parseInt(step, 10);
        if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 9) {
            return errorResponse(res, 'Step must be a number between 1 and 9.', 'INVALID_STEP', 400);
        }

        const result = await serviceExecuteStep(workflowId, stepNumber);

        if (result.status === 'failed') {
            return errorResponse(res, result.error || 'Step execution failed', 'STEP_FAILED', 400);
        }

        return workflowStepResponse(res, result);
    } catch (error) {
        return errorResponse(res, error.message, 'WORKFLOW_STEP_ERROR', 500);
    }
};

export const reset = (req, res) => {
    try {
        const { id } = req.params;
        const resetSuccess = resetWorkflow(id);

        if (resetSuccess) {
            return successResponse(res, { reset: true }, 'Workflow reset successfully');
        }
        return errorResponse(res, 'Failed to reset workflow', 'RESET_FAILED', 400);
    } catch (error) {
        return errorResponse(res, error.message, 'RESET_ERROR', 500);
    }
};
