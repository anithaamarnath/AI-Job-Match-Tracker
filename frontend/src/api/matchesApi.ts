import { apiClient } from "./client";

import type { ApiResponse } from "../types/api";
import type {
  CreateResumeJobMatchInput,
  ResumeJobMatch,
} from "../types/match";

export const createResumeJobMatch = async (
  input: CreateResumeJobMatchInput
): Promise<ResumeJobMatch> => {
  const response =
    await apiClient.post<ApiResponse<ResumeJobMatch>>(
      "/matches",
      input
    );

  return response.data.data;
};

export const getResumeJobMatches = async (): Promise<
  ResumeJobMatch[]
> => {
  const response =
    await apiClient.get<ApiResponse<ResumeJobMatch[]>>(
      "/matches"
    );

  return response.data.data;
};