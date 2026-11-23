const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contract.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('owner'));
router.route('/').get(ctrl.getContracts).post(ctrl.createContract);
router.patch('/:id/end', ctrl.endContract);

module.exports = router;