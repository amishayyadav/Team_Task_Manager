import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { addMember, updateMemberRole, removeMember } from "../services/member.service.js";

export const add = asyncHandler(async (req, res) => {
  const project = await addMember(req.project, req.body);
  res.status(201).json({ data: project });
});

export const updateRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) throw ApiError.badRequest("Invalid user id");
  const project = await updateMemberRole(req.project, userId, req.body.role);
  res.json({ data: project });
});

export const remove = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) throw ApiError.badRequest("Invalid user id");
  const project = await removeMember(req.project, userId, req.user._id);
  res.json({ data: project });
});
