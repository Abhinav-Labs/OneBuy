import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import useWishlistStore from '../store/useWishlistStore';
import { Heading, Text } from '../components/ui/Typography';

const WishlistPage = () => {
  const { wishlistItems } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Heading level={1} className="text-4xl font-bold mb-4">
          My Wishlist
        </Heading>
        <Text variant="body" className="text-premium-dark/50">
          Your curated collection of favorite pieces.
        </Text>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heading level={3} className="text-2xl text-premium-dark/40 mb-6">
            Your wishlist is currently empty.
          </Heading>
          <Link 
            to="/" 
            className="bg-premium-dark text-white px-8 py-3 rounded-full hover:bg-premium-dark/80 transition-colors inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
