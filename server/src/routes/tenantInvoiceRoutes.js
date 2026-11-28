import { Router } from "express";
import { getMyInvoices, getInvoiceById } from "../controllers/tenantInvoiceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/mine", authorize("tenant"), getMyInvoices);
router.get("/:id", authorize("tenant", "owner"), getInvoiceById);

export default router;
