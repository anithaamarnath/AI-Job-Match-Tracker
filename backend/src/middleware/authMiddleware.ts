import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

interface AccessTokenPayload {
  userId: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      next(new AppError("Authentication token is required", 401));
      return;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      next(
        new AppError(
          "Authentication token must use the Bearer format",
          401
        )
      );
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      next(new Error("JWT_SECRET is not configured"));
      return;
    }

    const decoded = jwt.verify(
      token,
      secret
    ) as AccessTokenPayload;

    if (!decoded.userId) {
      next(new AppError("Invalid authentication token", 401));
      return;
    }

    req.user = {
      id: decoded.userId,
    };
  
    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      next(new AppError("Invalid or expired token", 401));
      return;
    }

    next(error);
  }
};