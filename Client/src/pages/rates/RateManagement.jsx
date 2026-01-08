import { useState, useEffect } from 'react';
import { Save, RefreshCw, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const RateManagement = () => {
  const [rates, setRates] = useState({
    goldRate: '',
    silverRate: '',
    diamondRate: '',
    gst: '',
    defaultWastage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await api.get('/rates/today');
      setRates({
        goldRate: res.data.goldRate || '',
        silverRate: res.data.silverRate || '',
        diamondRate: res.data.diamondRate || '',
        gst: res.data.gst || 3,
        defaultWastage: res.data.defaultWastage || 8
      });
      setLastUpdated(res.data.updatedAt || res.data.effectiveDate);
    } catch (error) {
      if (error.response?.status === 404) {
        setRates({ goldRate: '', silverRate: '', diamondRate: '', gst: 3, defaultWastage: 8 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

      try {
        await api.post('/rates', {
          goldRate: parseFloat(rates.goldRate),
          silverRate: parseFloat(rates.silverRate),
          diamondRate: parseFloat(rates.diamondRate),
          gst: parseFloat(rates.gst),
          defaultWastage: parseFloat(rates.defaultWastage)
        });
        toast.success('Rates updated successfully!');
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update rates';
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rate Management</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Coimbatore Gold Rate – Manual Update</span>
          </div>
        </div>
        <button
          onClick={fetchRates}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {formatDate(lastUpdated)}</span>
        </div>
      )}

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Metal Rates (per gram/carat)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gold Rate (per gram)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={rates.goldRate}
                  onChange={(e) => setRates({ ...rates, goldRate: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
                  placeholder="6200"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">24K Gold Rate</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Silver Rate (per gram)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={rates.silverRate}
                  onChange={(e) => setRates({ ...rates, silverRate: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-50"
                  placeholder="75"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Pure Silver Rate</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diamond Rate (per carat)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={rates.diamondRate}
                  onChange={(e) => setRates({ ...rates, diamondRate: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-cyan-50"
                  placeholder="50000"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Per Carat Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax & Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={rates.gst}
                  onChange={(e) => setRates({ ...rates, gst: e.target.value })}
                  className="w-full pr-8 pl-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                  placeholder="3"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Standard GST for jewellery is 3%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Wastage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={rates.defaultWastage}
                  onChange={(e) => setRates({ ...rates, defaultWastage: e.target.value })}
                  className="w-full pr-8 pl-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                  placeholder="8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Standard wastage is 8-12%</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <h4 className="font-medium text-amber-800 mb-2">Rate Application Note</h4>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>These rates will be used automatically in billing & product price estimation</li>
            <li>Update rates daily for accurate billing</li>
            <li>Products can have custom rates that override these defaults</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Update Rates
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RateManagement;
