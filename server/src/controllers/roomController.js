import Room from "../models/Room.js";

export const getRooms = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 6,
      status,
      buildingId,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      q,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (buildingId) query.buildingId = buildingId;
    if (q) query.roomNumber = { $regex: q.trim(), $options: "i" };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== "") query.price.$lte = Number(maxPrice);
    }

    if (minArea !== undefined || maxArea !== undefined) {
      query.area = {};
      if (minArea !== undefined && minArea !== "") query.area.$gte = Number(minArea);
      if (maxArea !== undefined && maxArea !== "") query.area.$lte = Number(maxArea);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate("buildingId", "name address electricityPrice waterPrice serviceFee")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Room.countDocuments(query),
    ]);

    res.json({
      data: rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "buildingId",
      "name address electricityPrice waterPrice serviceFee"
    );
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ data: room });
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.json({ message: "Đã xóa phòng" });
  } catch (err) {
    next(err);
  }
};