import { Router } from "express";
import { statsController } from "../controllers/statsController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/dashboard", requireAuth, statsController.dashboard);

export default router;
