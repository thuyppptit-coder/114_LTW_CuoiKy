const Contract = require('../models/Contract');
const Room = require('../models/Room');

exports.createContract = async (req, res, next) => {
  try {
    const { roomId, tenantId, startDate, endDate, deposit, monthlyRent } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

    const activeContract = await Contract.findOne({ roomId, isActive: true });
    if (activeContract || room.status === 'Đang thuê') {
      return res.status(400).json({
        success: false,
        message: 'Phòng đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới',
      });
    }

    const contract = await Contract.create({
      roomId,
      tenantId,
      startDate,
      endDate: endDate || null,
      deposit: deposit ?? 0,
      monthlyRent: monthlyRent ?? room.price,
      isActive: true,
    });

    room.status = 'Đang thuê';
    await room.save();

    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

exports.endContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    if (!contract.isActive) {
      return res.status(400).json({ success: false, message: 'Hợp đồng đã kết thúc' });
    }

    contract.isActive = false;
    contract.endDate = req.body.endDate || new Date();
    await contract.save();

    await Room.findByIdAndUpdate(contract.roomId, { status: 'Trống' });

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

exports.getContracts = async (req, res, next) => {
  try {
    const contracts = await Contract.find()
      .populate('roomId', 'roomNumber price status')
      .populate('tenantId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contracts });
  } catch (err) {
    next(err);
  }
};