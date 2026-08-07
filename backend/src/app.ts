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

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/match", jobMatchRoutes);
app.use("/api/matches", resumeJobMatchRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;