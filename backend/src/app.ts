import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import featureRoutes from "./routes/featureRoutes";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/health", healthRoutes);
app.use("/api/features", featureRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AI Job Match Tracker API is running",
    timestamp: new Date().toISOString()
  });
});

export default app;