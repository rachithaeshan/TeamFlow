import { Router } from "express";
import { z } from "zod";
import { assistantController } from "../controllers/assistantController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "PROJECT_MANAGER"));

router.post(
  "/chat",
  validate(z.object({ body: z.object({ question: z.string().min(1) }) })),
  assistantController.chat
);
router.get("/summary", assistantController.summary);

export default router;
