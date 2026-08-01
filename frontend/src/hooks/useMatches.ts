import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createResumeJobMatch,
  getResumeJobMatches,
} from "../api/matchesApi";

import type { CreateResumeJobMatchInput } from "../types/match";

export const matchKeys = {
  all: ["matches"] as const,
};

export const useMatches = () => {
  return useQuery({
    queryKey: matchKeys.all,
    queryFn: getResumeJobMatches,
  });
};

export const useCreateResumeJobMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateResumeJobMatchInput
    ) => createResumeJobMatch(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: matchKeys.all,
      });
    },
  });
};