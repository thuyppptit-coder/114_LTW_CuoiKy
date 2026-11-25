import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    electricPrice: { type: Number, required: true, min: 0 },
    waterPrice: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Building", buildingSchema);