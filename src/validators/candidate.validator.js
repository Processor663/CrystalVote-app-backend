import { z } from "zod";

const createCandidateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be at most 500 characters"),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();
