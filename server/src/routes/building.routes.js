const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/building.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('owner'));
router.route('/').post(ctrl.createBuilding).get(ctrl.getBuildings);
router.route('/:id').get(ctrl.getBuildingById).put(ctrl.updateBuilding).delete(ctrl.deleteBuilding);

module.exports = router;