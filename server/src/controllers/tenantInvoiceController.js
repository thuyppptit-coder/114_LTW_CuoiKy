import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const VISIBLE_STATUSES = ["issued", "paid"];

export const getMyInvoices = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const { Invoice, Contract } = mongoose.models;
    if (!Invoice || !Contract) {
        return res.json({ invoices: [], page, totalPages: 0, total: 0 });
    }

    const contracts = await Contract.find({ tenantId: req.user._id }).select("roomId");
    const roomIds = contracts.map((c) => c.roomId);

    const filter = { roomId: { $in: roomIds }, status: { $in: VISIBLE_STATUSES } };
    if (VISIBLE_STATUSES.includes(req.query.status)) filter.status = req.query.status;

    const query = Invoice.find(filter)
        .sort({ month: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    if (mongoose.models.Room) query.populate("roomId", "name");

    const [invoices, total] = await Promise.all([
        query,
        Invoice.countDocuments(filter),
    ]);

    res.json({ invoices, page, totalPages: Math.ceil(total / limit), total });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError("id không hợp lệ", 400);
    }

    const { Invoice, Contract } = mongoose.models;
    if (!Invoice || !Contract) {
        throw new AppError("Không tìm thấy hóa đơn", 404);
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new AppError("Không tìm thấy hóa đơn", 404);

    if (req.user.role === "tenant") {
        const hasContract = await Contract.exists({ tenantId: req.user._id, roomId: invoice.roomId });
        if (!hasContract) throw new AppError("Bạn không có quyền xem hóa đơn này", 403);
        if (!VISIBLE_STATUSES.includes(invoice.status)) throw new AppError("Không tìm thấy hóa đơn", 404);
    }

    if (mongoose.models.Room) {
        await invoice.populate(
            mongoose.models.Building
                ? { path: "roomId", populate: { path: "buildingId", select: "name address" } }
                : { path: "roomId" }
        );
    }

    res.json({ invoice });
});
