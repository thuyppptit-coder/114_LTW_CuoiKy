import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";


export const getSummary = asyncHandler(async (req, res) => {
    
    const Room = mongoose.models.Room;
    const rooms = { available: 0, occupied: 0, maintenance: 0 };

    if (Room) {
        const counts = await Room.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        counts.forEach(({ _id, count }) => {
            if (_id in rooms) rooms[_id] = count;
        });
    }

    const overdueRooms = (await Invoice.distinct("roomId", { status: "issued" })).length;

    res.json({ rooms, overdueRooms });
});

export const getOverdue = asyncHandler(async (req, res) => {
    const overdue = await Invoice.aggregate([
        { $match: { status: "issued" } },
        {
            $group: {
                _id: "$roomId",
                totalDebt: { $sum: "$total" },
                invoiceCount: { $sum: 1 },
                months: { $push: "$month" },
            },
        },
        {
            $lookup: {
                from: "rooms",
                localField: "_id",
                foreignField: "_id",
                as: "room",
            },
        },
        { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                roomId: "$_id",
                roomName: "$room.name",
                totalDebt: 1,
                invoiceCount: 1,
                months: 1,
            },
        },
        { $sort: { totalDebt: -1 } },
    ]);

    res.json({ overdue });
});

export const getRevenue = asyncHandler(async (req, res) => {
    const year = String(req.query.year || new Date().getFullYear());
    if (!/^\d{4}$/.test(year)) {
        throw new AppError("year phải gồm 4 chữ số", 400);
    }

    const rows = await Invoice.aggregate([
        { $match: { status: "paid", month: { $regex: `^${year}-` } } },
        {
            $group: {
                _id: "$month",
                revenue: { $sum: "$total" },
                invoiceCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const byMonth = Object.fromEntries(rows.map((r) => [r._id, r]));
    const months = Array.from({ length: 12 }, (_, i) => {
        const month = `${year}-${String(i + 1).padStart(2, "0")}`;
        return {
            month,
            revenue: byMonth[month]?.revenue || 0,
            invoiceCount: byMonth[month]?.invoiceCount || 0,
        };
    });

    res.json({
        year: Number(year),
        totalRevenue: months.reduce((sum, m) => sum + m.revenue, 0),
        months,
    });
});