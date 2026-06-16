import React, { useEffect, useState } from 'react';
import ProductCard from '../product/ProductCard';
import ScrollReveal from '../ui/ScrollReveal';
import fallbackProducts from '../../data/fallbackProducts';

const ProductGrid = ({ showOnlyHero = true, title = "Hero Products" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API down');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="py-20 text-center">Loading collection...</div>;

  let displayedProducts = Array.isArray(products) ? products : fallbackProducts;
  
  if (showOnlyHero) {
    displayedProducts = displayedProducts.filter(p => p.isHero).slice(0, 3);
  }

  return (
    <section id="hero-products" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-premium-dark mb-4 tracking-tight">{title}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Curated essentials to elevate your everyday wardrobe.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {displayedProducts.map((product, idx) => (
            <ScrollReveal key={product._id} delay={idx * 100}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
