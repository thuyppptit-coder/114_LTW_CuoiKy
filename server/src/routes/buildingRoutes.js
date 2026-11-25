import { Router } from "express";
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../controllers/buildingController.js";
// Thay bằng tên hàm thực tế từ middleware của A (ví dụ protect, authorize)
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorize("owner"));
router.get("/", getBuildings);
router.post("/", createBuilding);
router.put("/:id", updateBuilding);
router.delete("/:id", deleteBuilding);

export default router;