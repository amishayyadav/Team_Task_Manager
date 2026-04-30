import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
} from "../services/task.service.js";

export const listForProject = asyncHandler(async (req, res) => {
  const result = await listTasks(req.project, req.query, req.user._id);
  res.json(result);
});

export const createForProject = asyncHandler(async (req, res) => {
  const task = await createTask(req.project, req.body, req.user._id);
  res.status(201).json({ data: task });
});

export const detail = asyncHandler(async (req, res) => {
  const task = await getTask(req.params.id, req.user);
  res.json({ data: task });
});

export const update = asyncHandler(async (req, res) => {
  const task = await updateTask(req.params.id, req.body, req.user);
  res.json({ data: task });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteTask(req.params.id, req.user);
  res.status(204).end();
});
