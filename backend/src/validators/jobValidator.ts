import { z } from "zod";

export const createJobSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required"),

  role: z
    .string()
    .min(1, "Role is required"),

  description: z
    .string()
    .min(10, "Description must contain at least 10 characters"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema
  .partial()
  .extend({
    status: z.string().min(1, "Status cannot be empty").optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required",
    }
  );

export type UpdateJobInput = z.infer<
  typeof updateJobSchema
>;