import type {
  RequestHandler,
} from "express";

import { ZodError } from "zod";
import type { ZodType } from "zod";

export const validateRequest = (
  schema: ZodType
): RequestHandler => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map(
            (issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })
          ),
        });

        return;
      }

      next(error);
    }
  };
};