import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Đã kết nối MongoDB");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
        process.exit(1); // Dừng hẳn server nếu không kết nối được database
    }
};

export default connectDB;