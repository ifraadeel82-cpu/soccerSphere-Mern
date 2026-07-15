const express = require('express');
const router = express.Router();
const { registerFan, login, createAdmin, getMe } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
router.post('/register', registerFan);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-admin', protect, adminOnly, createAdmin);
module.exports = router;
