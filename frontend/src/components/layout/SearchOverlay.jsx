import React, { useState, useEffect, useRef } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import fallbackProducts from '../../data/fallbackProducts';
import useCurrencyStore from '../../store/useCurrencyStore';

const fuzzySearch = (pattern, str) => {
  const patternStr = pattern.toLowerCase().replace(/[^a-z0-9]/g, '').split('').join('.*');
  const re = new RegExp(patternStr);
  return re.test(str.toLowerCase());
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 150);

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
        }
      };
      fetchProducts();
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const safeProducts = Array.isArray(products) ? products : fallbackProducts;
    const filtered = safeProducts.filter(p =>
      fuzzySearch(searchQuery, p.name) ||
      fuzzySearch(searchQuery, p.category) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  }, [searchQuery, products]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-center pt-[20vh]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-5 border-b border-premium-neutral">
          <SearchIcon className="text-premium-dark/40 flex-shrink-0" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="w-full text-lg text-premium-dark bg-transparent border-none focus:outline-none focus:ring-0 placeholder-premium-dark/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-2 text-premium-dark/40 hover:text-premium-dark hover:bg-premium-neutral rounded-full transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {searchQuery.trim() && results.length === 0 && (
            <div className="text-center py-16 text-premium-dark/40">
              No results found for "{searchQuery}".
            </div>
          )}

          {results.length> 0 && (
            <div className="p-5 space-y-2">
              {results.map((product) => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-premium-light transition-colors group">
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-premium-neutral flex-shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-premium-dark group-hover:text-premium-accent transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-premium-dark/40">{product.category}</p>
                  </div>
                  <span className="font-medium text-premium-dark flex-shrink-0">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;