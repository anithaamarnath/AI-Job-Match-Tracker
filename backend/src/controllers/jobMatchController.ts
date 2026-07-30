import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { 
  analyzeJobMatch,
  deleteMatchHistoryById,
  getMatchHistory,
  getMatchHistoryById
 } from "../services/jobMatchService.js";
import type { JobMatchInput } from "../validators/jobMatchValidator.js";
import { AppError } from "../utils/AppError.js";

export const matchJob = async (
  req: Request<object, object, JobMatchInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const result = await analyzeJobMatch(
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Job match analysis completed and saved",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobMatchHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const history = await getMatchHistory(userId);

    res.status(200).json({
      success: true,
      message: "Job match history retrieved successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobMatchHistoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const matchId = req.params.id;

    const match = await getMatchHistoryById(
      userId,
      matchId
    );

    res.status(200).json({
      success: true,
      message: "Job match result retrieved successfully",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteJobMatchHistoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    await deleteMatchHistoryById(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Job match result deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

