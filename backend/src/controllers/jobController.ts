import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  ParamsDictionary,
} from "express-serve-static-core";

import {
  createJob as createJobService,
  deleteJob as deleteJobService,
  getAllJobs as getAllJobsService,
  getJobById as getJobByIdService,
  updateJob as updateJobService,
} from "../services/jobService.js";

import type {
  CreateJobInput,
  UpdateJobInput,
} from "../validators/jobValidator.js";

import { AppError } from "../utils/AppError.js";

export interface JobParams
  extends ParamsDictionary {
  id: string;
}

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

const getAuthenticatedUserId = (
  req: RequestWithUser
): string => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  return userId;
};

export const createJob = async (
  req: Request<
    ParamsDictionary,
    unknown,
    CreateJobInput
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const job =
      await createJobService(
        userId,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Job created successfully",
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
    const userId =
      getAuthenticatedUserId(req);

    const jobs =
      await getAllJobsService(userId);

    res.status(200).json({
      success: true,
      message:
        "Jobs retrieved successfully",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request<JobParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const job =
      await getJobByIdService(
        userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Job retrieved successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request<
    JobParams,
    unknown,
    UpdateJobInput
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const updateData: {
      company?: string;
      role?: string;
      description?: string;
      status?: string;
    } = {};

    if (req.body.company !== undefined) {
      updateData.company =
        req.body.company;
    }

    if (req.body.role !== undefined) {
      updateData.role =
        req.body.role;
    }

    if (
      req.body.description !== undefined
    ) {
      updateData.description =
        req.body.description;
    }

    if (req.body.status !== undefined) {
      updateData.status =
        req.body.status;
    }

    const job =
      await updateJobService(
        userId,
        req.params.id,
        updateData
      );

    res.status(200).json({
      success: true,
      message:
        "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request<JobParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    await deleteJobService(
      userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};