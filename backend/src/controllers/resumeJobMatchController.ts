import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/AppError.js";
import { calculateResumeJobMatch } from "../services/resumeJobMatchService.js";

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