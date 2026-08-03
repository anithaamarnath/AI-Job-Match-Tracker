import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import featureRoutes from "./routes/featureRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import jobRoutes from "./routes/jobRoutes";
import authRoutes from "./routes/authRoutes";
import jobMatchRoutes from "./routes/jobMatchRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeJobMatchRoutes from "./routes/resumeJobMatchRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

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