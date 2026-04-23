import { z } from "zod";

const createCandidateSchema = z
  .object({
    userId: z.string(),
    position: z.string(),
    manifesto: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();
