import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AI Job Match Tracker API is running",
    timestamp: new Date().toISOString()
  });
});

export default app;