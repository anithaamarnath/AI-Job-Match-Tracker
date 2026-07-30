import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/AppError.js";
import { extractTextFromPdf } from "../services/resumeService.js";

export const uploadResumeFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    if (!req.file) {
      throw new AppError("Resume file is required", 400);
    }
    const extractedText = await extractTextFromPdf(req.file.path);

    res.status(201).json({
    success: true,
    message: "Resume uploaded successfully",
    data: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      extractedText,
  },
});
  } catch (error) {
    next(error);
  }
};