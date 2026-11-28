import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";

export const getOverview = asyncHandler(async (req, res) => {
    const Contract = mongoose.models.Contract;
    if (!Contract) {
        return res.json({ contract: null });
    }

    const query = Contract.findOne({ tenantId: req.user._id, status: "active" });
    if (mongoose.models.Room) {
        query.populate(
            mongoose.models.Building
                ? { path: "roomId", populate: { path: "buildingId" } }
                : { path: "roomId" }
        );
    }

    const contract = await query;
    res.json({ contract });
});
