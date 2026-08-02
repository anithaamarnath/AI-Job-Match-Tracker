import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
  getJobById
} from "../api/jobsApi";

import type {
  CreateJobInput,
  UpdateJobInput,
} from "../types/job";

export const jobKeys = {
  all: ["jobs"] as const,
  detail: (jobId: string) =>
    ["jobs", jobId] as const,
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

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      input,
    }: {
      jobId: string;
      input: UpdateJobInput;
    }) => updateJob(jobId, input),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jobKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: jobKeys.detail(
            variables.jobId
          ),
        }),
      ]);
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

export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });
};

