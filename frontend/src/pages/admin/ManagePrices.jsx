import { useState, useEffect, useRef } from 'react';
import { getAllProducts } from '../../api/products';
import { getAllAdminPrices, getUsers, updateAdminPrice, toggleAdminPrice, downloadPriceTemplate } from '../../api/admin';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Edit2, X, Search, TrendingUp, Plus, Eye, EyeOff } from 'lucide-react';

/* ── Edit listing modal ──────────────────────────── */
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
      await updateAdminPrice(listing.id, {
        pricePerUnit:      price,
        quantityAvailable: qty,
        location:          form.location  || null,
        district:          form.district  || null,
      });
      toast.success('Listing updated — change saved to price history');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[200] p-4 overflow-y-auto min-h-screen">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-md w-full border border-sage-100 animate-fade-in my-8">

        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit Price Listing</h3>
            <p className="text-sage-500 text-sm mt-0.5">
              {listing.productName} — {listing.farmerName}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Audit note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700">
          <p className="font-semibold mb-0.5">Audit trail</p>
          <p className="text-amber-600">
            This change will be recorded in price history with your admin account as <strong>updatedBy</strong>.
            Current price: ₹{listing.pricePerUnit}/{listing.productUnit}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                New Price (₹/{listing.productUnit})
              </label>
              <input type="number" step="0.01" min="0.01" required value={form.pricePerUnit}
                onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Quantity ({listing.productUnit})
              </label>
              <input type="number" step="0.01" min="0.01" required value={form.quantityAvailable}
                onChange={e => setForm({ ...form, quantityAvailable: e.target.value })}
                className="input-field" />
            </div>
          </div>

          {earnings && (
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
              <p className="text-sm text-primary-700 font-medium">Potential Value</p>
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
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
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

/* ── Main component ──────────────────────────────── */
export default function ManagePrices() {
  const [allListings, setAllListings]   = useState([]);
  const [listings, setListings]         = useState([]);
  const [products, setProducts]         = useState([]);
  const [farmers, setFarmers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterFarmer, setFilterFarmer] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [tab, setTab]                   = useState('ACTIVE'); // ACTIVE | INACTIVE
  const [editListing, setEditListing]   = useState(null);
  const [showNewForm, setShowNewForm]   = useState(false);
  const [newForm, setNewForm]           = useState({
    farmerId: '', productId: '', pricePerUnit: '', quantityAvailable: '', location: '', district: '',
  });
  const [saving, setSaving]             = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef(null);

  // Cursor pagination state
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    Promise.all([getAllAdminPrices(), getAllProducts(), getUsers('FARMER')])
      .then(([pricesRes, prodRes, userRes]) => {
        const page = pricesRes.data.data || {};
        const data = page.data || [];
        setAllListings(data);
        setListings(data);
        setNextCursor(page.nextCursor || null);
        setHasMore(page.hasMore || false);
        setProducts(prodRes.data.data || []);
        setFarmers(userRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  /* Reactive filter + search + tab */
  useEffect(() => {
    let f = [...allListings];
    // Tab filter
    if (tab === 'ACTIVE')   f = f.filter(l => l.active !== false);
    if (tab === 'INACTIVE') f = f.filter(l => l.active === false);
    if (filterFarmer)  f = f.filter(l => String(l.farmerId) === filterFarmer);
    if (filterProduct) f = f.filter(l => String(l.productId) === filterProduct);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(l =>
        l.farmerName?.toLowerCase().includes(q) ||
        l.productName?.toLowerCase().includes(q) ||
        l.district?.toLowerCase().includes(q)
      );
    }
    setListings(f);
  }, [search, filterFarmer, filterProduct, tab, allListings]);

  const handleToggle = async (id) => {
    try {
      const res = await toggleAdminPrice(id);
      toast.success(res.data.message);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle listing');
    }
  };

  const refresh = async () => {
    try {
      const res = await getAllAdminPrices();
      const page = res.data.data || {};
      const data = page.data || [];
      setAllListings(data);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to refresh listings');
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getAllAdminPrices(nextCursor);
      const page = res.data.data || {};
      const newData = page.data || [];
      setAllListings(prev => [...prev, ...newData]);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to load more listings');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/admin/prices', {
        farmerId:          parseInt(newForm.farmerId),
        productId:         parseInt(newForm.productId),
        pricePerUnit:      parseFloat(newForm.pricePerUnit),
        quantityAvailable: parseFloat(newForm.quantityAvailable),
        location:          newForm.location,
        district:          newForm.district,
      });
      toast.success('New listing created for farmer');
      setShowNewForm(false);
      setNewForm({ farmerId: '', productId: '', pricePerUnit: '', quantityAvailable: '', location: '', district: '' });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await API.post('/admin/prices/bulk', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult(res.data.data);
      toast.success(`Uploaded: ${res.data.data.successCount} success, ${res.data.data.failedCount} failed`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  const uniqueFarmers  = [...new Map(allListings.map(l => [l.farmerId,  l.farmerName ])).entries()];
  const uniqueProducts = [...new Map(allListings.map(l => [l.productId, l.productName])).entries()];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Manage Price Listings</h1>
          <p className="text-sage-500 text-sm mt-0.5">
            {allListings.length} active listings — search and edit on behalf of farmers
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => setShowNewForm(!showNewForm)} className="btn-primary flex items-center gap-2 text-xs sm:text-sm">
            <Plus className="h-4 w-4" /> New Listing
          </button>
          <button onClick={() => fileRef.current.click()} className="btn-ghost flex items-center gap-2 text-xs sm:text-sm">
            <Upload className="h-4 w-4" /> Bulk Upload
          </button>
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleBulkUpload} />
        </div>
      </div>

      {/* Upload result */}
      {uploadResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-blue-800">
            Upload Result: {uploadResult.successCount} created, {uploadResult.failedCount} failed (of {uploadResult.totalRows} rows)
          </p>
          {uploadResult.errors?.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 list-disc list-inside space-y-0.5">
              {uploadResult.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
          <button onClick={() => setUploadResult(null)} className="text-xs text-blue-600 mt-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* New listing form */}
      {showNewForm && (
        <form onSubmit={handleCreateNew}
          className="bg-white rounded-2xl shadow-soft border border-sage-100 p-6 mb-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Create New Listing for Farmer</h2>
            <button type="button" onClick={() => setShowNewForm(false)} className="text-sage-400 hover:text-sage-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Farmer</label>
              <select required value={newForm.farmerId}
                onChange={e => setNewForm({ ...newForm, farmerId: e.target.value })} className="input-field">
                <option value="">Select farmer</option>
                {farmers.map(f => <option key={f.id} value={f.id}>{f.fullName} — {f.district || f.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Product</label>
              <select required value={newForm.productId}
                onChange={e => setNewForm({ ...newForm, productId: e.target.value })} className="input-field">
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Price per unit (₹)</label>
              <input type="number" step="0.01" required value={newForm.pricePerUnit}
                onChange={e => setNewForm({ ...newForm, pricePerUnit: e.target.value })}
                className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Quantity Available</label>
              <input type="number" step="0.01" required value={newForm.quantityAvailable}
                onChange={e => setNewForm({ ...newForm, quantityAvailable: e.target.value })}
                className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Location</label>
              <input placeholder="Village / Town" value={newForm.location}
                onChange={e => setNewForm({ ...newForm, location: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">District</label>
              <input placeholder="e.g. Darbhanga" value={newForm.district}
                onChange={e => setNewForm({ ...newForm, district: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Listing'}
            </button>
            <button type="button" onClick={() => setShowNewForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Active / Inactive tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'ACTIVE',   label: 'Active Listings',   count: allListings.filter(l => l.active !== false).length },
          { key: 'INACTIVE', label: 'Inactive (Paused)', count: allListings.filter(l => l.active === false).length },
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

      {/* Search + filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-sage-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-400" />
              <input type="text" placeholder="Search farmer, product, district..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-8" />
            </div>
          </div>
          {/* Filter by farmer */}
          <div>
            <label className="block text-xs font-medium text-sage-600 mb-1">Farmer</label>
            <select value={filterFarmer} onChange={e => setFilterFarmer(e.target.value)} className="input-field w-52">
              <option value="">All Farmers</option>
              {uniqueFarmers.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
            </select>
          </div>
          {/* Filter by product */}
          <div>
            <label className="block text-xs font-medium text-sage-600 mb-1">Product</label>
            <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="input-field w-52">
              <option value="">All Products</option>
              {uniqueProducts.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
            </select>
          </div>
          {(search || filterFarmer || filterProduct) && (
            <button onClick={() => { setSearch(''); setFilterFarmer(''); setFilterProduct(''); }}
              className="btn-ghost flex items-center gap-1.5 self-end">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Template download hint */}
      <div className="bg-sage-50 border border-sage-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <p className="text-sm text-sage-600">Need the Excel format for bulk upload? Download the template.</p>
        <button
          onClick={async () => {
            try {
              const res = await downloadPriceTemplate();
              const url = URL.createObjectURL(new Blob([res.data]));
              const a = document.createElement('a');
              a.href = url;
              a.download = 'price_upload_template.xlsx';
              a.click();
              URL.revokeObjectURL(url);
            } catch {
              toast.error('Failed to download template');
            }
          }}
          className="btn-primary text-xs py-2 px-4"
        >
          Download Template
        </button>
      </div>

      {/* Listings table */}
      {listings.length === 0 ? (
        <div className="text-center py-16 text-sage-400">
          {search || filterFarmer || filterProduct
            ? 'No listings match your filters.'
            : 'No active listings in the system.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-sage-100">
            <thead className="bg-sage-50">
              <tr>
                {['Farmer', 'Product', 'Price', 'Qty Available', 'Est. Value', 'District', 'Posted', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50">
              {listings.map(l => {
                const value = Math.round(parseFloat(l.pricePerUnit) * parseFloat(l.quantityAvailable));
                return (
                  <tr key={l.id} className="hover:bg-sage-50 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{l.farmerName}</td>
                    <td className="px-4 py-3 text-sm text-sage-600">{l.productName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">₹{l.pricePerUnit}/{l.productUnit}</td>
                    <td className="px-4 py-3 text-sm text-sage-600">{l.quantityAvailable} {l.productUnit}</td>
                    <td className="px-4 py-3 text-sm font-medium text-sage-700">₹{value.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-sage-600">{l.district || '—'}</td>
                    <td className="px-4 py-3 text-xs text-sage-400">{l.date}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${
                        l.active !== false
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {l.active !== false ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(l.id)}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            l.active !== false
                              ? 'text-green-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-amber-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={l.active !== false ? 'Pause listing' : 'Resume listing'}
                        >
                          {l.active !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditListing(l)}
                          className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                          title="Edit listing"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-sage-100 bg-sage-50">
            <p className="text-xs text-sage-400">Showing {listings.length} of {allListings.length} listings</p>
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && listings.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-primary px-8 py-3 text-sm flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Loading...
              </>
            ) : (
              'Load More Listings'
            )}
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editListing && (
        <EditModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={() => { setEditListing(null); refresh(); }}
        />
      )}
    </div>
  );
}
