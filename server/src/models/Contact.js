import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Mới", "Đã liên hệ"],
      default: "Mới",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);