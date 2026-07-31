import { z } from "zod";

export const jobMatchSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),

  jobDescription: z
    .string()
    .min(50, "Job description must contain at least 50 characters"),
});

export type JobMatchInput = z.infer<typeof jobMatchSchema>;