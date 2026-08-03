import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type {
  AIResumeAnalysis,
  Resume,
} from "../types/resume";

export const getResumes = async (): Promise<Resume[]> => {
  const response =
    await apiClient.get<ApiResponse<Resume[]>>("/resume");

  return response.data.data;
};

export const getResumeById = async (
  resumeId: string
): Promise<Resume> => {
  const response =
    await apiClient.get<ApiResponse<Resume>>(
      `/resume/${resumeId}`
    );

  return response.data.data;
};

export const getSavedAIAnalysis = async (
  resumeId: string
): Promise<AIResumeAnalysis> => {
  const response =
    await apiClient.get<ApiResponse<AIResumeAnalysis>>(
      `/resume/${resumeId}/ai-analysis`
    );

  return response.data.data;
};

export const uploadResume = async (
  file: File
): Promise<Resume> => {
  const formData = new FormData();

  formData.append("resume", file);

  const response =
    await apiClient.post<ApiResponse<Resume>>(
      "/resume/upload",
      formData
    );

  return response.data.data;
};

export const deleteResume = async (
  resumeId: string
): Promise<void> => {
  await apiClient.delete(`/resume/${resumeId}`);
};

export const generateAIAnalysis = async (
  resumeId: string
): Promise<AIResumeAnalysis> => {
  const response =
    await apiClient.post<ApiResponse<AIResumeAnalysis>>(
      `/resume/${resumeId}/ai-analysis`
    );

  return response.data.data;
};

export const getResumePreview = async (
  resumeId: string
): Promise<Blob> => {
  const response = await apiClient.get(
    `/resume/${resumeId}/preview`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};