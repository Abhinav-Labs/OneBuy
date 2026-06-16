import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import Button from '../ui/Button';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isDrawerOpen, closeDrawer, cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <>
      {isDrawerOpen && (
        <>
          <div
            
            
            
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div
            
            
            
            
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-premium-dark flex items-center gap-2">
                <ShoppingBag size={24} />
                Your Cart
              </h2>
              <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-premium-dark">Your cart is empty</h3>
                  <p className="text-gray-500">Looks like you haven't added any items yet.</p>
                  <Button onClick={closeDrawer} className="mt-4">Continue Shopping</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                      <img src={item.images?.[0] || item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-premium-dark line-clamp-1">{item.name}</h4>
                            <button onClick={() => removeFromCart(item._id, item.size, item.color)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{item.color} | Size: {item.size}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="font-medium text-premium-dark">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-md border border-gray-200">
                            <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)} className="text-gray-500 hover:text-premium-dark"><Minus size={14} /></button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)} className="text-gray-500 hover:text-premium-dark"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length> 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold text-premium-dark">{formatPrice(getCartTotal())}</span>
                </div>
                <Button className="w-full py-4 text-lg" onClick={handleCheckout}>
                  Checkout Now
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CartDrawer;
