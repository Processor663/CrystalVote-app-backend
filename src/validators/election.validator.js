import { z } from "zod";

const createElectionSchema = z
  .object({
    title: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
    status: z.enum(["UPCOMING", "ONGOING", "ENDED"]).default("UPCOMING"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .strict()
  .refine((data) => data.startDate < data.endDate, {
    message: "Start date must be before end date",
  });

const updateElectionSchema = createElectionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export { createElectionSchema, updateElectionSchema };
