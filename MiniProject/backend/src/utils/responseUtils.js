// responseUtils.js

export const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data
    });
};

export const errorResponse = (res, error = "An error occurred", code = "INTERNAL_ERROR", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error,
        code
    });
};

export const workflowStepResponse = (res, stepData) => {
    // Expected stepData shape: { step, phase, algorithm, title, status, description, details... }
    return res.status(200).json({
        success: true,
        ...stepData
    });
};
