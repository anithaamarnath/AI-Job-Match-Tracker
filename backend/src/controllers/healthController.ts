import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "AI Job Match Tracker API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};