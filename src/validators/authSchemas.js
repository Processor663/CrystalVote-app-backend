import { z } from "zod";

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
    nin: z
      .string()
      .trim()
      .min(11, "NIN must be at least 11 characters")
      .max(20, "NIN must be at most 20 characters"),
    image: z.string().url("Invalid image URL").optional()
  })
  .strict();


const signInSchema = z
  .object({
    email: z.string().trim().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Invalid password")
      .max(100, "Invalid password"),
  })
  .strict();


export { signUpSchema, signInSchema };