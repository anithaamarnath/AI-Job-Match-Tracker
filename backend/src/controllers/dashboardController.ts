import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { getDashboardData } from "../services/dashboardService.js";
import { AppError } from "../utils/AppError.js";

export const getDashboard = async (
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

    const dashboard =
      await getDashboardData(userId);

    res.status(200).json({
      success: true,
      message:
        "Dashboard data retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};