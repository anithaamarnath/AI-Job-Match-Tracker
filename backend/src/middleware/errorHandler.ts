import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

import multer from "multer";

import { AppError } from "../utils/AppError.js";

interface BodyParserError extends SyntaxError {
  status?: number;
  type?: string;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "Resume file must be smaller than 5 MB",
      });

      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  const bodyParserError = error as BodyParserError;

  if (
    bodyParserError instanceof SyntaxError &&
    bodyParserError.status === 400 &&
    bodyParserError.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};