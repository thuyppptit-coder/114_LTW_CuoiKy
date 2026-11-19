import mongoose from "mongoose";

const repairRequestSchema = new mongoose.Schema(
    {
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" }, // lấy từ hợp đồng của người thuê
        title: { type: String, required: [true, "Tiêu đề là bắt buộc"], trim: true, maxlength: 100 },
        description: { type: String, trim: true, maxlength: 1000 },
        images: [{ type: String }], // đường dẫn dạng /uploads/xxx.jpg
        status: { type: String, enum: ["new", "in_progress", "done"], default: "new" },
    },
    { timestamps: true }
);

export default mongoose.model("RepairRequest", repairRequestSchema);