import React from 'react';
import { ShoppingBag, User, Search, Menu, Heart, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import useWishlistStore from '../../store/useWishlistStore';

const Navbar = ({ onOpenSearch }) => {
  const { getCartCount, openDrawer } = useCartStore();
  const { user, logout } = useAuthStore();
  const { wishlistItems } = useWishlistStore();
  
  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;
  
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <nav className="fixed w-full top-0 z-40 bg-premium-neutral/80 backdrop-blur-md border-b border-premium-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button className="p-2 -ml-2 mr-2 md:hidden">
              <Menu size={24} className="text-premium-dark" />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tighter text-premium-dark">
              OneBuy
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`${location.pathname === '/' ? 'text-premium-dark' : 'text-gray-500'} hover:text-premium-accent font-medium transition-colors`}>Shop</Link>
            <Link to="/collections" className={`${location.pathname === '/collections' ? 'text-premium-dark' : 'text-gray-500'} hover:text-premium-accent font-medium transition-colors`}>Collections</Link>
            <Link to="/about" className={`${location.pathname === '/about' ? 'text-premium-dark' : 'text-gray-500'} hover:text-premium-accent font-medium transition-colors`}>About</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              className="bg-transparent text-premium-dark text-sm font-medium focus:outline-none cursor-pointer hidden sm:block outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
            <button onClick={onOpenSearch} className="p-2 text-premium-dark hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <button onClick={() => navigate('/wishlist')} className="p-2 text-premium-dark hover:bg-gray-100 rounded-full transition-colors relative">
              <Heart size={20} />
              {wishlistCount> 0 && (
                <span 
                  key={wishlistCount}
                  
                  
                  
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User icon / avatar with dropdown */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full bg-premium-accent text-white font-bold flex items-center justify-center text-sm hover:brightness-110 transition-all"
                  title={user.name}>
                  {user.name?.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button onClick={() => navigate('/login')} className="p-2 text-premium-dark hover:bg-gray-100 rounded-full transition-colors">
                  <User size={20} />
                </button>
              )}

              {/* Dropdown */}
              {showUserMenu && user && (
                <div className="absolute right-0 top-12 bg-white border border-premium-neutral rounded-xl shadow-xl w-52 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-premium-neutral">
                    <p className="font-semibold text-premium-dark text-sm truncate">{user.name}</p>
                    <p className="text-premium-dark/50 text-xs truncate">{user.email}</p>
                  </div>
                  {user.isAdmin && (
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/admin'); }}
                      className="w-full text-left px-4 py-3 text-sm text-premium-dark hover:bg-premium-neutral border-b border-premium-neutral transition-colors flex items-center gap-2 font-medium">
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-premium-accent hover:bg-premium-neutral transition-colors">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
            <button onClick={openDrawer} className="p-2 text-premium-dark hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag size={20} />
              {cartCount> 0 && (
                <span 
                  key={cartCount}
                  
                  
                  
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
