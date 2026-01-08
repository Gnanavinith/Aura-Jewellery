import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, User, Phone, CreditCard, Banknote, MessageSquare, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [rates, setRates] = useState({ goldRate: 0, silverRate: 0, diamondRate: 0, gst: 3, defaultWastage: 8 });
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [successBill, setSuccessBill] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ratesRes] = await Promise.all([
        api.get('/products'),
        api.get('/rates/today')
      ]);
      setProducts(productsRes.data.filter(p => p.stock > 0));
      setRates(ratesRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRate = (product) => {
    if (product.customRate) return product.customRate;
    if (product.category === 'Gold') return rates.goldRate;
    if (product.category === 'Silver') return rates.silverRate;
    return rates.diamondRate;
  };

  const calculateItemPrice = (product, quantity = 1) => {
    const rate = getRate(product);
    const metalPrice = product.weight * rate * quantity;
    const wastageAmount = metalPrice * (product.wastage / 100);
    const subtotal = metalPrice + wastageAmount + (product.makingCharge * quantity);
    const gstAmount = subtotal * (product.gst / 100);
    const total = subtotal + gstAmount;
    
    return {
      rate,
      metalPrice: Math.round(metalPrice * 100) / 100,
      wastageAmount: Math.round(wastageAmount * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const totals = useMemo(() => {
    let totalMetalPrice = 0;
    let totalWastage = 0;
    let totalMakingCharge = 0;
    let totalGst = 0;
    let grandTotal = 0;

    cart.forEach(item => {
      const calc = calculateItemPrice(item.product, item.quantity);
      totalMetalPrice += calc.metalPrice;
      totalWastage += calc.wastageAmount;
      totalMakingCharge += item.product.makingCharge * item.quantity;
      totalGst += calc.gstAmount;
      grandTotal += calc.total;
    });

    return {
      totalMetalPrice: Math.round(totalMetalPrice * 100) / 100,
      totalWastage: Math.round(totalWastage * 100) / 100,
      totalMakingCharge: Math.round(totalMakingCharge * 100) / 100,
      subtotal: Math.round((totalMetalPrice + totalWastage + totalMakingCharge) * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100,
      grandTotal: Math.round((grandTotal - discount) * 100) / 100
    };
  }, [cart, discount]);

  const handleSubmit = async (type = 'Bill') => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await api.post('/bills', {
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        discount,
        paymentMethod,
        paymentStatus: type === 'Estimate' ? 'Pending' : 'Paid',
        type
      });
      
        const newBill = res.data;
        setSuccessBill(newBill);
        setCart([]);
        setCustomer({ name: '', phone: '' });
        setDiscount(0);
        fetchData();
        toast.success(`${type} generated successfully!`);
      } catch (error) {
        toast.error(error.response?.data?.message || `Failed to create ${type}`);
      } finally {
        setSubmitting(false);
      }
    };

  const shareOnWhatsApp = (billData) => {
    const bill = billData || successBill;
    if (!bill) {
      toast.error("No bill data available to share");
      return;
    }

    try {
      const message = `*AURA JEWELLERY*\n` +
        `--------------------------\n` +
        `*${(bill.type || 'Bill').toUpperCase()} INVOICE*\n` +
        `No: ${bill.billNumber}\n` +
        `Date: ${new Date(bill.createdAt).toLocaleDateString('en-GB')}\n` +
        `Metal: ${bill.metalType ? bill.metalType.charAt(0) + bill.metalType.slice(1).toLowerCase() : 'N/A'}\n` +
        `--------------------------\n` +
        `*Customer:* ${bill.customerName}\n` +
        `${bill.customerPhone ? `*Phone:* ${bill.customerPhone}\n` : ''}` +
        `--------------------------\n` +
        `*Items:*\n` +
        bill.items.map(item => 
          `- ${item.name} (${item.quantity} x ${formatCurrency(item.total)})`
        ).join('\n') +
        `\n--------------------------\n` +
        `*Subtotal:* ${formatCurrency(bill.subtotal)}\n` +
        `*GST:* ${formatCurrency(bill.totalGst)}\n` +
        `*Discount:* ${formatCurrency(bill.discount)}\n` +
        `*Grand Total: ${formatCurrency(bill.grandTotal)}*\n` +
        `--------------------------\n` +
        `*Payment:* ${bill.paymentMethod} (${bill.paymentStatus})\n` +
        `--------------------------\n` +
        `Thank you for shopping with Aura Jewellery`;

      const encodedMessage = encodeURIComponent(message);
      let phoneNumber = bill.customerPhone ? bill.customerPhone.replace(/[^0-9]/g, '') : '';
      
      if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error("WhatsApp sharing error:", err);
      toast.error("Failed to generate WhatsApp link");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
    );

    const handleBarcodeSubmit = (e) => {
      e.preventDefault();
      if (!barcodeSearch) return;

        const product = products.find(p => p.barcode === barcodeSearch);
        if (product) {
          addToCart(product);
          setBarcodeSearch('');
          toast.success(`Added ${product.name} to cart`);
        } else {
          toast.error('Product not found for this barcode');
        }
      };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Diamond': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (successBill) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${successBill.type === 'Estimate' ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Receipt className={`w-8 h-8 ${successBill.type === 'Estimate' ? 'text-amber-600' : 'text-green-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {successBill.type} Created Successfully!
            </h2>
            <p className="text-gray-500 mt-1">No: {successBill.billNumber}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Invoice No:</span>
              <span className="font-bold text-gray-800">{successBill.billNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(successBill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Metal:</span>
              <span className="font-medium text-amber-600 uppercase">{successBill.metalType}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{successBill.customerName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium">{successBill.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-6">{formatCurrency(successBill.grandTotal)}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => shareOnWhatsApp(successBill)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-all font-semibold"
                >
                <MessageSquare className="w-5 h-5" />
                Share on WhatsApp
              </button>
              
              <button
                onClick={() => setSuccessBill(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                Create New Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Billing</h2>
          <div className="text-sm text-gray-500">
            Gold: {formatCurrency(rates.goldRate)}/g | Silver: {formatCurrency(rates.silverRate)}/g
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleBarcodeSubmit} className="flex-1">
            <input
              type="text"
              placeholder="Scan Barcode..."
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50"
              autoFocus
            />
          </form>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {filteredProducts.map((product) => {
            const calc = calculateItemPrice(product);
            const inCart = cart.find(item => item.product._id === product._id);
            return (
              <div
                key={product._id}
                className={`bg-white p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${inCart ? 'border-amber-400 shadow-md' : 'border-gray-100'}`}
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span>{product.weight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{formatCurrency(calc.rate)}/g</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-amber-600">{formatCurrency(calc.total)}</span>
                  {inCart && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {inCart.quantity} in cart
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:w-96 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length} items)
          </h3>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items in cart</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => {
                const calc = calculateItemPrice(item.product, item.quantity);
                return (
                  <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(calc.total)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, -1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Details
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="tel"
              placeholder="Phone Number (WhatsApp)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Cash', 'Card', 'UPI', 'Bank Transfer'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${paymentMethod === method ? 'bg-amber-100 text-amber-800 border-2 border-amber-400' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
          <h3 className="font-semibold text-gray-800 mb-3">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Metal Price:</span>
              <span>{formatCurrency(totals.totalMetalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wastage:</span>
              <span>{formatCurrency(totals.totalWastage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Making Charge:</span>
              <span>{formatCurrency(totals.totalMakingCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST ({rates.gst}%):</span>
              <span>{formatCurrency(totals.totalGst)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount:</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-amber-200 rounded text-right text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between border-t-2 border-amber-300 pt-3 mt-3">
              <span className="text-lg font-bold">Grand Total:</span>
              <span className="text-2xl font-bold text-amber-700">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSubmit('Bill')}
            disabled={cart.length === 0 || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                Generate Bill
              </>
            )}
          </button>

          <button
            onClick={() => handleSubmit('Estimate')}
            disabled={cart.length === 0 || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-amber-600 border-2 border-amber-500 rounded-xl font-semibold hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Save as Estimate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
