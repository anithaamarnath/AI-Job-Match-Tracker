import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteResume,
  generateAIAnalysis,
  getResumeById,
  getResumes,
  getSavedAIAnalysis,
  uploadResume,
} from "../api/resumesApi";

export const resumeKeys = {
  all: ["resumes"] as const,
  detail: (resumeId: string) =>
    ["resumes", resumeId] as const,
  analysis: (resumeId: string) =>
    ["resumes", resumeId, "ai-analysis"] as const,
};

export const useResumes = () =>
  useQuery({
    queryKey: resumeKeys.all,
    queryFn: getResumes,
  });

export const useResume = (resumeId: string) =>
  useQuery({
    queryKey: resumeKeys.detail(resumeId),
    queryFn: () => getResumeById(resumeId),
    enabled: Boolean(resumeId),
  });

export const useSavedAIAnalysis = (
  resumeId: string,
  enabled: boolean
) =>
  useQuery({
    queryKey: resumeKeys.analysis(resumeId),
    queryFn: () => getSavedAIAnalysis(resumeId),
    enabled: Boolean(resumeId) && enabled,
    retry: false,
  });

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: resumeKeys.all,
      });
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: resumeKeys.all,
      });
    },
  });
};

export const useGenerateAIAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAIAnalysis,
    onSuccess: async (_, resumeId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: resumeKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: resumeKeys.detail(resumeId),
        }),
        queryClient.invalidateQueries({
          queryKey: resumeKeys.analysis(resumeId),
        }),
      ]);
    },
  });
};