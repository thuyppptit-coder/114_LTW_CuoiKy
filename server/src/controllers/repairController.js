import mongoose from "mongoose";
import RepairRequest from "../models/RepairRequest.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Chỉ cho đi tới trạng thái kế tiếp: Mới -> Đang xử lý -> Xong
const NEXT_STATUS = { new: "in_progress", in_progress: "done" };

// Tìm phòng của người thuê qua hợp đồng đang hiệu lực (model của B).
// Nếu B đặt tên khác, chỉ cần sửa hàm này.
const findTenantRoomId = async (tenantId) => {
    const Contract = mongoose.models.Contract;
    if (!Contract) return null; // B chưa xong model
    const contract = await Contract.findOne({ tenantId, status: "active" });
    return contract ? contract.roomId : null;
};

// POST /api/repairs  (tenant, multipart/form-data)
export const createRepair = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const images = (req.files || []).map((file) => file.path);

    const repair = await RepairRequest.create({
        tenantId: req.user._id, // lấy từ token, không tin client gửi lên
        roomId: await findTenantRoomId(req.user._id),
        title,
        description,
        images,
    });

    res.status(201).json({ repair });
});

// GET /api/repairs/mine  (tenant): chỉ yêu cầu của chính mình
export const getMyRepairs = asyncHandler(async (req, res) => {
    const query = RepairRequest.find({ tenantId: req.user._id }).sort({ createdAt: -1 });
    if (mongoose.models.Room) query.populate("roomId");
    const repairs = await query;
    res.json({ repairs });
});

// GET /api/repairs?status=new&page=1&limit=10  (owner)
export const getAllRepairs = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const query = RepairRequest.find(filter)
        .populate("tenantId", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    if (mongoose.models.Room) query.populate("roomId");

    const [repairs, total] = await Promise.all([
        query,
        RepairRequest.countDocuments(filter),
    ]);

    res.json({ repairs, page, totalPages: Math.ceil(total / limit), total });
});

// PATCH /api/repairs/:id/status  (owner)
export const updateRepairStatus = asyncHandler(async (req, res) => {
    const repair = await RepairRequest.findById(req.params.id);
    if (!repair) throw new AppError("Không tìm thấy yêu cầu sửa chữa", 404);

    if (NEXT_STATUS[repair.status] !== req.body.status) {
        throw new AppError("Chỉ được chuyển theo thứ tự Mới → Đang xử lý → Xong", 400);
    }

    repair.status = req.body.status;
    await repair.save();
    res.json({ repair });
});