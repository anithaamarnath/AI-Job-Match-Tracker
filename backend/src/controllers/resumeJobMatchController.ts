import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  calculateResumeJobMatch,
  deleteResumeJobMatchHistoryById,
   getResumeJobMatchHistory as getResumeJobMatchHistoryService,
  getResumeJobMatchHistoryById,
} from "../services/resumeJobMatchService.js";

import { AppError } from "../utils/AppError.js";

export const createResumeJobMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const result = await calculateResumeJobMatch(
      userId,
      req.body.resumeId,
      req.body.jobId
    );

    res.status(201).json({
      success: true,
      message: "Resume-job match created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeJobMatchHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const matches = await getResumeJobMatchHistoryService(userId);

    res.status(200).json({
      success: true,
      message: "Resume-job match history retrieved successfully",
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeJobMatchById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const match = await getResumeJobMatchHistoryById(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Resume-job match retrieved successfully",
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
      throw new AppError("User is not authenticated", 401);
    }

    await deleteResumeJobMatchHistoryById(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Resume-job match deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};