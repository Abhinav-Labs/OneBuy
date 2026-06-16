const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Helper to make protect optional for checkout (sets req.user if token is present, but doesn't fail if absent)
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      return await protect(req, res, next);
    } catch (error) {
      // Token exists but failed, proceed as guest
      return next();
    }
  }
  next();
};

router.route('/')
  .post(optionalProtect, createOrder)
  .get(protect, admin, getOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, admin, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

module.exports = router;
