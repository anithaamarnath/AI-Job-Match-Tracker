import { Request, Response } from "express";
import { CreateJobInput } from "../validators/jobValidator";
import { randomUUID } from "node:crypto";

export const createJob = (
  req: Request<object, object, CreateJobInput>,
  res: Response
): Response => {
  const job = {
    id: randomUUID(),
    company: req.body.company,
    role: req.body.role,
    description: req.body.description,
    status: "SAVED",
    createdAt: new Date().toISOString()
  };

  return res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job
  });
};