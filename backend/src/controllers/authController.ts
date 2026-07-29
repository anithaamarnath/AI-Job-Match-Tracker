import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { registerUser } from "../services/authService.js";
import type { RegisterInput } from "../validators/authValidator";

export const register = async (
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};