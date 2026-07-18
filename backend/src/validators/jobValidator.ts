import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    company: z
      .string()
      .trim()
      .min(2, "Company name must contain at least 2 characters"),

    role: z
      .string()
      .trim()
      .min(2, "Job role must contain at least 2 characters"),

    description: z
      .string()
      .trim()
      .min(20, "Job description must contain at least 20 characters")
  })
});

export type CreateJobInput = z.infer<
  typeof createJobSchema
>["body"];