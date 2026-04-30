import { z } from "zod";

const STATUS = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY = ["LOW", "MEDIUM", "HIGH"];

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(5000).trim().optional().default(""),
  status: z.enum(STATUS).default("TODO"),
  priority: z.enum(PRIORITY).default("MEDIUM"),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  assignee: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  status: z.enum(STATUS).optional(),
  priority: z.enum(PRIORITY).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  assignee: z.string().nullable().optional(),
});
