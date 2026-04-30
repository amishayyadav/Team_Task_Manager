import mongoose from "mongoose";
import { Project, Task } from "../models/index.js";
import { paginationFromQuery, buildPagination } from "../utils/buildPagination.js";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function getDashboard(userId, query) {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  const { page, limit, skip } = paginationFromQuery(query);

  const projects = await Project.find({ "members.user": userId }).select(
    "_id name members owner"
  );
  const projectIds = projects.map((p) => p._id);

  const [counts, taskItems, taskTotal, statsByProject] = await Promise.all([
    Task.aggregate([
      { $match: { assignee: userObjId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$dueDate", null] },
                    { $lt: ["$dueDate", now] },
                    { $ne: ["$status", "DONE"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          dueToday: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$dueDate", null] },
                    { $gte: ["$dueDate", startOfDay(now)] },
                    { $lte: ["$dueDate", endOfDay(now)] },
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
    ]),
    Task.find({ assignee: userObjId })
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("project", "_id name")
      .populate("assignee", "_id name email avatar"),
    Task.countDocuments({ assignee: userObjId }),
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: "$project",
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
                    { $lt: ["$dueDate", now] },
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
    ]),
  ]);

  const statsMap = new Map(statsByProject.map((s) => [s._id.toString(), s]));
  const projectSummaries = projects.map((p) => {
    const s = statsMap.get(p._id.toString()) || {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
    };
    const isOwner = p.owner.toString() === userId.toString();
    const member = p.members.find((m) => m.user.toString() === userId.toString());
    return {
      _id: p._id,
      name: p.name,
      role: isOwner ? "ADMIN" : member?.role,
      taskStats: {
        total: s.total,
        todo: s.todo,
        inProgress: s.inProgress,
        done: s.done,
        overdue: s.overdue,
      },
    };
  });

  const c = counts[0] || { total: 0, overdue: 0, inProgress: 0, dueToday: 0 };

  return {
    counts: {
      total: c.total,
      overdue: c.overdue,
      inProgress: c.inProgress,
      dueToday: c.dueToday,
    },
    tasks: {
      data: taskItems,
      pagination: buildPagination({ page, limit, total: taskTotal }),
    },
    projects: projectSummaries,
  };
}
