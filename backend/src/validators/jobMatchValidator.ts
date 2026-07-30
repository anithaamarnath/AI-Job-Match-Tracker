import { z } from "zod";

export const jobMatchSchema = z.object({
  resume: z
    .string()
    .trim()
    .min(50, "Resume must contain at least 50 characters"),

  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description must contain at least 50 characters"),
});

export type JobMatchInput = z.infer<typeof jobMatchSchema>;