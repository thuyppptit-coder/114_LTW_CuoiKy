import Building from "../models/Building.js";

export const getBuildings = async (req, res, next) => {
  try {
    const filter = req.user.role === "owner" ? { ownerId: req.user.id } : {};
    const buildings = await Building.find(filter).sort({ createdAt: -1 });
    res.json({ data: buildings });
  } catch (err) {
    next(err);
  }
};

export const createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create({
      ...req.body,
      ownerId: req.user.id,
    });
    res.status(201).json({ data: building });
  } catch (err) {
    next(err);
  }
};

export const updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!building) {
      return res.status(404).json({ message: "Không tìm thấy dãy trọ" });
    }
    res.json({ data: building });
  } catch (err) {
    next(err);
  }
};

export const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });
    if (!building) {
      return res.status(404).json({ message: "Không tìm thấy dãy trọ" });
    }
    res.json({ message: "Đã xóa dãy trọ" });
  } catch (err) {
    next(err);
  }
};