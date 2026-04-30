import { z } from "zod";
import { objectIdSchema } from "./common.js";

const STATUS = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY = ["LOW", "MEDIUM", "HIGH"];

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/));

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).trim().optional().default(""),
  status: z.enum(STATUS).optional(),
  priority: z.enum(PRIORITY).optional(),
  dueDate: isoDate.nullable().optional(),
  assignee: objectIdSchema.nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(5000).trim().optional(),
    status: z.enum(STATUS).optional(),
    priority: z.enum(PRIORITY).optional(),
    dueDate: isoDate.nullable().optional(),
    assignee: objectIdSchema.nullable().optional(),
    updatedAt: z.string().min(1, "updatedAt is required for optimistic locking"),
  })
  .refine(
    (v) => Object.keys(v).filter((k) => k !== "updatedAt").length > 0,
    { message: "Provide at least one field to update" }
  );

export const taskQuerySchema = z.object({
  status: z.enum(STATUS).optional(),
  assignee: z
    .union([objectIdSchema, z.literal("me"), z.literal("none")])
    .optional(),
  priority: z.enum(PRIORITY).optional(),
  overdue: z.enum(["true", "false"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
