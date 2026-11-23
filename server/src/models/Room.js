const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    roomNumber: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Trống', 'Đang thuê', 'Đang sửa'],
      default: 'Trống',
    },
    description: { type: String, default: '' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);