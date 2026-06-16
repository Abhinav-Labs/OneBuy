import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Pencil, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductCard from '../components/product/ProductCard';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import fallbackProducts from '../data/fallbackProducts';
import useCurrencyStore from '../store/useCurrencyStore';

const API_BASE = '/api';

const FALLBACK_REVIEWS = [
  {
    _id: 'fb1',
    rating: 5,
    text: "Absolutely love this product. The quality is incredible and the fit is perfect. I've bought multiple items from OneBuy and they never disappoint.",
    user: { name: 'Alex M.', _id: 'fbuser1' },
    createdAt: '2025-06-10T10:00:00.000Z',
  },
  {
    _id: 'fb2',
    rating: 5,
    text: "Premium quality at a fair price. The fabric is so much better than other brands I've tried. Will definitely be a repeat customer.",
    user: { name: 'Priya S.', _id: 'fbuser2' },
    createdAt: '2025-05-22T14:30:00.000Z',
  },
  {
    _id: 'fb3',
    rating: 4,
    text: "Great purchase overall. The material is high quality and the shipping was fast. Minor fit issue but nothing major.",
    user: { name: 'Jordan T.', _id: 'fbuser3' },
    createdAt: '2025-05-15T09:15:00.000Z',
  },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();
  const { user, token } = useAuthStore();

  // Review state
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState('');
  const [editingReview, setEditingReview] = useState(null); // review _id being edited
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editHover, setEditHover] = useState(0);

  // Fetch product
  useEffect(() => {
    window.scrollTo(0, 0);
    setProduct(null);
    setRelatedProducts([]);
    setImageLoaded(false);
    setLoading(true);
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('API down');
        let allData = await res.json();
        
        if (!Array.isArray(allData)) {
          allData = fallbackProducts;
        }

        const currentData = allData.find(p => String(p._id) === id) || allData[0];
        setProduct(currentData);
        if(currentData.sizes?.length) setSelectedSize(currentData.sizes[0]);
        if(currentData.colors?.length) setSelectedColor(currentData.colors[0]);
        setRelatedProducts(allData.filter(p => String(p._id) !== String(currentData._id)));
      } catch {
        const fallback = fallbackProducts.find(p => p._id === id) || fallbackProducts[0];
        setProduct(fallback);
        setSelectedSize(fallback.sizes[0]);
        setSelectedColor(fallback.colors[0]);
        setRelatedProducts(fallbackProducts.filter(p => p._id !== fallback._id));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews from backend
  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) && data.length > 0 ? data : FALLBACK_REVIEWS);
        return;
      }
    } catch (_) {}
    setReviews(FALLBACK_REVIEWS);
  };

  useEffect(() => {
    if (product) {
      fetchReviews(product._id);
      setNewReviewText('');
      setNewReviewRating(5);
      setReviewError('');
      setEditingReview(null);
    }
  }, [product]);

  // Computed review stats
  const avgRating = reviews.length> 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
  const distPercent = {};
  for (const s of [5, 4, 3, 2, 1]) {
    distPercent[s] = reviews.length> 0 ? Math.round((distribution[s] / reviews.length) * 100) : 0;
  }

  // Create review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!user || !token) {
      setReviewError('Please sign in to write a review.');
      return;
    }
    if (!newReviewText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/${product._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: newReviewRating, text: newReviewText }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.message); return; }
      setNewReviewText('');
      setNewReviewRating(5);
      fetchReviews(product._id);
    } catch {
      setReviewError('Something went wrong. Please try again.');
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    try {
      await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews(product._id);
    } catch { /* silently fail */ }
  };

  // Start editing
  const startEditing = (review) => {
    setEditingReview(review._id);
    setEditText(review.text);
    setEditRating(review.rating);
    setEditHover(0);
  };

  // Save edit
  const handleEditSave = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editRating, text: editText }),
      });
      if (res.ok) {
        setEditingReview(null);
        fetchReviews(product._id);
      }
    } catch { /* silently fail */ }
  };

  if (loading) return (
    <div className="pt-24 pb-16 bg-white min-h-screen flex items-center justify-center">
      <div 
        className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-premium-dark rounded-full animate-spin"></div>
        <p className="text-premium-dark/60 font-medium">Loading product...</p>
      </div>
    </div>
  );
  if (!product) return <div className="py-32 text-center">Product not found</div>;

  const handleAddToCart = () => {
    addToCart(product, 1, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, 1, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-sm text-gray-500 mb-8 flex gap-2">
          <Link to="/" className="hover:text-premium-dark">Home</Link>
          <span>/</span>
          <span className="text-premium-dark font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div
              className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 relative">
              {/* Skeleton shimmer shown while image is loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
              )}
              <img
                key={id}
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
              <button 
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors">
                <Heart size={24} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"} />
              </button>
            </div>
          </div>

          <div className="flex flex-col pt-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-premium-dark mb-2">{product.name}</h1>
            
            {reviews.length> 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} className={i < Math.floor(avgRating) ? "" : "text-gray-300"} />
                  ))}
                </div>
                <span className="text-sm font-medium text-premium-dark">{avgRating} Rating</span>
                <span className="text-sm text-gray-500">({reviews.length} Reviews)</span>
              </div>
            )}

            <p className="text-2xl text-premium-accent font-medium mb-6">{formatPrice(product.price)}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
            
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-premium-dark mb-3 uppercase tracking-wider">Color</h4>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button 
                    key={color} 
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-md border ${selectedColor === color ? 'border-premium-dark bg-premium-dark text-white' : 'border-gray-300 text-gray-700'} hover:border-premium-dark transition-colors text-sm font-medium`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-premium-dark uppercase tracking-wider">Size</h4>
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-sm text-gray-500 underline hover:text-premium-dark">Size Guide</button>
              </div>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border ${selectedSize === size ? 'border-premium-dark bg-premium-dark text-white' : 'border-gray-300 text-gray-700'} flex items-center justify-center hover:border-premium-dark transition-colors text-sm font-medium`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <Button size="lg" className="flex-1 py-4 text-lg" variant="outline" onClick={handleAddToCart}>Add to Cart</Button>
              <Button size="lg" className="flex-1 py-4 text-lg" onClick={handleBuyNow}>Buy Now</Button>
            </div>
            
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-premium-dark mb-4">Product Details</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>100% Premium materials</li>
                <li>Designed in studios</li>
                <li>Machine wash cold, lay flat to dry</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length> 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-dark mb-10 border-t border-gray-200 pt-12 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(rp => (
              <ProductCard key={rp._id} product={rp} />
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-24">
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-dark mb-8">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Summary & Form */}
            <div className="lg:col-span-1 space-y-8">
              {/* Rating Summary & Bars */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold text-premium-dark">{avgRating || '–'}</div>
                  <div>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} className={i < Math.floor(avgRating) ? "" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{reviews.length} global ratings</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-premium-dark w-12">{star} star</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-300" 
                          style={{ width: `${distPercent[star]}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-10 text-right">{distPercent[star]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Review Form */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-premium-dark mb-4">Review this product</h3>
                
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Sign in to write a review</p>
                    <Link to="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">Share your thoughts with other customers</p>
                    {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-premium-dark mb-2">Overall rating</label>
                        <div className="flex text-yellow-400 gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={24} 
                              className="cursor-pointer transition-colors"
                              fill={star <= (hoverRating || newReviewRating) ? "currentColor" : "none"}
                              color={star <= (hoverRating || newReviewRating) ? "#facc15" : "#d1d5db"}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setNewReviewRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-premium-dark mb-2">Write your review</label>
                        <textarea 
                          required
                          rows="4"
                          placeholder="What did you like or dislike?"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-premium-dark focus:border-premium-dark"
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}></textarea>
                      </div>
                      <Button type="submit" className="w-full">Submit Review</Button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Review List */}
            <div className="lg:col-span-2">
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-lg">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const isOwner = user && review.user && (review.user._id === user._id);
                    const isEditing = editingReview === review._id;

                    return (
                      <div key={review._id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-premium-dark text-white flex items-center justify-center font-bold">
                              {review.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-premium-dark">{review.user?.name || 'Anonymous'}</h4>
                              <span className="text-xs text-gray-500">Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          {isOwner && !isEditing && (
                            <div className="flex gap-2">
                              <button onClick={() => startEditing(review)} className="p-2 text-gray-400 hover:text-premium-dark transition-colors rounded-lg hover:bg-gray-200" title="Edit">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteReview(review._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex text-yellow-400 gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={20} 
                                  className="cursor-pointer"
                                  fill={star <= (editHover || editRating) ? "currentColor" : "none"}
                                  color={star <= (editHover || editRating) ? "#facc15" : "#d1d5db"}
                                  onMouseEnter={() => setEditHover(star)}
                                  onMouseLeave={() => setEditHover(0)}
                                  onClick={() => setEditRating(star)}
                                />
                              ))}
                            </div>
                            <textarea 
                              rows="3"
                              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-premium-dark"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEditSave(review._id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex text-yellow-400 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                              ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed">"{review.text}"</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <Modal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} title="Size Guide">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-premium-dark">Size</th>
                <th className="py-3 px-4 font-semibold text-premium-dark">Chest (in)</th>
                <th className="py-3 px-4 font-semibold text-premium-dark">Waist (in)</th>
                <th className="py-3 px-4 font-semibold text-premium-dark">Hips (in)</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">S</td>
                <td className="py-3 px-4">34 - 36</td>
                <td className="py-3 px-4">28 - 30</td>
                <td className="py-3 px-4">35 - 37</td>
              </tr>
              <tr className="border-b border-premium-neutral bg-premium-light/50">
                <td className="py-3 px-4 font-medium">M</td>
                <td className="py-3 px-4">38 - 40</td>
                <td className="py-3 px-4">32 - 34</td>
                <td className="py-3 px-4">39 - 41</td>
              </tr>
              <tr className="border-b border-premium-neutral">
                <td className="py-3 px-4 font-medium">L</td>
                <td className="py-3 px-4">42 - 44</td>
                <td className="py-3 px-4">36 - 38</td>
                <td className="py-3 px-4">43 - 45</td>
              </tr>
              <tr className="border-b border-premium-neutral bg-premium-light/50">
                <td className="py-3 px-4 font-medium">XL</td>
                <td className="py-3 px-4">46 - 48</td>
                <td className="py-3 px-4">40 - 42</td>
                <td className="py-3 px-4">47 - 49</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-premium-dark/50 mt-6 italic">
          * Measurements refer to body size, not garment dimensions. If you're between sizes, order the larger size for a relaxed fit or the smaller size for a tighter fit.
        </p>
      </Modal>

    </div>
  );
};

export default ProductDetailPage;
