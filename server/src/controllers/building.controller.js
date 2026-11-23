const Building = require('../models/Building');

exports.createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create({
      ...req.body,
      ownerId: req.user._id || req.user.id,
    });
    res.status(201).json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};

exports.getBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: buildings });
  } catch (err) {
    next(err);
  }
};

exports.getBuildingById = async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ' });
    res.status(200).json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};

exports.updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!building) return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ' });
    res.status(200).json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};

exports.deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) return res.status(404).json({ success: false, message: 'Không tìm thấy dãy trọ' });
    res.status(200).json({ success: true, message: 'Đã xóa dãy trọ' });
  } catch (err) {
    next(err);
  }
};