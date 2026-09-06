import express from "express";
import uploadRoutes from "./routes/upload.routes.js";
import processRoutes from "./routes/processRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API Health is good and monitored ✅",
        timestamp: new Date.toISOString()
    });
});

app.use("/api/upload", uploadRoutes);
app.use("/api/process", processRoutes);
app.use("/api/workflow", workflowRoutes);

// Registering central error handler below all routes
app.use(errorHandler);

export default app;