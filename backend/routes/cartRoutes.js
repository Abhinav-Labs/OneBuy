const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCart, syncCart, saveCart } = require('../controllers/cartController');

router.get('/',       protect, getCart);   // Load DB cart on login
router.post('/sync',  protect, syncCart);  // Merge guest cart into DB on login
router.put('/',       protect, saveCart);  // Persist cart after every change

module.exports = router;
