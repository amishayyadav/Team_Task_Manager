import mongoose from "mongoose";
import { Project, Task, User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { withOptionalTransaction } from "../utils/transactions.js";

export async function addMember(project, { email, role }) {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("User must sign up first");

  if (project.members.some((m) => m.user.toString() === user._id.toString())) {
    throw ApiError.conflict("User is already a member");
  }

  project.members.push({ user: user._id, role, joinedAt: new Date() });
  await project.save();
  return project.populate("members.user", "_id name email avatar");
}

export async function updateMemberRole(project, targetUserId, role) {
  const isOwner = project.owner.toString() === targetUserId;
  if (isOwner && role !== "ADMIN") {
    throw ApiError.badRequest("The project owner must remain an admin");
  }
  const member = project.members.find((m) => m.user.toString() === targetUserId);
  if (!member) throw ApiError.notFound("Member not found");

  if (member.role === "ADMIN" && role === "MEMBER") {
    const adminCount = project.members.filter((m) => m.role === "ADMIN").length;
    if (adminCount <= 1) throw ApiError.badRequest("Cannot demote the last admin");
  }

  member.role = role;
  await project.save();
  return project.populate("members.user", "_id name email avatar");
}

export async function removeMember(project, targetUserId, requesterId) {
  if (project.owner.toString() === targetUserId) {
    throw ApiError.badRequest("Cannot remove the project owner");
  }
  const isSelf = targetUserId === requesterId.toString();
  const requester = project.members.find((m) => m.user.toString() === requesterId.toString());
  const isAdmin =
    project.owner.toString() === requesterId.toString() || requester?.role === "ADMIN";

  if (!isSelf && !isAdmin) throw ApiError.forbidden("Admin role required");

  const member = project.members.find((m) => m.user.toString() === targetUserId);
  if (!member) throw ApiError.notFound("Member not found");

  if (member.role === "ADMIN") {
    const adminCount = project.members.filter((m) => m.role === "ADMIN").length;
    if (adminCount <= 1) {
      throw ApiError.badRequest(
        "Cannot remove the last admin — promote another member first"
      );
    }
  }

  await withOptionalTransaction(async (session) => {
    project.members = project.members.filter((m) => m.user.toString() !== targetUserId);
    await project.save(session ? { session } : undefined);
    await Task.updateMany(
      { project: project._id, assignee: new mongoose.Types.ObjectId(targetUserId) },
      { $set: { assignee: null } },
      session ? { session } : undefined
    );
  });

  return project.populate("members.user", "_id name email avatar");
}
