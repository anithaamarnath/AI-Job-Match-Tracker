import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { analyzeJobMatch } from "../services/jobMatchService.js";
import type { JobMatchInput } from "../validators/jobMatchValidator.js";

export const matchJob = async (
  req: Request<object, object, JobMatchInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await analyzeJobMatch(req.body);

    res.status(200).json({
      success: true,
      message: "Job match analysis completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};