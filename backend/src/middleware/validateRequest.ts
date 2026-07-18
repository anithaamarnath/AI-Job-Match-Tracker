import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

export const validateRequest =
  (schema: ZodType) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      next(error);
    }
  };