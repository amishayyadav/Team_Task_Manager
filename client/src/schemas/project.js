import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).trim(),
  description: z.string().max(2000).trim().optional().default(""),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(120).trim().optional(),
    description: z.string().max(2000).trim().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: "Provide at least one field",
  });

export const inviteMemberSchema = z.object({
  email: z.string().email("Enter a valid email").trim().toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
