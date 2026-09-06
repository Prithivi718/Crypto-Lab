import fs from 'node:fs/promises';
import { initializeWorkflow } from '../services/workflow.service.js';

export const handleUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;

        // Read file contents
        const fileContent = await fs.readFile(filePath, 'utf8');

        if (!fileContent || fileContent.trim() === '') {
            return res.status(400).json({ error: "File is empty" });
        }

        // Initialize the workflow using the extracted text
        const workflowInitParams = initializeWorkflow(fileContent);

        // We now keep the file permanently stored in the uploads directory
        // as requested, instead of unlinking it automatically.

        return res.status(201).json({
            message: "File successfully processed and workflow initialized.",
            workflowId: workflowInitParams.workflowId,
            extractedText: fileContent,
            status: workflowInitParams.status
        });

    } catch (error) {
        console.error("Upload processing error:", error);

        // Ensure error logging but do not delete the file automatically.

        return res.status(500).json({ error: "Failed to process uploaded file." });
    }
};
