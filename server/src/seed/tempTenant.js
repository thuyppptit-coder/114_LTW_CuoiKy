import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Building from "../models/Building.js";
import Room from "../models/Room.js";
import Contract from "../models/Contract.js";
import Invoice from "../models/Invoice.js";

dotenv.config();

const makeInvoice = (room, contract, building, month, eOld, eNew, wOld, wNew, status) => {
    const electricFee = (eNew - eOld) * building.electricPrice;
    const waterFee = (wNew - wOld) * building.waterPrice;
    return {
        roomId: room._id,
        contractId: contract._id,
        tenantId: contract.tenantId,
        month,
        status,
        electricOld: eOld,
        electricNew: eNew,
        waterOld: wOld,
        waterNew: wNew,
        electricPrice: building.electricPrice,
        waterPrice: building.waterPrice,
        roomFee: room.price,
        electricFee,
        waterFee,
        serviceFee: building.serviceFee,
        total: room.price + electricFee + waterFee + building.serviceFee,
        paidAt: status === "paid" ? new Date() : undefined,
        issuedAt: status !== "draft" ? new Date() : undefined,
    };
};

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const owner = await User.findOne({ role: "owner" });
    const tenant1 = await User.findOne({ email: "tenant1@demo.com" });
    const tenant2 = await User.findOne({ email: "tenant2@demo.com" });

    if (!owner || !tenant1 || !tenant2) {
        throw new Error("Chưa có user mẫu! Hãy chạy lệnh 'npm run seed' trước.");
    }

    await Promise.all([
        Building.deleteMany(),
        Room.deleteMany(),
        Contract.deleteMany(),
        Invoice.deleteMany(),
    ]);

    const building = await Building.create({
        name: "Dãy trọ A",
        address: "Hà Nội",
        ownerId: owner._id,
        electricPrice: 3500,
        waterPrice: 15000,
        serviceFee: 100000,
    });

    const room1 = await Room.create({
        buildingId: building._id,
        name: "P101",
        price: 2500000,
        area: 20,
        status: "occupied",
    });

    const room2 = await Room.create({
        buildingId: building._id,
        name: "P102",
        price: 2800000,
        area: 25,
        status: "occupied",
    });

    const [contract1, contract2] = await Contract.create([
        {
            tenantId: tenant1._id,
            roomId: room1._id,
            startDate: new Date("2026-08-01"),
            endDate: new Date("2027-08-01"),
            rent: 2500000,
            deposit: 2500000,
            status: "active",
        },
        {
            tenantId: tenant2._id,
            roomId: room2._id,
            startDate: new Date("2026-08-01"),
            endDate: new Date("2027-08-01"),
            rent: 2800000,
            deposit: 2800000,
            status: "active",
        },
    ]);

    await Invoice.create([
        makeInvoice(room1, contract1, building, "2026-09", 100, 160, 10, 18, "paid"),
        makeInvoice(room1, contract1, building, "2026-10", 160, 230, 18, 27, "issued"),
        makeInvoice(room1, contract1, building, "2026-11", 230, 290, 27, 33, "draft"), // nháp: tenant1 không thấy
        makeInvoice(room2, contract2, building, "2026-10", 50, 120, 5, 12, "issued"),  // của P102: tenant1 bị 403
    ]);

    console.log("Đã seed dữ liệu tạm thành công!");
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});