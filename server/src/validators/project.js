import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  description: z.string().max(2000).trim().optional().default(""),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(120).trim().optional(),
    description: z.string().max(2000).trim().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field" });
