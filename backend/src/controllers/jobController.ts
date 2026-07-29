import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createJob as createJobService,
  deleteJob as deleteJobService,
  getAllJobs as getAllJobsService,
  getJobById as getJobByIdService,
  updateJob as updateJobService,
} from "../services/jobService";

import type {
  CreateJobInput,
  UpdateJobInput,
} from "../validators/jobValidator";

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
  _req: Request,
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

export const getJobById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await getJobByIdService(req.params.id);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request<{ id: string }, object, UpdateJobInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await updateJobService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteJobService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};