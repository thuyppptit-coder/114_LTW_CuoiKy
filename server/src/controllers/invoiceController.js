import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Contract from "../models/Contract.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calcInvoice } from "../utils/calcInvoice.js";


const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const toNumber = (value) =>
    value === undefined || value === null || value === "" ? NaN : Number(value);

// POST /api/invoices  (owner): tạo hóa đơn nháp, server tự tính tiền
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

    if (![electricPrice, waterPrice, serviceFee].every(Number.isFinite)) {
        throw new AppError("Dãy trọ thiếu đơn giá điện, nước hoặc phí dịch vụ", 400);
    }

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
        contractId: contract._id,
        tenantId: contract.tenantId,
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

// GET /api/invoices?month=2026-11&status=draft&page=1&limit=10  (owner)
export const getInvoices = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const filter = {};
    if (req.query.month) filter.month = req.query.month;
    if (req.query.status) filter.status = req.query.status;

    const query = Invoice.find(filter)
        .sort({ month: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    if (mongoose.models.Room) query.populate("roomId");
    if (mongoose.models.User) query.populate("tenantId", "name phone email");

    const [invoices, total] = await Promise.all([
        query,
        Invoice.countDocuments(filter),
    ]);

    res.json({ invoices, page, totalPages: Math.ceil(total / limit), total });
});

// PATCH /api/invoices/:id/issue  (owner): draft -> issued
export const issueInvoice = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError("id không hợp lệ", 400);
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);

    if (invoice.status !== "draft") {
        throw new AppError("Chỉ phát hành được hóa đơn đang ở trạng thái nháp", 400);
    }

    invoice.status = "issued";
    invoice.issuedAt = new Date();
    await invoice.save();
    res.json({ invoice });
});

// PATCH /api/invoices/:id/pay  (owner): issued -> paid
export const payInvoice = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError("id không hợp lệ", 400);
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);

    if (invoice.status !== "issued") {
        throw new AppError("Chỉ thu tiền được hóa đơn đã phát hành", 400);
    }

    invoice.status = "paid";
    invoice.paidAt = new Date();
    await invoice.save();
    res.json({ invoice });
});
// Người thuê chỉ thấy hóa đơn đã phát hành hoặc đã thu
const VISIBLE_STATUSES = ["issued", "paid"];

// GET /api/invoices/mine?status=issued&page=1&limit=10  (tenant)
export const getMyInvoices = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    // Tìm các phòng mà người này có hợp đồng
    const contracts = await Contract.find({ tenantId: req.user._id }).select("roomId");
    const roomIds = contracts.map((c) => c.roomId);

    const filter = { roomId: { $in: roomIds }, status: { $in: VISIBLE_STATUSES } };
    if (VISIBLE_STATUSES.includes(req.query.status)) filter.status = req.query.status;

    const [invoices, total] = await Promise.all([
        Invoice.find(filter)
            .populate("roomId", "name")
            .sort({ month: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Invoice.countDocuments(filter),
    ]);

    res.json({ invoices, page, totalPages: Math.ceil(total / limit), total });
});

// GET /api/invoices/:id  (tenant: chỉ hóa đơn phòng mình, owner: xem được hết)
export const getInvoiceById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError("id không hợp lệ", 400);
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);

    if (req.user.role === "tenant") {
        // Kiểm tra quyền ở server: người này có hợp đồng với phòng của hóa đơn không?
        const hasContract = await Contract.exists({ tenantId: req.user._id, roomId: invoice.roomId });
        if (!hasContract) throw new AppError("Bạn không có quyền xem hóa đơn này", 403);
        if (!VISIBLE_STATUSES.includes(invoice.status)) throw new AppError("Không tìm thấy hóa đơn", 404);
    }

    await invoice.populate({
        path: "roomId",
        populate: { path: "buildingId", select: "name address" },
    });

    res.json({ invoice });
});