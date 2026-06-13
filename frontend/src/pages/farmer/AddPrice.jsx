import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllProducts } from '../../api/products';
import { addPrice } from '../../api/farmer';
import toast from 'react-hot-toast';
import { BIHAR_DISTRICTS } from '../../data/locations';
import { TrendingUp, MapPin, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AddPrice() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Pre-fill location from localStorage (saves farmer retyping every time) */
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('farmerLastLocation') || '{}');
      return {
        productId:         '',
        pricePerUnit:      '',
        quantityAvailable: '',
        location:          saved.location  || '',
        district:          saved.district  || '',
      };
    } catch {
      return { productId: '', pricePerUnit: '', quantityAvailable: '', location: '', district: '' };
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    getAllProducts()
      .then(res => setProducts(res.data.data || []))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  /* Live potential earnings */
  const price    = parseFloat(form.pricePerUnit)      || 0;
  const qty      = parseFloat(form.quantityAvailable) || 0;
  const earnings = price > 0 && qty > 0 ? (price * qty).toFixed(2) : null;

  const selectedProduct = products.find(p => p.id === parseInt(form.productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (price <= 0)  { toast.error('Price must be greater than 0');    return; }
    if (qty   <= 0)  { toast.error('Quantity must be greater than 0'); return; }

    setLoading(true);
    try {
      /* Save location for next time */
      localStorage.setItem('farmerLastLocation', JSON.stringify({
        location: form.location,
        district: form.district,
      }));

      await addPrice({
        productId:         parseInt(form.productId),
        pricePerUnit:      price,
        quantityAvailable: qty,
        location:          form.location,
        district:          form.district,
      });

      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add price';
      // Show duplicate error with longer duration and prominent styling
      if (msg.includes('already have a')) {
        toast.error(msg, { duration: 8000, style: { maxWidth: '500px' } });
      } else {
        toast.error(msg);
      }
      // If duplicate listing, take farmer directly to their listings to edit
      if (msg.includes('already have a')) {
        setTimeout(() => navigate('/farmer/prices'), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Posted!</h2>
        <p className="text-sage-500 text-sm mb-8">
          Your price listing is now live and visible to buyers.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => {
              setSubmitted(false);
              setForm(f => ({ ...f, productId: '', pricePerUnit: '', quantityAvailable: '' }));
            }}
            className="btn-primary flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" /> Add Another Listing
          </button>
          <Link to="/farmer/prices" className="btn-ghost flex items-center gap-2">
            View My Listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Price Listing</h1>
        <p className="text-sage-500 text-sm mt-1">Post your makhana price — buyers across India will see it instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Product */}
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary-600" /> Product Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Product <span className="text-red-400">*</span></label>
              <select required value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}
                className="input-field">
                <option value="">Select your makhana grade</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Price per {selectedProduct?.unit || 'unit'} (₹) <span className="text-red-400">*</span>
                </label>
                <input type="number" step="0.01" min="0.01" required value={form.pricePerUnit}
                  onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                  className="input-field" placeholder="e.g. 650" />
                {price > 0 && price < 100 && (
                  <p className="text-xs text-amber-600 mt-1">Price seems low — double check</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Quantity Available <span className="text-red-400">*</span>
                </label>
                <input type="number" step="0.01" min="0.01" required value={form.quantityAvailable}
                  onChange={e => setForm({ ...form, quantityAvailable: e.target.value })}
                  className="input-field" placeholder="e.g. 500" />
                {selectedProduct && <p className="text-xs text-sage-400 mt-1">in {selectedProduct.unit}</p>}
              </div>
            </div>

            {/* Live earnings preview */}
            {earnings && (
              <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-primary-800">Potential Earnings</p>
                  <p className="text-xs text-primary-500 mt-0.5">
                    {qty} {selectedProduct?.unit || 'units'} × ₹{price}
                  </p>
                </div>
                <p className="text-xl font-bold text-primary-700">₹{earnings}</p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-600" /> Location
            <span className="text-xs font-normal text-sage-400 ml-1">(Saved from last time)</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Village / Town</label>
              <input type="text" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Kusheshwar Asthan"
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">District</label>
              <select value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                className="input-field">
                <option value="">Select District</option>
                {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 text-base justify-center shadow-soft-md shadow-primary-200/40">
          {loading ? 'Posting...' : 'Post Price Listing'}
        </button>

        <p className="text-center text-xs text-sage-400">
          Your listing will be visible to all buyers immediately after posting.
        </p>
      </form>
    </div>
  );
}
