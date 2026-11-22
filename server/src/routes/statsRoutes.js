import { Router } from "express";
import { getSummary, getOverdue, getRevenue } from "../controllers/statsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("owner")); 
router.get("/summary", getSummary);
router.get("/overdue", getOverdue);
router.get("/revenue", getRevenue);

export default router;