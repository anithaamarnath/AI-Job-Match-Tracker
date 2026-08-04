import path from "node:path";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  ParamsDictionary,
} from "express-serve-static-core";

import {
  analyzeSavedResume,
  deleteResumeHistoryById,
  generateAIResumeAnalysis,
  getResumeHistory,
  getResumeHistoryById,
  getSavedAIResumeAnalysis,
  getSavedResumeAnalysis,
  saveUploadedResume,
} from "../services/resumeService.js";

import { AppError } from "../utils/AppError.js";

export interface ResumeParams
  extends ParamsDictionary {
  id: string;
}

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

const getAuthenticatedUserId = (
  req: RequestWithUser
): string => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(
      "User is not authenticated",
      401
    );
  }

  return userId;
};

export const uploadResumeFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!req.file) {
      throw new AppError(
        "Resume file is required",
        400
      );
    }

    const savedResume =
      await saveUploadedResume({
        userId,
        originalName:
          req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
      });

    res.status(201).json({
      success: true,
      message:
        "Resume uploaded and saved successfully",
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
    const userId =
      getAuthenticatedUserId(req);

    const resumes =
      await getResumeHistory(userId);

    res.status(200).json({
      success: true,
      message:
        "Resumes retrieved successfully",
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const resume =
      await getResumeHistoryById(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Resume retrieved successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    await deleteResumeHistoryById(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const analysis =
      await analyzeSavedResume(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Resume analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeAnalysis = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const analysis =
      await getSavedResumeAnalysis(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Saved resume analysis retrieved successfully",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResumeWithAI = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const result =
      await generateAIResumeAnalysis(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "AI resume analysis completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIResumeAnalysis = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const result =
      await getSavedAIResumeAnalysis(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Saved AI resume analysis retrieved",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const previewResumeFile = async (
  req: Request<ResumeParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const resume =
      await getResumeHistoryById(
        userId,
        req.params.id
      );

    const absoluteFilePath =
      path.resolve(resume.filePath);

    res.sendFile(
      absoluteFilePath,
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};