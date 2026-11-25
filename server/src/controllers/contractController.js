import Contract from "../models/Contract.js";
import Room from "../models/Room.js";

export const getContracts = async (req, res, next) => {
  try {
    const filter = req.user.role === "tenant" ? { tenantId: req.user.id } : {};
    const contracts = await Contract.find(filter)
      .populate("roomId", "roomNumber price area status buildingId")
      .populate("tenantId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ data: contracts });
  } catch (err) {
    next(err);
  }
};

export const createContract = async (req, res, next) => {
  try {
    const { roomId, tenantId, startDate, endDate, monthlyRent, deposit } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const activeContract = await Contract.findOne({
      roomId,
      status: "Hiệu lực",
    });

    if (activeContract || room.status === "Đang thuê") {
      return res.status(409).json({
        message: "Phòng đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới",
      });
    }

    const contract = await Contract.create({
      roomId,
      tenantId,
      startDate,
      endDate,
      monthlyRent: monthlyRent !== "" && monthlyRent !== undefined ? Number(monthlyRent) : room.price,
      deposit: deposit !== "" && deposit !== undefined ? Number(deposit) : 0,
      status: "Hiệu lực",
    });

    room.status = "Đang thuê";
    await room.save();

    res.status(201).json({ data: contract });
  } catch (err) {
    next(err);
  }
};

export const terminateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    contract.status = "Đã kết thúc";
    contract.endDate = req.body?.endDate || new Date();
    await contract.save();

    await Room.findByIdAndUpdate(contract.roomId, { status: "Trống" });

    res.json({ message: "Đã kết thúc hợp đồng", data: contract });
  } catch (err) {
    next(err);
  }
};