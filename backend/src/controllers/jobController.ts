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
} from "../services/jobService.js";

import { AppError } from "../utils/AppError.js";

const getAuthenticatedUserId = (req: Request): string => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
};

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const job = await createJobService(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const jobs = await getAllJobsService(userId);

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const job = await getJobByIdService(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const job = await updateJobService(
      userId,
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    await deleteJobService(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};