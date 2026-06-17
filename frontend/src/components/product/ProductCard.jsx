import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Heart, Star, X } from 'lucide-react';
import Button from '../ui/Button';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import useCurrencyStore from '../../store/useCurrencyStore';

// ─── Standalone Quick View Overlay ─────────────────────────────────────────
const QuickViewOverlay = ({ product, onClose, formatPrice, inWishlist, toggleWishlist, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  const hasRealColors = product.colors && product.colors.length > 0 && product.colors[0] !== 'Default';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-premium-dark/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex items-stretch animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '90vw' }}
      >
        {/* ── Floating product image (left) */}
        <div
          className="hidden md:block shrink-0 rounded-l-2xl overflow-hidden shadow-2xl"
          style={{ width: '260px', zIndex: 1 }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* ── Content card — premium-light (sage) background, matching site body */}
        <div
          className="relative bg-premium-light rounded-r-2xl rounded-l-2xl md:rounded-l-none shadow-2xl flex flex-col p-8 w-full"
          style={{ zIndex: 2 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-premium-dark/40 hover:text-premium-dark transition-colors rounded-full hover:bg-premium-neutral"
          >
            <X size={20} />
          </button>

          {/* Category + Title + Price — mirrors ProductDetailPage typography */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-premium-accent mb-1 uppercase tracking-widest">
              {product.category}
            </p>
            <h2 className="text-2xl font-bold text-premium-dark mb-2 leading-tight">
              {product.name}
            </h2>
            <p className="text-lg font-semibold text-premium-accent mb-3">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-premium-dark/60 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color swatches — only when real colors exist */}
          {hasRealColors && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-premium-dark mb-2 uppercase tracking-wider">
                Color
              </h4>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-premium-dark scale-110'
                        : 'border-gray-300 hover:border-premium-dark'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selector — EXACTLY matches ProductDetailPage: rounded-full w-12 h-12 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-premium-dark uppercase tracking-wider">
                Size
              </h4>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-sm text-gray-500 underline hover:text-premium-dark transition-colors"
              >
                Size Guide
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center hover:border-premium-dark transition-colors text-sm font-medium ${
                    selectedSize === size
                      ? 'border-premium-dark bg-premium-dark text-white'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Bag */}
          <div className="flex gap-3 mb-4">
            {/* Quantity stepper */}
            <div className="flex items-center border-2 border-premium-accent/30 rounded-md h-12 w-28 shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex-1 h-full flex items-center justify-center text-premium-dark/50 hover:text-premium-dark transition-colors text-xl"
              >
                −
              </button>
              <div className="w-px h-5 bg-premium-dark/10" />
              <div className="flex-1 h-full flex items-center justify-center text-sm font-semibold text-premium-dark">
                {quantity}
              </div>
              <div className="w-px h-5 bg-premium-dark/10" />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex-1 h-full flex items-center justify-center text-premium-dark/50 hover:text-premium-dark transition-colors text-xl"
              >
                +
              </button>
            </div>

            {/* Add to Bag — uses bg-premium-accent (#B85042) exactly like the site's primary Button */}
            <button
              onClick={handleAdd}
              className="flex-1 h-12 bg-premium-accent text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-premium-accent focus:ring-offset-2"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
          </div>

          {/* Wishlist + View Full Details — outline style matching the site's outline Button variant */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleWishlist(product)}
              className="flex items-center justify-center flex-1 h-11 border-2 border-premium-accent text-premium-accent text-xs font-medium rounded-md hover:bg-premium-accent hover:text-white transition-all gap-2"
            >
              <Heart size={14} className={inWishlist ? 'fill-current' : ''} />
              {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <Link
              to={`/product/${product._id}`}
              onClick={onClose}
              className="flex items-center justify-center flex-1 h-11 border-2 border-premium-accent text-premium-accent text-xs font-medium rounded-md hover:bg-premium-accent hover:text-white transition-all"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>

      {/* Size Guide modal — portalled above everything, same content as ProductDetailPage */}
      {isSizeGuideOpen && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-premium-dark/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-premium-dark">Size Guide</h2>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-2 text-gray-400 hover:text-premium-dark transition-colors rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            {/* Table — exact copy from ProductDetailPage */}
            <div className="p-6">
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
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Main ProductCard ───────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const inWishlist = isInWishlist(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
  };

  return (
    <>
      <div
        className="group relative flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 mb-4">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Wishlist — always visible */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
            title="Add to Wishlist"
          >
            <Heart size={20} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>

          {/* Quick actions — slide up on hover */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="bg-white/90 backdrop-blur text-premium-dark p-3 rounded-full shadow-lg hover:bg-premium-dark hover:text-white transition-all duration-300"
              title="Quick View"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={handleQuickAdd}
              className="bg-premium-dark text-white p-3 rounded-full shadow-lg hover:bg-black transition-all duration-300"
              title="Add to Cart"
            >
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-premium-dark mb-1">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          <div className="flex items-center gap-1 mb-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-premium-dark">{product.rating || 0}</span>
            <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
          </div>
          <p className="text-gray-500 mb-2">{product.category}</p>
          <p className="text-premium-dark font-medium">{formatPrice(product.price)}</p>
        </div>
      </div>

      {/* Quick View — rendered via portal so it escapes all parent overflow/stacking */}
      {quickViewOpen && createPortal(
        <QuickViewOverlay
          product={product}
          onClose={() => setQuickViewOpen(false)}
          formatPrice={formatPrice}
          inWishlist={inWishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
        />,
        document.body
      )}
    </>
  );
};

export default ProductCard;
