import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

roomSchema.index({ buildingId: 1, name: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);