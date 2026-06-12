import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPrices, deactivatePrice, updatePrice, togglePrice } from '../../api/farmer';
import toast from 'react-hot-toast';
import { Plus, Trash2, TrendingUp, Package, IndianRupee, Edit2, X, Eye, EyeOff } from 'lucide-react';

/* ── Confirm remove dialog ──────────────────────────── */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-sm w-full border border-sage-100 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Remove Listing?</h3>
            <p className="text-sage-500 text-sm mt-1">
              This listing will be deactivated and no longer visible to buyers.
            </p>
          </div>
          <button onClick={onCancel} className="p-1 text-sage-400 hover:text-sage-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all duration-200">
            Yes, Remove
          </button>
          <button onClick={onCancel} className="flex-1 btn-ghost py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit listing modal ─────────────────────────────── */
function EditModal({ listing, onClose, onSaved }) {
  const [form, setForm] = useState({
    pricePerUnit:      listing.pricePerUnit?.toString()      || '',
    quantityAvailable: listing.quantityAvailable?.toString() || '',
    location:          listing.location  || '',
    district:          listing.district  || '',
  });
  const [saving, setSaving] = useState(false);

  const price    = parseFloat(form.pricePerUnit)      || 0;
  const qty      = parseFloat(form.quantityAvailable) || 0;
  const earnings = price > 0 && qty > 0 ? (price * qty).toFixed(2) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (price <= 0) { toast.error('Price must be greater than 0'); return; }
    if (qty   <= 0) { toast.error('Quantity must be greater than 0'); return; }
    setSaving(true);
    try {
      await updatePrice(listing.id, {
        pricePerUnit:      price,
        quantityAvailable: qty,
        location:          form.location  || null,
        district:          form.district  || null,
      });
      toast.success('Listing updated successfully!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-md w-full border border-sage-100 animate-fade-in">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit Listing</h3>
            <p className="text-sage-500 text-sm mt-0.5">{listing.productName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price history note */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-5 text-xs text-primary-700">
          <p className="font-semibold mb-0.5">Price history preserved</p>
          <p className="text-primary-500">Your current price (₹{listing.pricePerUnit}) will be saved in history. The listing updates in-place — no duplicate created.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                New Price (₹/{listing.productUnit})
              </label>
              <input type="number" step="0.01" min="0.01" required value={form.pricePerUnit}
                onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                className="input-field" placeholder="e.g. 680" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Quantity ({listing.productUnit})
              </label>
              <input type="number" step="0.01" min="0.01" required value={form.quantityAvailable}
                onChange={e => setForm({ ...form, quantityAvailable: e.target.value })}
                className="input-field" placeholder="e.g. 500" />
            </div>
          </div>

          {earnings && (
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
              <p className="text-sm text-primary-700 font-medium">New Potential Earnings</p>
              <p className="text-lg font-bold text-primary-700">₹{earnings}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Village / Town</label>
              <input type="text" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="input-field" placeholder="e.g. Kusheshwar Asthan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">District</label>
              <input type="text" value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                className="input-field" placeholder="e.g. Darbhanga" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 justify-center py-3">
              {saving ? 'Saving...' : 'Update Listing'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center py-3">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function MyPrices() {
  const [prices, setPrices]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [editListing, setEditListing] = useState(null);
  const [tab, setTab] = useState('ACTIVE'); // ACTIVE | INACTIVE

  useEffect(() => { fetchPrices(); }, []);

  const fetchPrices = async () => {
    try {
      const res = await getMyPrices();
      setPrices(res.data.data || []);
    } catch {
      toast.error('Failed to load your prices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmId) return;
    try {
      await deactivatePrice(confirmId);
      toast.success('Listing removed');
      setConfirmId(null);
      fetchPrices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
      setConfirmId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await togglePrice(id);
      toast.success(res.data.message);
      fetchPrices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle listing');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  const activePrices   = prices.filter(p => p.active !== false);
  const inactivePrices = prices.filter(p => p.active === false);
  const displayPrices  = tab === 'ACTIVE' ? activePrices : inactivePrices;

  const totalQty   = activePrices.reduce((s, p) => s + parseFloat(p.quantityAvailable || 0), 0);
  const totalValue = activePrices.reduce((s, p) => s + (parseFloat(p.pricePerUnit || 0) * parseFloat(p.quantityAvailable || 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Price Listings</h1>
          <p className="text-sage-500 text-sm mt-0.5">One active listing per product — edit to update price or stock</p>
        </div>
        <Link to="/farmer/add-price" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Listing
        </Link>
      </div>

      {prices.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active listings</h3>
          <p className="text-sage-500 text-sm mb-6 max-w-xs mx-auto">
            Post your makhana price and start receiving orders from buyers across India.
          </p>
          <Link to="/farmer/add-price" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Post Your First Listing
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Package,     label: 'Active Listings',  value: activePrices.length },
              { icon: TrendingUp,  label: 'Total Qty Listed', value: `${totalQty.toLocaleString('en-IN')} kg` },
              { icon: IndianRupee, label: 'Est. Total Value',  value: `₹${Math.round(totalValue).toLocaleString('en-IN')}` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-sage-100 shadow-soft p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-4 w-4 text-sage-400" />
                  <p className="text-xs text-sage-500">{s.label}</p>
                </div>
                <p className="text-xl font-bold text-primary-600">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Active / Inactive tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { key: 'ACTIVE',   label: 'Active Listings',   count: activePrices.length   },
              { key: 'INACTIVE', label: 'Inactive (Paused)', count: inactivePrices.length },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                    : 'bg-white text-sage-600 border-sage-200 hover:border-primary-300 hover:bg-primary-50'
                }`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t.key ? 'bg-primary-500 text-white' : 'bg-sage-100 text-sage-600'
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          {displayPrices.length === 0 ? (
            <div className="text-center py-12 text-sage-400">
              {tab === 'ACTIVE'
                ? 'No active listings. All your listings are paused.'
                : 'No inactive listings. All your listings are live.'}
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-soft border border-sage-100 overflow-hidden">
            <table className="min-w-full divide-y divide-sage-100">
              <thead className="bg-sage-50">
                <tr>
                  {['Product', 'Price', 'Qty Available', 'Est. Value', 'District', 'Posted', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-50">
                {displayPrices.map(p => {
                  const rowValue = Math.round(parseFloat(p.pricePerUnit) * parseFloat(p.quantityAvailable));
                  return (
                    <tr key={p.id} className="hover:bg-sage-50 transition-colors duration-150">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{p.productName}</td>
                      <td className="px-5 py-4 text-sm font-bold text-primary-600">₹{p.pricePerUnit}/{p.productUnit}</td>
                      <td className="px-5 py-4 text-sm text-sage-600">{p.quantityAvailable} {p.productUnit}</td>
                      <td className="px-5 py-4 text-sm font-medium text-sage-700">₹{rowValue.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-sm text-sage-600">{p.district || '—'}</td>
                      <td className="px-5 py-4 text-xs text-sage-400">{p.date}</td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${
                          p.active !== false
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.active !== false ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Toggle active/pause */}
                          <button
                            onClick={() => handleToggle(p.id)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              p.active !== false
                                ? 'text-green-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={p.active !== false ? 'Pause listing' : 'Resume listing'}
                          >
                            {p.active !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setEditListing(p)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            title="Edit listing"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {/* Remove */}
                          <button
                            onClick={() => setConfirmId(p.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            title="Remove listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {/* Confirm remove */}
      {confirmId && (
        <ConfirmDialog
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Edit modal */}
      {editListing && (
        <EditModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={() => { setEditListing(null); fetchPrices(); }}
        />
      )}
    </div>
  );
}
