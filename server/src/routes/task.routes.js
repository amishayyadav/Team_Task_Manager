import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task.js";
import {
  listForProject,
  createForProject,
  detail,
  update,
  remove,
} from "../controllers/task.controller.js";

// Mounted under /api/projects/:id/tasks (auth runs at parent).
export const projectTaskRouter = Router({ mergeParams: true });
projectTaskRouter.get(
  "/",
  requireProjectRole(),
  validate(taskQuerySchema, "query"),
  listForProject
);
projectTaskRouter.post(
  "/",
  requireProjectRole(),
  validate(createTaskSchema),
  createForProject
);

// Mounted at /api/tasks (top-level).
export const taskRouter = Router();
taskRouter.use(requireAuth);
taskRouter.get("/:id", detail);
taskRouter.patch("/:id", validate(updateTaskSchema), update);
taskRouter.delete("/:id", remove);

export default projectTaskRouter;
