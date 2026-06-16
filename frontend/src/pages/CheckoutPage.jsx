import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import useCartStore from '../store/useCartStore';
import useCurrencyStore from '../store/useCurrencyStore';
import useAuthStore from '../store/useAuthStore';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { user, token } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = getCartTotal();
  const shipping = total> 0 ? 15.00 : 0;
  const grandTotal = total + shipping;

  const splitName = user?.name ? user.name.split(' ') : [];
  const defaultFirstName = splitName[0] || '';
  const defaultLastName = splitName.slice(1).join(' ') || '';

  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const formData = new FormData(e.target);
    const orderData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.images?.[0] || item.image,
        price: item.price,
        product: item._id,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: {
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('postalCode'),
      },
      paymentMethod: paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal',
      itemsPrice: total,
      shippingPrice: shipping,
      totalPrice: grandTotal,
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      setIsSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-premium-light flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-premium-dark mb-4">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">Thank you for shopping with OneBuy. Your order has been placed successfully and will be processed shortly.</p>
          <Button onClick={() => navigate('/')} className="w-full">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-premium-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-premium-dark mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Contact Info */}
              <div>
                <h2 className="text-xl font-bold text-premium-dark mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-premium-dark mb-2">Email Address *</label>
                    <input type="email" required name="email" defaultValue={user?.email || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="jane@example.com" />
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h2 className="text-xl font-bold text-premium-dark mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-premium-dark mb-2">First Name *</label>
                    <input type="text" required name="firstName" defaultValue={defaultFirstName} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-premium-dark mb-2">Last Name *</label>
                    <input type="text" required name="lastName" defaultValue={defaultLastName} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="Doe" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-premium-dark mb-2">Address *</label>
                    <input type="text" required name="address" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="123 Main St" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-premium-dark mb-2">City *</label>
                    <input type="text" required name="city" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-premium-dark mb-2">State / Province *</label>
                    <input type="text" required name="state" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-premium-dark mb-2">ZIP / Postal Code *</label>
                    <input type="text" required name="postalCode" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="10001" />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h2 className="text-xl font-bold text-premium-dark mb-4">Payment Details</h2>
                
                <div className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-premium-dark bg-gray-50 ring-1 ring-premium-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="credit_card" 
                          checked={paymentMethod === 'credit_card'} 
                          onChange={() => setPaymentMethod('credit_card')}
                          className="w-4 h-4 text-premium-dark focus:ring-premium-dark"
                        />
                        <span className="font-semibold text-premium-dark">Credit Card</span>
                      </div>
                    </label>
                    
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-premium-dark bg-gray-50 ring-1 ring-premium-dark' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="paypal" 
                          checked={paymentMethod === 'paypal'} 
                          onChange={() => setPaymentMethod('paypal')}
                          className="w-4 h-4 text-premium-dark focus:ring-premium-dark"
                        />
                        <span className="font-semibold text-premium-dark">PayPal</span>
                      </div>
                    </label>
                  </div>

                  {/* Payment Forms */}
                  <div className="mt-6 p-6 border border-gray-100 bg-gray-50 rounded-xl">
                    {paymentMethod === 'credit_card' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-premium-dark mb-2">Card Number *</label>
                          <input type="text" required maxLength="19" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark font-mono" placeholder="XXXX XXXX XXXX XXXX" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-premium-dark mb-2">Name on Card *</label>
                          <input type="text" required className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark" placeholder="JANE DOE" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-premium-dark mb-2">Expiry Date *</label>
                            <input type="text" required maxLength="5" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark font-mono" placeholder="MM/YY" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-premium-dark mb-2">CVC *</label>
                            <input type="text" required maxLength="4" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark font-mono" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-12 h-12 mx-auto text-blue-500 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.434 0-.806.31-.884.739l-1.286 7.266z" fill="#003087"/>
                          <path d="M13.048 10.366c.01-.06.022-.119.034-.178.966-4.962 4.316-6.685 8.583-6.685h.016c.162.775.215 1.637.135 2.607-.565 3.593-3.084 6.305-6.677 7.218a9.49 9.49 0 0 1-2.091.246h-1.39l.29-1.643c.092-.524.549-.908 1.08-.908h.02z" fill="#0079C1"/>
                          <path d="M11.966 12.872c-.092.523-.55.908-1.08.908h-2.19c-.434 0-.806.31-.884.739l-1.286 7.266H2.47a.641.641 0 0 1-.633-.74l.974-5.503c.08-.456.47-.798.932-.798h2.387c3.708 0 6.643-1.488 7.56-5.834l.274-1.55c.42.502.723 1.118.882 1.84.565-3.592-3.084-6.304-6.677-7.218.42.502.723 1.118.882 1.84z" fill="#00457C"/>
                        </svg>
                        <p className="text-gray-600 font-medium">You will be redirected to PayPal to complete your purchase securely.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium mb-3">{error}</p>}
              <Button type="submit" size="lg" className="w-full py-4 text-lg" disabled={isProcessing || cartItems.length === 0}>
                {isProcessing ? 'Processing Order...' : `Pay ${formatPrice(grandTotal)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-premium-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                      <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-medium text-premium-dark text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{item.color} / {item.size}</p>
                      <p className="font-medium text-premium-dark text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Your cart is empty.</p>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-premium-dark font-bold text-lg pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
