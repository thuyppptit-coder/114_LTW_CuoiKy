const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/users?role=tenant
router.get('/', protect, authorize('owner'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;