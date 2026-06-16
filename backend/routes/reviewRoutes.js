const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getFeaturedReviews,
} = require('../controllers/reviewController');

// Public: fetch featured reviews across products
router.get('/featured', getFeaturedReviews);

// Public: fetch reviews for a product
router.get('/:productId', getProductReviews);

// Private: create a review for a product
router.post('/:productId', protect, createReview);

// Private: update / delete own review
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
