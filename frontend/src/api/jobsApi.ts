import { apiClient } from "./client";

import type { ApiResponse } from "../types/api";
import type {
  CreateJobInput,
  Job,
} from "../types/job";

export const getJobs = async (): Promise<Job[]> => {
  const response =
    await apiClient.get<ApiResponse<Job[]>>("/jobs");

  return response.data.data;
};

export const createJob = async (
  input: CreateJobInput
): Promise<Job> => {
  const response =
    await apiClient.post<ApiResponse<Job>>(
      "/jobs",
      input
    );

  return response.data.data;
};

export const deleteJob = async (
  jobId: string
): Promise<void> => {
  await apiClient.delete(`/jobs/${jobId}`);
};