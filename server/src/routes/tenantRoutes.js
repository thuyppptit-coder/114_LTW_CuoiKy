import { Router } from "express";
import { getOverview } from "../controllers/tenantController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/overview", protect, authorize("tenant"), getOverview);

export default router;