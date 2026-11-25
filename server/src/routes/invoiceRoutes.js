import { Router } from "express";
import {
    createInvoice,
    getInvoices,
    issueInvoice,
    payInvoice,
    getMyInvoices,
    getInvoiceById,
} from "../controllers/invoiceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/mine", authorize("tenant"), getMyInvoices);
router.get("/:id", authorize("tenant", "owner"), getInvoiceById);

router.post("/", authorize("owner"), createInvoice);
router.get("/", authorize("owner"), getInvoices);
router.patch("/:id/issue", authorize("owner"), issueInvoice);
router.patch("/:id/pay", authorize("owner"), payInvoice);

export default router;