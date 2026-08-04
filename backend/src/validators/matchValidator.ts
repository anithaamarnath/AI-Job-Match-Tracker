import { z } from "zod";

export const createResumeJobMatchSchema = z.object({
  resumeId: z
    .string()
    .min(1, "Resume ID is required"),

  jobId: z
    .string()
    .min(1, "Job ID is required"),
});

export type CreateResumeJobMatchInput = z.infer<
  typeof createResumeJobMatchSchema
>;