import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (error instanceof AppError) {
    logger.warn(`${error.statusCode} - ${error.message}`);

    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  logger.error(error.message, {
    stack: error.stack,
    method: req.method,
    path: req.originalUrl
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};