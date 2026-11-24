import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: [true, "Phòng là bắt buộc"],
        },
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: [true, "Hợp đồng hiệu lực là bắt buộc"],
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Người thuê là bắt buộc"],
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
        issuedAt: { type: Date },
        paidAt: { type: Date },
    },
    { timestamps: true }
);

invoiceSchema.index({ roomId: 1, month: 1 }, { unique: true });
invoiceSchema.index({ status: 1, month: 1 });
invoiceSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("Invoice", invoiceSchema);