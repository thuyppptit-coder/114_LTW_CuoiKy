const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Lỗi máy chủ nội bộ";

    // Lỗi sai định dạng ObjectId của MongoDB
    if (err.name === "CastError") {
        statusCode = 400;
        message = "ID không hợp lệ";
    }

    // Lỗi trùng dữ liệu unique (ví dụ: trùng email, trùng số phòng)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Giá trị '${field}' đã tồn tại`;
    }

    // Lỗi validate dữ liệu của Mongoose
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // Lỗi token JWT không hợp lệ hoặc hết hạn
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Token không hợp lệ";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Phiên đăng nhập đã hết hạn";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorHandler;