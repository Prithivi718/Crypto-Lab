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
            await fs.unlink(filePath).catch(console.error); // cleanup
            return res.status(400).json({ error: "File is empty" });
        }

        // Initialize the workflow using the extracted text
        const workflowInitParams = initializeWorkflow(fileContent);

        // Clean up the temporary file
        await fs.unlink(filePath).catch(console.error);

        return res.status(201).json({
            message: "File successfully processed and workflow initialized.",
            workflowId: workflowInitParams.workflowId,
            extractedText: fileContent,
            status: workflowInitParams.status
        });

    } catch (error) {
        console.error("Upload processing error:", error);

        // Ensure cleanup even on error
        if (req.file && req.file.path) {
            await fs.unlink(req.file.path).catch(console.error);
        }

        return res.status(500).json({ error: "Failed to process uploaded file." });
    }
};
