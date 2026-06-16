import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Heart, Star } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import useCurrencyStore from '../../store/useCurrencyStore';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const inWishlist = isInWishlist(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
  };

  const handleModalAdd = () => {
    addToCart(product, 1, selectedSize, product.colors?.[0] || 'Default');
    setQuickViewOpen(false);
  };

  return (
    <>
      <div 
        className="group relative flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 mb-4">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              
              
            />
          </Link>
          
          {/* Wishlist button - top right */}
          <button
            
            
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
            title="Add to Wishlist">
            <Heart size={20} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </button>
          
          {/* Quick actions overlay */}
          <div 
            
            
            className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
            <button 
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="bg-white/90 backdrop-blur text-premium-dark p-3 rounded-full shadow-lg hover:bg-premium-dark hover:text-white transition-colors"
              title="Quick View">
              <Eye size={20} />
            </button>
            <button 
              onClick={handleQuickAdd}
              className="bg-premium-dark text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors"
              title="Add to Cart">
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

      {/* Quick View Modal */}
      <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] rounded-lg overflow-hidden bg-gray-100">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-premium-dark mb-2">{product.name}</h2>
            <p className="text-xl text-premium-accent font-medium mb-4">{formatPrice(product.price)}</p>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-premium-dark mb-2 uppercase tracking-wider">Size</h4>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center hover:border-premium-dark transition-colors text-sm font-medium ${selectedSize === size ? 'border-premium-dark bg-premium-dark text-white' : 'border-gray-300 text-gray-700'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleModalAdd} className="w-full py-4 text-lg">Add to Cart</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
