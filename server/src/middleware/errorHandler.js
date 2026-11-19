import AppError from "../utils/AppError.js";

// Route không tồn tại -> 404
export const notFound = (req, res, next) => {
    next(new AppError(`Không tìm thấy ${req.method} ${req.originalUrl}`, 404));
};

// Nơi duy nhất trả lỗi về client (4 tham số thì Express mới nhận là error handler)
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Lỗi máy chủ";

    if (err.name === "ValidationError") {
        // Mongoose: thiếu field, sai enum...
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
        // Trùng unique index (vd: email)
        statusCode = 409;
        message = `${Object.keys(err.keyValue).join(", ")} đã tồn tại`;
    } else if (err.name === "CastError") {
        // _id sai định dạng
        statusCode = 400;
        message = "ID không hợp lệ";
    } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token không hợp lệ hoặc đã hết hạn";
    } else if (err.name === "MulterError") {
        statusCode = 400;
    }

    if (statusCode === 500) console.error(err);

    res.status(statusCode).json({ message });
};