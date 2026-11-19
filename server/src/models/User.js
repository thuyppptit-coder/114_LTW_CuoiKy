import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Tên là bắt buộc"], trim: true },
        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Mật khẩu là bắt buộc"],
            minlength: [6, "Mật khẩu tối thiểu 6 ký tự"],
            select: false, // mặc định không trả password khi truy vấn
        },
        phone: { type: String, trim: true },
        role: { type: String, enum: ["owner", "tenant"], default: "tenant" },
    },
    { timestamps: true }
);

// Tự mã hóa mật khẩu trước khi lưu (chỉ khi password bị đổi)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// So sánh mật khẩu nhập vào với bản đã mã hóa
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);