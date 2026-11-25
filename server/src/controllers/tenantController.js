import Contract from "../models/Contract.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/tenant/overview  (tenant): hợp đồng đang hiệu lực kèm phòng và dãy trọ
export const getOverview = asyncHandler(async (req, res) => {
    const contract = await Contract.findOne({ tenantId: req.user._id, status: "active" }).populate({
        path: "roomId",
        populate: { path: "buildingId" },
    });

    res.json({ contract }); // chưa có hợp đồng thì contract = null
});