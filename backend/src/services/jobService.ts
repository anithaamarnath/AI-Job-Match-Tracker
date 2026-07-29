import {
  createJob as createJobRepository,
  deleteJob as deleteJobRepository,
  getAllJobs as getAllJobsRepository,
  getJobById as getJobByIdRepository,
  updateJob as updateJobRepository,
} from "../repositories/jobRepository";

import type {
  CreateJobData,
  UpdateJobData,
} from "../repositories/jobRepository";

import { AppError } from "../utils/AppError";

export const createJob = async (data: CreateJobData) => {
  return createJobRepository(data);
};

export const getAllJobs = async () => {
  return getAllJobsRepository();
};

export const getJobById = async (id: string) => {
  const job = await getJobByIdRepository(id);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateJob = async (
  id: string,
  data: UpdateJobData
) => {
  await getJobById(id);

  return updateJobRepository(id, data);
};

export const deleteJob = async (id: string) => {
  await getJobById(id);

  return deleteJobRepository(id);
};