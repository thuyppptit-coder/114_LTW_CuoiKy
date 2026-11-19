import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Payload chỉ chứa id và role, không có email hay mật khẩu
const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

const toUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
});

// POST /api/auth/register  (công khai)
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Không nhận role từ client, tránh tự đăng ký làm chủ trọ.
    // Tài khoản chủ trọ tạo bằng seed.
    const user = await User.create({ name, email, password, phone, role: "tenant" });

    res.status(201).json({ token: signToken(user), user: toUserResponse(user) });
});

// POST /api/auth/login  (công khai)
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError("Vui lòng nhập email và mật khẩu", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    // Cùng một thông báo cho cả "sai email" và "sai mật khẩu" để không lộ email nào tồn tại
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Email hoặc mật khẩu không đúng", 401);
    }

    res.json({ token: signToken(user), user: toUserResponse(user) });
});

// GET /api/auth/me  (cần đăng nhập)
export const getMe = asyncHandler(async (req, res) => {
    res.json({ user: toUserResponse(req.user) });
});