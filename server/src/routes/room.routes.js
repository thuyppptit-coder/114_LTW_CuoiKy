const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', ctrl.getRooms);
router.get('/:id', ctrl.getRoomById);
router.post('/', protect, authorize('owner'), ctrl.createRoom);
router.put('/:id', protect, authorize('owner'), ctrl.updateRoom);
router.delete('/:id', protect, authorize('owner'), ctrl.deleteRoom);

module.exports = router;