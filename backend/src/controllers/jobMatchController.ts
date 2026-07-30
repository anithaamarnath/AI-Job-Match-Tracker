import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { analyzeJobMatch } from "../services/jobMatchService.js";
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