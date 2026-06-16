import React from 'react';
import ProductGrid from '../components/home/ProductGrid';

const CollectionsPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-premium-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-sm text-gray-500">
        <span className="hover:text-premium-dark cursor-pointer" onClick={() => window.history.back()}>Home</span>
        <span className="mx-2">/</span>
        <span className="text-premium-dark font-medium">Collections</span>
      </div>
      <ProductGrid showOnlyHero={false} title="All Collections" />
    </div>
  );
};

export default CollectionsPage;
