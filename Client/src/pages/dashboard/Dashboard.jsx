import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Gem, DollarSign, ShoppingCart } from 'lucide-react';
import api from '../../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    goldStock: 0,
    silverStock: 0,
    diamondStock: 0,
    lowStockProducts: [],
    lowStockCount: 0
  });
  const [todaySales, setTodaySales] = useState({ totalSales: 0, billCount: 0 });
  const [rates, setRates] = useState({ goldRate: 0, silverRate: 0, diamondRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes, ratesRes] = await Promise.all([
          api.get('/products/stats'),
          api.get('/bills/today-sales'),
          api.get('/rates/today')
        ]);
        setStats(statsRes.data);
        setTodaySales(salesRes.data);
        setRates(ratesRes.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return 'bg-red-100 text-red-800 border-red-200';
    if (stock <= minStock) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(todaySales.totalSales)}</p>
              <p className="text-xs text-gray-400 mt-1">{todaySales.billCount} bills</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium">Gold Rate</p>
              <p className="text-3xl font-bold text-amber-800 mt-1">{formatCurrency(rates.goldRate)}</p>
              <p className="text-xs text-amber-600 mt-1">per gram • Coimbatore</p>
            </div>
            <div className="bg-amber-200 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-amber-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Silver Rate</p>
              <p className="text-3xl font-bold text-gray-700 mt-1">{formatCurrency(rates.silverRate)}</p>
              <p className="text-xs text-gray-500 mt-1">per gram</p>
            </div>
            <div className="bg-gray-200 p-3 rounded-full">
              <Gem className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Gold Stock</p>
              <p className="text-4xl font-bold mt-1">{stats.goldStock}</p>
              <p className="text-amber-100 text-sm mt-2">items in inventory</p>
            </div>
            <Gem className="w-12 h-12 text-amber-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm font-medium">Silver Stock</p>
              <p className="text-4xl font-bold mt-1">{stats.silverStock}</p>
              <p className="text-gray-200 text-sm mt-2">items in inventory</p>
            </div>
            <Gem className="w-12 h-12 text-gray-300 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Diamond Stock</p>
              <p className="text-4xl font-bold mt-1">{stats.diamondStock}</p>
              <p className="text-cyan-100 text-sm mt-2">items in inventory</p>
            </div>
            <Gem className="w-12 h-12 text-cyan-200 opacity-50" />
          </div>
        </div>
      </div>

      {stats.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-pulse-slow">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{stats.lowStockCount} items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product._id}
                className={`p-3 rounded-lg border ${getStockStatus(product.stock, product.minStock)}`}
              >
                <p className="font-medium">{product.name}</p>
                <p className="text-sm">
                  Stock: <span className="font-bold">{product.stock}</span> / Min: {product.minStock}
                </p>
                <span className="text-xs px-2 py-0.5 rounded bg-white/50">{product.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/billing" className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">New Bill</span>
            </a>
            <a href="/products/add" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Add Product</span>
            </a>
            <a href="/rates" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Update Rates</span>
            </a>
            <a href="/products" className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Gem className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">View Stock</span>
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Rate Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-800 font-medium">Gold (24K)</span>
              <span className="text-amber-900 font-bold">{formatCurrency(rates.goldRate)}/g</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Silver</span>
              <span className="text-gray-800 font-bold">{formatCurrency(rates.silverRate)}/g</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <span className="text-cyan-700 font-medium">Diamond</span>
              <span className="text-cyan-800 font-bold">{formatCurrency(rates.diamondRate)}/ct</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">GST</span>
              <span className="text-green-800 font-bold">{rates.gst || 3}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
