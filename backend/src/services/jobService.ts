import {
  createJob as createJobRepository,
  deleteJob as deleteJobRepository,
  getAllJobs as getAllJobsRepository,
  getJobById as getJobByIdRepository,
  updateJob as updateJobRepository,
} from "../repositories/jobRepository.js";

import type {
  CreateJobData,
  UpdateJobData,
} from "../repositories/jobRepository.js";

import { AppError } from "../utils/AppError.js";

export const createJob = async (
  userId: string,
  data: CreateJobData
) => {
  return createJobRepository(userId, data);
};

export const getAllJobs = async (userId: string) => {
  return getAllJobsRepository(userId);
};

export const getJobById = async (
  userId: string,
  jobId: string
) => {
  const job = await getJobByIdRepository(userId, jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateJob = async (
  userId: string,
  jobId: string,
  data: UpdateJobData
) => {
  const job = await updateJobRepository(
    userId,
    jobId,
    data
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const deleteJob = async (
  userId: string,
  jobId: string
) => {
  const job = await deleteJobRepository(userId, jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};