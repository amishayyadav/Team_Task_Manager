import { Router } from "express";
import authRoutes from "./auth.routes.js";
import projectRoutes from "./project.routes.js";
import { taskRouter } from "./task.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import healthRoutes from "./health.routes.js";

const api = Router();

api.use("/health", healthRoutes);
api.use("/auth", authRoutes);
api.use("/projects", projectRoutes);
api.use("/tasks", taskRouter);
api.use("/dashboard", dashboardRoutes);

export default api;
