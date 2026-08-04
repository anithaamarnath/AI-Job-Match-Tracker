import { z } from "zod";

export const createJobSchema = z.object({
  company: z
    .string({
      message: "Company must be a string",
    })
    .trim()
    .min(
      2,
      "Company must contain at least 2 characters"
    )
    .max(
      100,
      "Company must be 100 characters or fewer"
    ),

  role: z
    .string({
      message: "Role must be a string",
    })
    .trim()
    .min(
      2,
      "Role must contain at least 2 characters"
    )
    .max(
      120,
      "Role must be 120 characters or fewer"
    ),

  description: z
    .string({
      message: "Description must be a string",
    })
    .trim()
    .min(
      10,
      "Description must contain at least 10 characters"
    )
    .max(
      20_000,
      "Description must be 20,000 characters or fewer"
    ),
});

export type CreateJobInput = z.infer<
  typeof createJobSchema
>;

export const updateJobSchema = createJobSchema
  .partial()
  .extend({
    status: z
      .string({
        message: "Status must be a string",
      })
      .trim()
      .min(1, "Status cannot be empty")
      .optional(),
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