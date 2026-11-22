import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calcInvoice } from "../utils/calcInvoice.js";

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const toNumber = (value) =>
    value === undefined || value === null || value === "" ? NaN : Number(value);

export const createInvoice = asyncHandler(async (req, res) => {
    const { roomId, month } = req.body;

    if (!mongoose.isValidObjectId(roomId)) {
        throw new AppError("roomId không hợp lệ", 400);
    }
    if (!MONTH_REGEX.test(month || "")) {
        throw new AppError("Tháng phải có dạng YYYY-MM", 400);
    }
    const { Room, Building, Contract } = mongoose.models;
    if (!Room || !Building || !Contract) {
        throw new AppError("Chưa có model Room, Building hoặc Contract", 500);
    }

    const room = await Room.findById(roomId);
    if (!room) throw new AppError("Không tìm thấy phòng", 404);

    const building = await Building.findById(room.buildingId);
    if (!building) throw new AppError("Không tìm thấy dãy trọ của phòng", 404);

    const contract = await Contract.findOne({ roomId, status: "active" });
    if (!contract) {
        throw new AppError("Phòng chưa có hợp đồng đang hiệu lực", 400);
    }

    if (await Invoice.exists({ roomId, month })) {
        throw new AppError("Phòng này đã có hóa đơn cho tháng " + month, 409);
    }

    const previous = await Invoice.findOne({ roomId, month: { $lt: month } }).sort({ month: -1 });
    const electricOld = previous ? previous.electricNew : toNumber(req.body.electricOld);
    const waterOld = previous ? previous.waterNew : toNumber(req.body.waterOld);
    const electricNew = toNumber(req.body.electricNew);
    const waterNew = toNumber(req.body.waterNew);

    if ([electricOld, waterOld, electricNew, waterNew].some((v) => !Number.isFinite(v) || v < 0)) {
        throw new AppError("Chỉ số điện nước phải là số không âm", 400);
    }

    const roomFee = contract.rent ?? room.price;
    const { electricPrice, waterPrice, serviceFee } = building;

    const { electricFee, waterFee, total } = calcInvoice({
        roomFee,
        serviceFee,
        electricPrice,
        waterPrice,
        electricOld,
        electricNew,
        waterOld,
        waterNew,
    });

    const invoice = await Invoice.create({
        roomId,
        month,
        electricOld,
        electricNew,
        waterOld,
        waterNew,
        electricPrice,
        waterPrice,
        roomFee,
        electricFee,
        waterFee,
        serviceFee,
        total,
    });

    res.status(201).json({ invoice });
});