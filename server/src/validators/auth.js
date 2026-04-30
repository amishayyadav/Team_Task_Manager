import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

export const signupSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: passwordSchema,
  name: z.string().min(1, "Name is required").max(100).trim(),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});
