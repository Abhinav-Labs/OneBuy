const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWishlist, syncWishlist, saveWishlist } = require('../controllers/wishlistController');

router.get('/',       protect, getWishlist);    // Load DB wishlist on login
router.post('/sync',  protect, syncWishlist);   // Merge guest wishlist into DB on login
router.put('/',       protect, saveWishlist);   // Persist wishlist after every change

module.exports = router;
