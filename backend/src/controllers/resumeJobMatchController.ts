import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/AppError.js";
import { 
  calculateResumeJobMatch,
  deleteResumeJobMatchHistoryById,
  getResumeJobMatchHistory,
  getResumeJobMatchHistoryById,
 } from "../services/resumeJobMatchService.js";


export const createResumeJobMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        "User is not authenticated",
        401
      );
    }

    const { resumeId, jobId } = req.body;

    const result =
      await calculateResumeJobMatch(
        userId,
        resumeId,
        jobId
      );

    res.status(200).json({
      success: true,
      message:
        "Resume and job matched successfully",
      data: {
        resumeId,
        jobId,
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeJobMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        "User is not authenticated",
        401
      );
    }

    const matches =
      await getResumeJobMatchHistory(userId);

    res.status(200).json({
      success: true,
      message:
        "Resume-job match history retrieved successfully",
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeJobMatch = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        "User is not authenticated",
        401
      );
    }

    const match =
      await getResumeJobMatchHistoryById(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Resume-job match result retrieved successfully",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResumeJobMatch = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        "User is not authenticated",
        401
      );
    }

    await deleteResumeJobMatchHistoryById(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Resume-job match result deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};