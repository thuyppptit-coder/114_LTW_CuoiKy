import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: [true, "Phòng là bắt buộc"],
        },
        month: {
            type: String,
            required: [true, "Tháng là bắt buộc"],
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Tháng phải có dạng YYYY-MM"],
        },
        electricOld: { type: Number, required: [true, "Thiếu chỉ số điện cũ"], min: 0 },
        electricNew: { type: Number, required: [true, "Thiếu chỉ số điện mới"], min: 0 },
        waterOld: { type: Number, required: [true, "Thiếu chỉ số nước cũ"], min: 0 },
        waterNew: { type: Number, required: [true, "Thiếu chỉ số nước mới"], min: 0 },

    
        electricPrice: { type: Number, min: 0 },
        waterPrice: { type: Number, min: 0 },
        roomFee: { type: Number, min: 0 },
        electricFee: { type: Number, min: 0 },
        waterFee: { type: Number, min: 0 },
        serviceFee: { type: Number, min: 0 },
        total: { type: Number, min: 0 },

        status: {
            type: String,
            enum: ["draft", "issued", "paid"],
            default: "draft",
        },
        paidAt: { type: Date },
    },
    { timestamps: true }
);

invoiceSchema.index({ roomId: 1, month: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);