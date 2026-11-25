import { Router } from "express";
import Contact from "../models/Contact.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find()
      .populate("roomId", "roomNumber price")
      .sort({ createdAt: -1 });
    res.json({ data: contacts });
  } catch (err) {
    next(err);
  }
};

const router = Router();
router.post("/", createContact);
router.get("/", protect, authorize("owner"), getContacts);

export default router;