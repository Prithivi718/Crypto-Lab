// processController.js

import { runBenchmarkProcess } from '../services/benchmark.service.js';

export const runProcess = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // We use the benchmark process so an independent performance
        // report is saved natively to the reports folder with analytics
        const result = await runBenchmarkProcess(message, "direct_api_input");

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
