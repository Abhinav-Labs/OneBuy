import React from 'react';
import Button from '../ui/Button';

const HeroSection = () => {
  return (
    <div className="relative h-[90vh] bg-premium-light overflow-hidden flex items-center justify-center pt-16">
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero_cotton_tee.png" 
          alt="Premium Cotton Tee" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-premium-light via-premium-light/80 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div 
          
          
          
          className="max-w-2xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-premium-dark tracking-tight mb-6">
            Redefining <br/> <span className="text-premium-accent">Comfort</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
            Discover our new collection of premium, heavyweight cotton essentials designed for everyday luxury.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="shadow-xl" onClick={() => window.location.href = '/collections'}>
              Shop the Collection
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('hero-products')?.scrollIntoView({ behavior: 'smooth' })}>
              Hero Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
