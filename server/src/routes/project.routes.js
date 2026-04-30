import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectRole, requireProjectOwner } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.js";
import { list, create, detail, update, remove } from "../controllers/project.controller.js";
import memberRoutes from "./member.routes.js";
import projectTaskRoutes from "./task.routes.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", validate(createProjectSchema), create);
router.get("/:id", requireProjectRole(), detail);
router.patch("/:id", requireProjectRole("ADMIN"), validate(updateProjectSchema), update);
router.delete("/:id", requireProjectOwner, remove);

router.use("/:id/members", memberRoutes);
router.use("/:id/tasks", projectTaskRoutes);

export default router;
