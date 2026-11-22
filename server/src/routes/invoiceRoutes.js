import { Router } from "express";
import { createInvoice } from "../controllers/invoiceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect); 

router.post("/", authorize("owner"), createInvoice);

export default router;