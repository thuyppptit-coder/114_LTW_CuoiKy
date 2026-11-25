import { Router } from "express";
import Contact from "../models/Contact.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

export const createContact = async (req, res, next) => {
  try {
    const { roomId, fullName, phone, email, message } = req.body;
    if (!fullName || !phone || !message) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung" });
    }
    const contact = await Contact.create({ roomId: roomId || null, fullName, phone, email, message });
    res.status(201).json({ message: "Gửi liên hệ thành công", data: contact });
  } catch (err) {
    next(err);
  }
};

