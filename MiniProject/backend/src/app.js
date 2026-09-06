import express from "express";
import uploadRoutes from "./routes/upload.routes.js";
import processRoutes from "./routes/processRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API Health is good and monitored ✅",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/upload", uploadRoutes);
app.use("/api/process", processRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/report", reportRoutes);

// Registering central error handler below all routes
app.use(errorHandler);

export default app;