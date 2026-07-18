import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import featureRoutes from "./routes/featureRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import jobRoutes from "./routes/jobRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/jobs", jobRoutes);



app.use(notFound);
app.use(errorHandler);
export default app;