import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import jobMatchRoutes from "./routes/jobMatchRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeJobMatchRoutes from "./routes/resumeJobMatchRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/features", featureRoutes);

/*
 * Job CRUD:
 * company, role, description
 */
app.use("/api/jobs", jobRoutes);

/*
 * Older direct job-description matching feature:
 * resumeId, jobDescription
 */
app.use("/api/match", jobMatchRoutes);

/*
 * Saved resume-to-saved-job matching:
 * resumeId, jobId
 */
app.use("/api/matches", resumeJobMatchRoutes);

app.use("/api/resume", resumeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;