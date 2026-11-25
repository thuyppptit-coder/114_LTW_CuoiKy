import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/users?role=tenant
router.get("/", protect, authorize("owner"), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;