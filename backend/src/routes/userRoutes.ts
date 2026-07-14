import { Router } from "express";
import { userController } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { updateUserSchema, userIdParamSchema } from "../validators/userValidators";

const router = Router();

router.use(requireAuth);

// Read access: Admins (full user management) and Project Managers (need to see who's
// available to assign to their projects) can both list/view users.
router.get("/", requireRole("ADMIN", "PROJECT_MANAGER"), userController.list);
router.get("/:id", requireRole("ADMIN", "PROJECT_MANAGER"), validate(userIdParamSchema), userController.getById);

// Mutations: admin-only - changing roles or deactivating accounts is an admin responsibility.
router.patch("/:id", requireRole("ADMIN"), validate(updateUserSchema), userController.update);
router.delete("/:id", requireRole("ADMIN"), validate(userIdParamSchema), userController.delete);

export default router;