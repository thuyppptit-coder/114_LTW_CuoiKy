import { Router } from "express";
import {
  getContracts,
  createContract,
  terminateContract,
} from "../controllers/contractController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getContracts);
router.post("/", authorize("owner"), createContract);
router.patch("/:id/terminate", authorize("owner"), terminateContract);

export default router;