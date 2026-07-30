import type {
  NextFunction,
  Request,
  Response,
} from "express";
import {
  deleteResumeHistoryById,
  getResumeHistory,
  getResumeHistoryById,
  saveUploadedResume,
} from "../services/resumeService.js";

import { AppError } from "../utils/AppError.js";


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

    const savedResume = await saveUploadedResume({
      userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and saved successfully",
      data: savedResume,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const resumes = await getResumeHistory(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Resumes retrieved successfully",
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const resumeId = req.params.id;

    if (!resumeId) {
      throw new AppError(
        "Resume ID is required",
        400
      );
    }

    const resume = await getResumeHistoryById(
      req.user.id,
      resumeId
    );

    res.status(200).json({
      success: true,
      message: "Resume retrieved successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const resumeId = req.params.id;

    if (!resumeId) {
      throw new AppError(
        "Resume ID is required",
        400
      );
    }

    await deleteResumeHistoryById(
      req.user.id,
      resumeId
    );

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};