import { Router } from "express";
import { requireProjectRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { addMemberSchema, updateMemberSchema } from "../validators/member.js";
import { add, updateRole, remove } from "../controllers/member.controller.js";

// Mounted at /api/projects/:id/members — requireAuth runs at the parent router.
const router = Router({ mergeParams: true });

router.post("/", requireProjectRole("ADMIN"), validate(addMemberSchema), add);
router.patch(
  "/:userId",
  requireProjectRole("ADMIN"),
  validate(updateMemberSchema),
  updateRole
);
// DELETE allows self-removal too — the service decides authorization.
router.delete("/:userId", requireProjectRole(), remove);

export default router;
