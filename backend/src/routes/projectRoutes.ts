import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  addMemberSchema,
} from "../validators/projectValidators";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(createProjectSchema),
  projectController.create
);
router.get("/", projectController.list);
router.get("/:id", validate(projectIdParamSchema), projectController.getById);
router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(updateProjectSchema),
  projectController.update
);
router.delete(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(projectIdParamSchema),
  projectController.delete
);

router.post(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(addMemberSchema),
  projectController.addMember
);
router.delete(
  "/:id/members/:userId",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(z.object({ params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }) })),
  projectController.removeMember
);

export default router;
