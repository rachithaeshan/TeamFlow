import { Router } from "express";
import { taskController } from "../controllers/taskController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskProgressSchema,
  addCommentSchema,
  taskIdParamSchema,
  listTasksQuerySchema,
} from "../validators/taskValidators";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(createTaskSchema),
  taskController.create
);
router.get("/", validate(listTasksQuerySchema), taskController.list);
router.get("/:id", validate(taskIdParamSchema), taskController.getById);
router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(updateTaskSchema),
  taskController.update
);
router.delete(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  validate(taskIdParamSchema),
  taskController.delete
);

// Status/progress updates are allowed for the assignee themselves, or a manager/admin -
// fine-grained ownership check happens inside the service, not the route
router.patch("/:id/status", validate(updateTaskStatusSchema), taskController.updateStatus);
router.patch("/:id/progress", validate(updateTaskProgressSchema), taskController.updateProgress);

router.get("/:id/comments", validate(taskIdParamSchema), taskController.listComments);
router.post("/:id/comments", validate(addCommentSchema), taskController.addComment);

router.get("/:id/activity", validate(taskIdParamSchema), taskController.listActivity);

export default router;
