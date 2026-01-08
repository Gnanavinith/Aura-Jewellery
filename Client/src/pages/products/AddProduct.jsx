import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AddProduct = () => {
    const [product, setProduct] = useState({
      name: '',
      barcode: '',
      category: '',
      weight: '',
      makingCharge: '',
      wastage: '8',
      stock: '',
      minStock: '5',
      gst: '3',
      customRate: ''
    });
  const [rates, setRates] = useState({ goldRate: 0, silverRate: 0, diamondRate: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await api.get('/rates/today');
      setRates(res.data);
    } catch (error) {
      console.error('Fetch rates error:', error);
    }
  };

  const getCurrentRate = () => {
    if (!product.category) return 0;
    if (product.category === 'Gold') return rates.goldRate;
    if (product.category === 'Silver') return rates.silverRate;
    return rates.diamondRate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

      try {
        await api.post('/products', {
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          weight: parseFloat(product.weight),
          makingCharge: parseFloat(product.makingCharge) || 0,
          wastage: parseFloat(product.wastage) || 8,
          stock: parseInt(product.stock) || 0,
          minStock: parseInt(product.minStock) || 5,
          gst: parseFloat(product.gst) || 3,
          customRate: product.customRate ? parseFloat(product.customRate) : null
        });
        toast.success('Product added successfully!');
        navigate('/products');
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to add product';
        setError(msg);
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                <input
                  type="text"
                  value={product.barcode}
                  onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Scan or enter barcode"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., Gold Necklace 22K"
                  required
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="">Select Category</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight ({product.category === 'Diamond' ? 'carats' : 'grams'})
              </label>
              <input
                type="number"
                step="0.01"
                value={product.weight}
                onChange={(e) => setProduct({ ...product, weight: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 10"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Making Charge (₹)</label>
              <input
                type="number"
                value={product.makingCharge}
                onChange={(e) => setProduct({ ...product, makingCharge: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wastage (%)</label>
              <input
                type="number"
                step="0.1"
                value={product.wastage}
                onChange={(e) => setProduct({ ...product, wastage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 8"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 8%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST (%)</label>
              <input
                type="number"
                step="0.1"
                value={product.gst}
                onChange={(e) => setProduct({ ...product, gst: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 3%</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Rate (₹ per {product.category === 'Diamond' ? 'carat' : 'gram'}) - Optional
            </label>
            <div className="relative">
              <input
                type="number"
                value={product.customRate}
                onChange={(e) => setProduct({ ...product, customRate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder={`Leave empty to use today's rate: ₹${getCurrentRate()}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current {product.category || 'Metal'} Rate: ₹{getCurrentRate()} per {product.category === 'Diamond' ? 'carat' : 'gram'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
              <input
                type="number"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock Alert</label>
              <input
                type="number"
                value={product.minStock}
                onChange={(e) => setProduct({ ...product, minStock: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., 5"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
