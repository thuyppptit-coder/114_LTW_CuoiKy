import { Router } from "express";
import {
    createRepair,
    getMyRepairs,
    getAllRepairs,
    updateRepairStatus,
} from "../controllers/repairController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(protect); // mọi route dưới đây đều cần đăng nhập

router.post("/", authorize("tenant"), upload.array("images", 3), createRepair);
router.get("/mine", authorize("tenant"), getMyRepairs); // đặt trước các route có :id
router.get("/", authorize("owner"), getAllRepairs);
router.patch("/:id/status", authorize("owner"), updateRepairStatus);

export default router;