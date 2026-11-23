const Room = require('../models/Room');
// GET /api/rooms?minPrice=&maxPrice=&minArea=&maxArea=&status=&page=1&limit=6
exports.getRooms = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, minArea, maxArea, status, buildingId } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);

    const filter = {};
    if (status) filter.status = status;
    if (buildingId) filter.buildingId = buildingId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== '' && minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== '' && maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    if (minArea !== undefined || maxArea !== undefined) {
      filter.area = {};
      if (minArea !== '' && minArea !== undefined) filter.area.$gte = Number(minArea);
      if (maxArea !== '' && maxArea !== undefined) filter.area.$lte = Number(maxArea);
      if (Object.keys(filter.area).length === 0) delete filter.area;
    }

    const total = await Room.countDocuments(filter);
    const rooms = await Room.find(filter)
      .populate('buildingId', 'name address electricityPrice waterPrice serviceFee')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      'buildingId',
      'name address electricityPrice waterPrice serviceFee'
    );
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    res.status(200).json({ success: true, message: 'Đã xóa phòng' });
  } catch (err) {
    next(err);
  }
};