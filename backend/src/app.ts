import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import jobRoutes from "./routes/jobMatchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobMatchRoutes from "./routes/jobMatchRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeJobMatchRoutes from "./routes/resumeJobMatchRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/match", jobMatchRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/matches",resumeJobMatchRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.use(notFound);
app.use(errorHandler);
export default app;