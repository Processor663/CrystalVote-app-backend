import { z } from "zod";

const adminCreateCandidateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters long"),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
    nin: z
      .string()
      .min(10, "NIN must be at least 10 characters long")
      .max(20, "NIN must be at most 20 characters long"),
    position: z.enum(["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"]),
    manifesto: z.string().trim().optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

export { adminCreateCandidateSchema };
