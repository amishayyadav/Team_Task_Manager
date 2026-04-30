import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listProjectsForUser,
  createProject,
  getProjectDetails,
  updateProject,
  deleteProject,
} from "../services/project.service.js";

export const list = asyncHandler(async (req, res) => {
  const projects = await listProjectsForUser(req.user._id);
  res.json({ data: projects });
});

export const create = asyncHandler(async (req, res) => {
  const project = await createProject({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.user._id,
  });
  res.status(201).json({ data: project });
});

export const detail = asyncHandler(async (req, res) => {
  const project = await getProjectDetails(req.project._id, req.user._id);
  res.json({ data: project });
});

export const update = asyncHandler(async (req, res) => {
  const updated = await updateProject(req.project, req.body);
  res.json({ data: updated });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProject(req.project);
  res.status(204).end();
});
