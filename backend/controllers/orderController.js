const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Guest or Logged in)
const createOrder = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user ? req.user._id : undefined,
      email,
      firstName,
      lastName,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: true, // Mark mock checkout orders as paid immediately
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: 'Could not create order. Please try again.' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin or Owner)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow access if admin, or if guest email matches, or if authenticated user is the owner
    const isAdmin = req.user && req.user.isAdmin;
    const isOwner = req.user && order.user && (order.user._id.toString() === req.user._id.toString());
    
    if (isAdmin || isOwner) {
      res.json(order);
    } else {
      res.status(403).json({ message: 'Not authorized to view this order.' });
    }
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ message: 'Could not fetch orders.' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('updateOrderToPaid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('updateOrderToDelivered error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
};
