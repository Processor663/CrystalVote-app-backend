import { z } from "zod";

const adminCreateCandidateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters long"),
    email: z.string().email("Invalid email address").unique(),
    nin: z.string().optional().unique(),
    position: z
      .string()
      .enum(["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"]),
    manifesto: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();
