import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
    await User.deleteMany();
    // Dùng create (không dùng insertMany) để hook mã hóa mật khẩu chạy
    await User.create([
        { name: "Chủ trọ Demo", email: "owner@demo.com", password: "123456", phone: "0900000001", role: "owner" },
        { name: "Người thuê Demo 1", email: "tenant1@demo.com", password: "123456", phone: "0900000002", role: "tenant" },
        { name: "Người thuê Demo 2", email: "tenant2@demo.com", password: "123456", phone: "0900000003", role: "tenant" },
    ]);
    console.log("Đã seed users");
};

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await seedUsers();

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});