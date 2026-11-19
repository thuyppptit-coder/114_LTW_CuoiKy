import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Xác minh token. Không có/sai token -> 401
export const protect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token) throw new AppError("Bạn chưa đăng nhập", 401);

    // Sai chữ ký hoặc hết hạn -> jwt ném lỗi, errorHandler đổi thành 401
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("Tài khoản không còn tồn tại", 401);

    req.user = user; // các middleware/controller phía sau dùng req.user
    next();
});

// Giới hạn theo vai trò. Sai vai trò -> 403
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError("Bạn không có quyền thực hiện thao tác này", 403));
    }
    next();
};