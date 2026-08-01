import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createJob,
  deleteJob,
  getJobs,
} from "../api/jobsApi";

import type { CreateJobInput } from "../types/job";

export const jobKeys = {
  all: ["jobs"] as const,
};

export const useJobs = () => {
  return useQuery({
    queryKey: jobKeys.all,
    queryFn: getJobs,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJobInput) =>
      createJob(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: jobKeys.all,
      });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: jobKeys.all,
      });
    },
  });
};