import type { Request, Response } from "express";
import { getAppFeatures } from "../services/featureService.js";

export const getFeatures = (req: Request, res: Response) => {
  const features = getAppFeatures();

  res.status(200).json({
    success: true,
    features
  });
};