const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper: recalculate product rating & numReviews from all its reviews
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ message: 'Could not fetch reviews.' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews/:productId
// @access  Private (logged-in users only)
const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;

    // Check the product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating: Number(rating),
      text,
    });

    await recalcProductRating(product._id);

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('createReview error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    res.status(500).json({ message: 'Could not create review.' });
  }
};

// @desc    Update own review
// @route   PUT /api/reviews/:reviewId
// @access  Private (owner only)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Only the author can edit
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review.' });
    }

    if (req.body.rating) review.rating = Number(req.body.rating);
    if (req.body.text) review.text = req.body.text;

    await review.save();
    await recalcProductRating(review.product);

    const populated = await review.populate('user', 'name avatar');
    res.json(populated);
  } catch (error) {
    console.error('updateReview error:', error);
    res.status(500).json({ message: 'Could not update review.' });
  }
};

// @desc    Delete own review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (owner only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Only the author can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalcProductRating(productId);

    res.json({ message: 'Review deleted.' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ message: 'Could not delete review.' });
  }
};

// @desc    Get featured reviews (e.g., 5 star reviews) for the home page
// @route   GET /api/reviews/featured
// @access  Public
const getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate('user', 'name avatar')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(reviews);
  } catch (error) {
    console.error('getFeaturedReviews error:', error);
    res.status(500).json({ message: 'Could not fetch featured reviews.' });
  }
};

module.exports = { getProductReviews, createReview, updateReview, deleteReview, getFeaturedReviews };
