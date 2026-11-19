import multer from "multer";
import crypto from "crypto";
import AppError from "../utils/AppError.js";

// Chỉ cho 3 định dạng ảnh, đuôi file lấy từ mimetype chứ không tin tên file người dùng gửi
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ALLOWED[file.mimetype]}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
        return cb(new AppError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP", 400));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 3 }, // 2MB mỗi ảnh, tối đa 3 ảnh
});

export default upload;