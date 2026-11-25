import { Router } from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Công khai cho khách xem & lọc phòng; tạo/sửa/xóa dành cho owner
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", protect, authorize("owner"), createRoom);
router.put("/:id", protect, authorize("owner"), updateRoom);
router.delete("/:id", protect, authorize("owner"), deleteRoom);

export default router;