const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authGoogle, register, login, getMe, appleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for development and demonstration purposes
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

router.post('/google', authGoogle);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/apple', appleAuth);
router.get('/me', protect, getMe);

module.exports = router;