import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: { type: [memberSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

projectSchema.index({ "members.user": 1 });

async function cascadeDelete(projectId) {
  const { Task } = await import("./Task.js");
  const { ActivityLog } = await import("./ActivityLog.js");
  await Promise.all([
    Task.deleteMany({ project: projectId }),
    ActivityLog.deleteMany({ project: projectId }),
  ]);
}

projectSchema.pre("deleteOne", { document: true, query: false }, async function preDelete(next) {
  try {
    await cascadeDelete(this._id);
    next();
  } catch (err) {
    next(err);
  }
});

projectSchema.pre("findOneAndDelete", async function preFindDelete(next) {
  try {
    const doc = await this.model.findOne(this.getQuery()).select("_id");
    if (doc) await cascadeDelete(doc._id);
    next();
  } catch (err) {
    next(err);
  }
});

export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
