import mongoose from "mongoose";
import { Project, Task } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationFromQuery, buildPagination } from "../utils/buildPagination.js";

function isProjectMember(project, userId) {
  if (project.owner.toString() === userId.toString()) return true;
  return project.members.some((m) => m.user.toString() === userId.toString());
}

export async function listTasks(project, query, requesterId) {
  const { page, limit, skip } = paginationFromQuery(query);
  const filter = { project: project._id };

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  if (query.assignee === "me") filter.assignee = requesterId;
  else if (query.assignee === "none") filter.assignee = null;
  else if (query.assignee) filter.assignee = query.assignee;

  if (query.overdue === "true") {
    filter.dueDate = { $lt: new Date() };
    if (query.status === "DONE") {
      // "overdue" excludes DONE, so this combination matches nothing.
      filter._id = null;
    } else if (!query.status) {
      filter.status = { $ne: "DONE" };
    }
  }

  let cursor = Task.find(filter);
  if (query.search) {
    cursor = Task.find({ ...filter, $text: { $search: query.search } });
  }

  const [data, total] = await Promise.all([
    cursor
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignee", "_id name email avatar")
      .populate("createdBy", "_id name email avatar"),
    (query.search
      ? Task.countDocuments({ ...filter, $text: { $search: query.search } })
      : Task.countDocuments(filter)),
  ]);

  return { data, pagination: buildPagination({ page, limit, total }) };
}

export async function createTask(project, body, creatorId) {
  if (body.assignee && !isProjectMember(project, body.assignee)) {
    throw ApiError.badRequest("Assignee must be a project member");
  }
  const task = await Task.create({
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    dueDate: body.dueDate ?? null,
    assignee: body.assignee ?? null,
    project: project._id,
    createdBy: creatorId,
  });
  return task.populate([
    { path: "assignee", select: "_id name email avatar" },
    { path: "createdBy", select: "_id name email avatar" },
  ]);
}

function canEditAnything({ project, requesterId, taskCreatorId }) {
  if (project.owner.toString() === requesterId.toString()) return true;
  const member = project.members.find((m) => m.user.toString() === requesterId.toString());
  if (member?.role === "ADMIN") return true;
  if (taskCreatorId.toString() === requesterId.toString()) return true;
  return false;
}

export async function updateTask(taskId, body, requester) {
  if (!mongoose.isValidObjectId(taskId)) throw ApiError.badRequest("Invalid task id");
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");
  const project = await Project.findById(task.project);
  if (!project) throw ApiError.notFound("Project no longer exists");

  if (!isProjectMember(project, requester._id)) {
    throw ApiError.forbidden("Not a project member");
  }

  if (new Date(body.updatedAt).getTime() !== new Date(task.updatedAt).getTime()) {
    throw new ApiError(409, "Task was modified by another user, please refresh");
  }

  const fullEdit = canEditAnything({
    project,
    requesterId: requester._id,
    taskCreatorId: task.createdBy,
  });
  const isAssignee = task.assignee && task.assignee.toString() === requester._id.toString();

  if (!fullEdit) {
    if (!isAssignee) throw ApiError.forbidden("Not authorized to edit this task");
    const allowed = ["status", "updatedAt"];
    const provided = Object.keys(body);
    const disallowed = provided.filter((k) => !allowed.includes(k));
    if (disallowed.length > 0) {
      throw ApiError.forbidden("Assignees can only change task status");
    }
  }

  if (body.assignee !== undefined && body.assignee !== null) {
    if (!isProjectMember(project, body.assignee)) {
      throw ApiError.badRequest("Assignee must be a project member");
    }
  }

  for (const key of ["title", "description", "status", "priority", "dueDate", "assignee"]) {
    if (body[key] !== undefined) task[key] = body[key];
  }

  await task.save();
  return task.populate([
    { path: "assignee", select: "_id name email avatar" },
    { path: "createdBy", select: "_id name email avatar" },
  ]);
}

export async function deleteTask(taskId, requester) {
  if (!mongoose.isValidObjectId(taskId)) throw ApiError.badRequest("Invalid task id");
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");
  const project = await Project.findById(task.project);
  if (!project) throw ApiError.notFound("Project no longer exists");

  const isCreator = task.createdBy.toString() === requester._id.toString();
  const isOwner = project.owner.toString() === requester._id.toString();
  const member = project.members.find((m) => m.user.toString() === requester._id.toString());
  const isAdmin = isOwner || member?.role === "ADMIN";

  if (!isCreator && !isAdmin) throw ApiError.forbidden("Not authorized to delete this task");

  await task.deleteOne();
}

export async function getTask(taskId, requester) {
  if (!mongoose.isValidObjectId(taskId)) throw ApiError.badRequest("Invalid task id");
  const task = await Task.findById(taskId)
    .populate("assignee", "_id name email avatar")
    .populate("createdBy", "_id name email avatar");
  if (!task) throw ApiError.notFound("Task not found");
  const project = await Project.findById(task.project);
  if (!project || !isProjectMember(project, requester._id)) {
    throw ApiError.forbidden("Not a project member");
  }
  return task;
}
