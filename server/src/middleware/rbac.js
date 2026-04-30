import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/Project.js";

/**
 * Loads the project (by req.params.id), confirms requester is a member,
 * attaches req.project + req.membership. If `requiredRole` is set, the
 * requester's role must equal it (ADMIN). Owner is always treated as ADMIN.
 */
export const requireProjectRole = (requiredRole) => async (req, _res, next) => {
  try {
    const projectId = req.params.id;
    if (!mongoose.isValidObjectId(projectId)) {
      throw ApiError.badRequest("Invalid project id");
    }
    const project = await Project.findById(projectId);
    if (!project) throw ApiError.notFound("Project not found");

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const member = project.members.find((m) => m.user.toString() === userId);

    if (!isOwner && !member) throw ApiError.forbidden("Not a project member");

    const role = isOwner ? "ADMIN" : member.role;
    if (requiredRole === "ADMIN" && role !== "ADMIN") {
      throw ApiError.forbidden("Admin role required");
    }

    req.project = project;
    req.membership = { role, isOwner };
    next();
  } catch (err) {
    next(err);
  }
};

/** Owner-only — used for project deletion. */
export const requireProjectOwner = async (req, _res, next) => {
  try {
    const projectId = req.params.id;
    if (!mongoose.isValidObjectId(projectId)) {
      throw ApiError.badRequest("Invalid project id");
    }
    const project = await Project.findById(projectId);
    if (!project) throw ApiError.notFound("Project not found");
    if (project.owner.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden("Only the owner can perform this action");
    }
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};
