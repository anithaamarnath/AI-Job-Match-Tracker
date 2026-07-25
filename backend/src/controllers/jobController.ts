import type { NextFunction, Request, Response } from "express";
import {
  createJob as createJobService,
  getAllJobs as getAllJobsService,
} from "../services/jobService";
import type { CreateJobInput } from "../validators/jobValidator";

export const createJob = async (
  req: Request<object, object, CreateJobInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await createJobService(req.body);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await getAllJobsService();

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};