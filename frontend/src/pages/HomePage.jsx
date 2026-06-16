import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedReviews from '../components/home/FeaturedReviews';
import ProductGrid from '../components/home/ProductGrid';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-premium-light animate-fade-in">
      <HeroSection />
      <ProductGrid />
      <FeaturedReviews />
    </div>
  );
};

export default HomePage;
