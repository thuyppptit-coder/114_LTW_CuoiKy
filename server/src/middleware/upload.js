import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import AppError from "../utils/AppError.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Chỉ cho 3 định dạng ảnh
const ALLOWED = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "quan-ly-nha-tro",
        allowed_formats: ["jpg", "png", "webp"],
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