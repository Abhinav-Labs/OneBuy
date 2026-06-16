import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Clock, ShieldAlert, ArrowLeft, Search, Eye, CheckCircle2, Truck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useCurrencyStore from '../store/useCurrencyStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const API_BASE = '/api';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid, delivered, pending
  const [dateFilter, setDateFilter] = useState('all'); // all, 1day, 1week, 1month, q1, q2, q3, q4, 1year

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Active chart data point index for tooltip
  const [activeDataIndex, setActiveDataIndex] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch sales data.');
      }
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error loading dashboard. Ensure you are an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [user, token]);

  // Actions
  const handleMarkAsPaid = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      alert('Could not update order status.');
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      alert('Could not update order status.');
    }
  };

  // Auth gate check
  if (!user || !user.isAdmin) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-premium-light flex items-center justify-center">
        <div 
          
          
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-premium-dark mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            You do not have administrative privileges to view the sales dashboard. Please sign in with an administrator account.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline" className="flex-1">Back Home</Button>
            <Button onClick={() => navigate('/login')} className="flex-1">Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-premium-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-premium-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-premium-dark font-medium">Loading sales statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-premium-light flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <p className="text-red-500 font-semibold mb-4">Error: {error}</p>
          <Button onClick={fetchOrders}>Retry</Button>
        </div>
      </div>
    );
  }

  // ── Date Filtering Logic ────────────────────────────────────────────────────
  const now = new Date();
  const currentYear = now.getFullYear();

  const timeFilteredOrders = orders.filter(order => {
    if (dateFilter === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const diffTime = now - orderDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (dateFilter === '1day') return diffDays <= 1;
    if (dateFilter === '1week') return diffDays <= 7;
    if (dateFilter === '1month') return diffDays <= 30;
    if (dateFilter === '6months') return diffDays <= 180;
    if (dateFilter === '1year') return diffDays <= 365;
    
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth();
    
    if (dateFilter === 'q1') return orderYear === currentYear && orderMonth>= 0 && orderMonth <= 2;
    if (dateFilter === 'q2') return orderYear === currentYear && orderMonth>= 3 && orderMonth <= 5;
    if (dateFilter === 'q3') return orderYear === currentYear && orderMonth>= 6 && orderMonth <= 8;
    if (dateFilter === 'q4') return orderYear === currentYear && orderMonth>= 9 && orderMonth <= 11;

    return true;
  });

  // ── Calculate Dashboard Statistics ──────────────────────────────────────────
  const totalRevenue = timeFilteredOrders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
  const totalOrders = timeFilteredOrders.length;
  const averageOrderValue = totalOrders> 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = timeFilteredOrders.filter(o => !o.isDelivered).length;

  // ── Calculate Chart Data ───────────────────────────────────────────────────
  let startDate = new Date();
  let endDate = new Date();
  
  if (dateFilter === '1day') { startDate.setDate(now.getDate() - 1); }
  else if (dateFilter === '1week') { startDate.setDate(now.getDate() - 7); }
  else if (dateFilter === '1month') { startDate.setDate(now.getDate() - 30); }
  else if (dateFilter === '6months') { startDate.setDate(now.getDate() - 180); }
  else if (dateFilter === '1year') { startDate.setDate(now.getDate() - 365); }
  else if (dateFilter === 'q1') { startDate = new Date(currentYear, 0, 1); endDate = new Date(currentYear, 2, 31); }
  else if (dateFilter === 'q2') { startDate = new Date(currentYear, 3, 1); endDate = new Date(currentYear, 5, 30); }
  else if (dateFilter === 'q3') { startDate = new Date(currentYear, 6, 1); endDate = new Date(currentYear, 8, 30); }
  else if (dateFilter === 'q4') { startDate = new Date(currentYear, 9, 1); endDate = new Date(currentYear, 11, 31); }
  else {
     startDate.setDate(now.getDate() - 30); // Default 'all' view to 30 days for chart readability
  }
  
  if (endDate> now) endDate = new Date(now);

  const diffMs = endDate - startDate;
  const chartDays = Math.max(2, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const salesHistory = [];
  for (let i = 0; i < chartDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    if (d> endDate) break;
    
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayOrders = timeFilteredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return o.isPaid && 
             orderDate.getDate() === d.getDate() && 
             orderDate.getMonth() === d.getMonth() && 
             orderDate.getFullYear() === d.getFullYear();
    });
    
    const daySales = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    salesHistory.push({
      date: dateStr,
      sales: daySales,
      count: dayOrders.length,
    });
  }

  // Find max sales to scale Y-axis
  const maxSales = Math.max(...salesHistory.map(h => h.sales), 100);

  // SVG coordinates calculations
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;
  
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = salesHistory.map((day, idx) => {
    const divider = Math.max(1, salesHistory.length - 1);
    const x = paddingX + (idx / divider) * chartWidth;
    // Invert Y axis (SVG 0 is at top)
    const y = paddingY + chartHeight - (day.sales / maxSales) * chartHeight;
    return { x, y, ...day };
  });

  // SVG Path strings
  const pathD = points.reduce((path, p, idx) => {
    return path + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaD = points.length> 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`
    : '';

  // ── Category Sales Distribution ─────────────────────────────────────────────
  const categorySales = {};
  timeFilteredOrders.forEach(o => {
    if (o.isPaid) {
      o.orderItems.forEach(item => {
        // Find category from product or name match if category not stored on item (it is checked on seed)
        const cat = item.name.includes('Sweater') || item.name.includes('Knit') ? 'Knitwear' :
                    item.name.includes('Tee') || item.name.includes('T-Shirt') ? 'T-Shirts' :
                    item.name.includes('Pants') || item.name.includes('Jeans') ? 'Pants/Lounge' :
                    item.name.includes('Jacket') || item.name.includes('Coat') || item.name.includes('Zip') ? 'Outerwear' : 'Accessories';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.qty);
      });
    }
  });

  const categoryArray = Object.keys(categorySales).map(cat => ({
    name: cat,
    value: categorySales[cat],
  })).sort((a, b) => b.value - a.value);

  const totalCatSales = categoryArray.reduce((sum, c) => sum + c.value, 0);

  // ── Filters & Search ────────────────────────────────────────────────────────
  const filteredOrders = timeFilteredOrders.filter(order => {
    // Search
    const searchString = `${order._id} ${order.firstName} ${order.lastName} ${order.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Status Filter
    let matchesStatus = true;
    if (statusFilter === 'paid') matchesStatus = order.isPaid;
    if (statusFilter === 'unpaid') matchesStatus = !order.isPaid;
    if (statusFilter === 'delivered') matchesStatus = order.isDelivered;
    if (statusFilter === 'pending') matchesStatus = !order.isDelivered;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-24 pb-16 bg-premium-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-premium-accent mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Internal Operations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-premium-dark">Sales & Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-premium-dark cursor-pointer shadow-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="1day">Last 24 Hours</option>
              <option value="1week">Last 7 Days</option>
              <option value="1month">Last 30 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="q1">Q1 (Jan - Mar)</option>
              <option value="q2">Q2 (Apr - Jun)</option>
              <option value="q3">Q3 (Jul - Sep)</option>
              <option value="q4">Q4 (Oct - Dec)</option>
              <option value="1year">Last 365 Days</option>
            </select>
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} /> Return to Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div 
            
            
            
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-premium-dark">{formatPrice(totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>

          <div 
            
            
            
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Sales Orders</p>
              <h3 className="text-2xl font-bold text-premium-dark">{totalOrders}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
              <ShoppingCart size={24} />
            </div>
          </div>

          <div 
            
            
            
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Average Order Value</p>
              <h3 className="text-2xl font-bold text-premium-dark">{formatPrice(averageOrderValue)}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-500 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>

          <div 
            
            
            
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Pending Delivery</p>
              <h3 className="text-2xl font-bold text-premium-dark">{pendingOrders}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Main Sales Trend SVG Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-premium-dark mb-1">Revenue Trend</h3>
              <p className="text-sm text-gray-500 mb-6">Daily sales volume recorded over the past 30 days</p>
            </div>
            
            {/* SVG Chart Body */}
            <div className="relative w-full h-[220px]">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingY + ratio * chartHeight;
                  return (
                    <line 
                      key={i} 
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      stroke="#f3f4f6" 
                      strokeWidth="1.5" 
                    />
                  );
                })}

                {/* Gradient area */}
                {areaD && <path d={areaD} fill="url(#chartGradient)" />}

                {/* Smooth line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Data Points / Interaction Nodes */}
                {points.map((p, idx) => (
                  <circle 
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={activeDataIndex === idx ? 6 : 4}
                    fill={activeDataIndex === idx ? '#4f46e5' : '#818cf8'}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setActiveDataIndex(idx)}
                    onMouseLeave={() => setActiveDataIndex(null)}
                  />
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {activeDataIndex !== null && points[activeDataIndex] && (
                <div 
                  className="absolute bg-premium-dark text-white p-3 rounded-lg text-xs shadow-xl pointer-events-none border border-premium-neutral/20 z-10"
                  style={{
                    left: `${(points[activeDataIndex].x / svgWidth) * 100}%`,
                    top: `${(points[activeDataIndex].y / svgHeight) * 100 - 30}%`,
                    transform: 'translate(-50%, -100%)',
                  }}>
                  <p className="font-bold border-b border-white/20 pb-1 mb-1">{points[activeDataIndex].date}</p>
                  <p className="font-semibold text-indigo-200">Revenue: {formatPrice(points[activeDataIndex].sales)}</p>
                  <p className="text-gray-300">Orders: {points[activeDataIndex].count}</p>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-2 px-10 border-t border-gray-100 pt-2">
              <span>{salesHistory[0]?.date}</span>
              <span>{salesHistory[Math.floor(chartDays / 2)]?.date}</span>
              <span>Today</span>
            </div>
          </div>

          {/* Category Share progress card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-premium-dark mb-1">Product Breakdown</h3>
              <p className="text-sm text-gray-500 mb-6">Revenue share by clothing department</p>
            </div>
            
            <div className="space-y-4 flex-grow flex flex-col justify-center">
              {categoryArray.map((cat, idx) => {
                const percent = totalCatSales> 0 ? Math.round((cat.value / totalCatSales) * 100) : 0;
                
                // Color mapping
                const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-premium-dark">{cat.name}</span>
                      <span className="text-gray-500">{formatPrice(cat.value)} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className={`h-full ${colorClass} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}

              {categoryArray.length === 0 && (
                <p className="text-gray-400 text-center py-6 text-sm">No sales category data available.</p>
              )}
            </div>
          </div>

        </div>

        {/* Order Manager Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-premium-dark mb-1">Order Fulfillment Log</h3>
              <p className="text-sm text-gray-500">Search, view, and fulfill active customer purchases</p>
            </div>
            
            {/* Search and Filter Tools */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-premium-dark w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Selector */}
              <select 
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-premium-dark cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending Delivery</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Total Price</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Delivery</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-premium-dark divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-medium text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{order.firstName} {order.lastName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[160px]">{order.email}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-premium-accent">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      {order.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {order.isDelivered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Truck size={12} /> Shipped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-premium-dark hover:bg-gray-100 rounded-lg transition-all"
                        title="View Details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      No matching sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
              {selectedOrder && (
          <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Purchase Record Details">
            <div className="space-y-6">
              
              {/* Order Meta */}
              <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-4 text-sm gap-2">
                <div>
                  <span className="text-gray-500 font-medium">Record ID:</span>{' '}
                  <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 font-semibold">{selectedOrder._id}</span>
                </div>
                <div className="text-gray-500 font-medium">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Grid: Shipping vs Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-premium-dark mb-2 uppercase tracking-wide text-xs">Customer & Shipping</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p className="font-semibold text-premium-dark">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                    <p className="text-xs">{selectedOrder.email}</p>
                    <p className="mt-2">{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-premium-dark mb-2 uppercase tracking-wide text-xs">Operational Statuses</h4>
                  
                  {/* Payment */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Payment Status</p>
                      <p className="text-sm font-semibold">{selectedOrder.isPaid ? 'Paid in Full' : 'Awaiting Payment'}</p>
                    </div>
                    {!selectedOrder.isPaid ? (
                      <Button size="sm" onClick={() => handleMarkAsPaid(selectedOrder._id)}>Mark Paid</Button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Paid {new Date(selectedOrder.paidAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Fulfillment Status</p>
                      <p className="text-sm font-semibold">{selectedOrder.isDelivered ? 'Dispatched / Shipped' : 'Processing Package'}</p>
                    </div>
                    {!selectedOrder.isDelivered ? (
                      <Button size="sm" onClick={() => handleMarkAsDelivered(selectedOrder._id)} disabled={!selectedOrder.isPaid}>Ship Order</Button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Shipped {new Date(selectedOrder.deliveredAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Purchased */}
              <div>
                <h4 className="font-bold text-premium-dark mb-3 uppercase tracking-wide text-xs border-b border-gray-100 pb-2">Line Items</h4>
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                      <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-premium-dark truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.color} / {item.size} × {item.qty}</p>
                      </div>
                      <div className="text-sm font-semibold text-premium-dark">
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-gray-100 pt-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Items Subtotal</span>
                  <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping Cost</span>
                  <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-premium-dark font-bold text-base pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span>{formatPrice(selectedOrder.totalPrice)}</span>
                </div>
              </div>

            </div>
          </Modal>
        )}
          </div>
  );
};

export default AdminPage;
