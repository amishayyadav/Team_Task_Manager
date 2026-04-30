import { connectDB, disconnectDB } from "./config/db.js";
import { User, Project, Task, ActivityLog, RefreshToken } from "./models/index.js";

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    ActivityLog.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  const admin = await User.create({
    email: "admin@demo.com",
    password: "Admin@123",
    name: "Admin Demo",
  });
  const member = await User.create({
    email: "member@demo.com",
    password: "Member@123",
    name: "Member Demo",
  });

  const project = await Project.create({
    name: "Website Redesign",
    description: "Marketing site overhaul: new branding, faster pages, fewer clicks.",
    owner: admin._id,
    members: [
      { user: admin._id, role: "ADMIN" },
      { user: member._id, role: "MEMBER" },
    ],
  });

  const now = Date.now();
  const days = (n) => new Date(now + n * 24 * 60 * 60 * 1000);

  await Task.insertMany([
    {
      title: "Audit current site copy",
      description: "Spreadsheet of every page and CTA, with notes on tone.",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: days(-3),
      project: project._id,
      assignee: member._id,
      createdBy: admin._id,
    },
    {
      title: "Pick new typography",
      description: "Shortlist 3 sans + 2 serif. Pair-test with current logo.",
      status: "TODO",
      priority: "LOW",
      dueDate: null,
      project: project._id,
      assignee: null,
      createdBy: admin._id,
    },
    {
      title: "Build homepage hero prototype",
      description: "Figma → coded prototype on staging.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: days(5),
      project: project._id,
      assignee: admin._id,
      createdBy: admin._id,
    },
    {
      title: "Migrate blog posts to new CMS",
      description: "Bulk import + re-tag categories.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: days(10),
      project: project._id,
      assignee: member._id,
      createdBy: admin._id,
    },
    {
      title: "Set up staging environment",
      description: "Domain, certs, deploy hooks.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: days(-7),
      project: project._id,
      assignee: admin._id,
      createdBy: admin._id,
    },
  ]);

  console.log("\nSeed complete.\n");
  console.log("Login credentials:");
  console.log("  admin@demo.com  /  Admin@123");
  console.log("  member@demo.com /  Member@123");

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
