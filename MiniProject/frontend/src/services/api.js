/* global process */
const API_BASE_URL = typeof window !== 'undefined' && window.API_URL
    ? window.API_URL
    : "http://localhost:5000/api";

export const checkHealth = async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("File Upload failed");
    }

    return response.json();
};

export const runProcess = async (message, filename = 'mission.txt', fileSize = 0) => {
    const response = await fetch(`${API_BASE_URL}/process/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, filename, fileSize })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Process execution failed");
    }

    return response.json();
};

export const startWorkflow = async (message, filename = 'mission.txt', fileSize = 0) => {
    const response = await fetch(`${API_BASE_URL}/workflow/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, filename, fileSize })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Workflow initialization failed");
    }

    return response.json();
};

export const executeWorkflowStep = async (workflowId, step) => {
    const response = await fetch(`${API_BASE_URL}/workflow/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, step })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Step ${step} execution failed`);
    }

    return response.json();
};

export const getWorkflowState = async (workflowId) => {
    if (!workflowId) {
        throw new Error("Workflow ID is required to fetch state");
    }
    const response = await fetch(`${API_BASE_URL}/workflow/${workflowId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch workflow state");
    }
    return response.json();
};

export const resetWorkflow = async (workflowId) => {
    if (!workflowId) {
        throw new Error("Workflow ID is required to reset workflow");
    }
    const response = await fetch(`${API_BASE_URL}/workflow/reset/${workflowId}`, {
        method: "POST"
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reset workflow");
    }
    return response.json();
};

export const getReport = async (executionId) => {
    if (!executionId) {
        throw new Error("Execution ID is required to fetch report");
    }
    const response = await fetch(`${API_BASE_URL}/report/${executionId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch execution report");
    }
    return response.json();
};

/**
 * Triggers backend report file generation and initiates browser file download.
 * Ensures the browser receives exported TXT/PDF file while full context remains in backend.
 * @param {string} executionId 
 * @param {string} format - 'txt' | 'pdf'
 */
export const exportReportFile = async (executionId, format = 'txt') => {
    if (!executionId) {
        throw new Error("Execution ID is required to generate a report");
    }

    const response = await fetch(`${API_BASE_URL}/report/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ executionId, format })
    });

    if (!response.ok) {
        let errorMsg = "Report generation failed";
        try {
            const errJson = await response.json();
            errorMsg = errJson.message || errorMsg;
        } catch {
            // response was not json
        }
        throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `SecureNet_Report_${executionId}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, executionId, format };
};