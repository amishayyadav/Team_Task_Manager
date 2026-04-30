import mongoose from "mongoose";
import { Project, Task } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { withOptionalTransaction } from "../utils/transactions.js";

function shapeProjectListItem(project, requesterId) {
  const isOwner = project.owner.toString() === requesterId.toString();
  const member = project.members.find((m) => m.user.toString() === requesterId.toString());
  const role = isOwner ? "ADMIN" : member?.role;
  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    owner: project.owner,
    role,
    memberCount: project.members.length,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function listProjectsForUser(userId) {
  const projects = await Project.find({ "members.user": userId }).sort({ updatedAt: -1 });
  return projects.map((p) => shapeProjectListItem(p, userId));
}

export async function createProject({ name, description, ownerId }) {
  return withOptionalTransaction(async (session) => {
    const docs = await Project.create(
      [
        {
          name,
          description,
          owner: ownerId,
          members: [{ user: ownerId, role: "ADMIN" }],
        },
      ],
      session ? { session } : undefined
    );
    return docs[0];
  });
}

export async function getProjectDetails(projectId, requesterId) {
  const project = await Project.findById(projectId).populate(
    "members.user",
    "_id name email avatar"
  );
  if (!project) throw ApiError.notFound("Project not found");

  const stats = await Task.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$dueDate", null] },
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$status", "DONE"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const taskStats = stats[0] || { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  delete taskStats._id;

  const isOwner = project.owner.toString() === requesterId.toString();
  const member = project.members.find(
    (m) => m.user._id.toString() === requesterId.toString()
  );
  const role = isOwner ? "ADMIN" : member?.role;

  return { ...project.toJSON(), taskStats, role, isOwner };
}

export async function updateProject(project, patch) {
  if (patch.name !== undefined) project.name = patch.name;
  if (patch.description !== undefined) project.description = patch.description;
  await project.save();
  return project;
}

export async function deleteProject(project) {
  await project.deleteOne();
}
