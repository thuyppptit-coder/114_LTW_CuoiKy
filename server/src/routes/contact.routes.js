const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', ctrl.createContact);
router.get('/', protect, authorize('owner'), ctrl.getContacts);

module.exports = router;