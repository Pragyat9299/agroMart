import { useState, useEffect, useCallback } from 'react';
import { getAllPrices } from '../api/prices';
import { getAllProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { placeOrder, toggleFavourite, getFavourites } from '../api/buyer';
import { getProfile } from '../api/profile';
import toast from 'react-hot-toast';
import {
  MapPin, Clock, Filter, X, Star, Package,
  Heart, RefreshCw, LayoutGrid, List, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

/* ── Favourites (DB-backed) ────────────────────────────── */
function useFavourites(isBuyer) {
  const [favs, setFavs] = useState(new Set());

  useEffect(() => {
    if (!isBuyer) return;
    getFavourites()
      .then(res => setFavs(new Set(res.data.data || [])))
      .catch(() => {});
  }, [isBuyer]);

  const toggle = async (productId) => {
    try {
      const res = await toggleFavourite(productId);
      const added = res.data.data;
      setFavs(prev => {
        const next = new Set(prev);
        if (added) next.add(productId);
        else next.delete(productId);
        return next;
      });
    } catch {
      toast.error('Failed to update favourite');
    }
  };

  return [favs, toggle];
}

/* ── District price summary bar ───────────────────────── */
function DistrictSummary({ prices }) {
  if (!prices.length) return null;

  const byDistrict = {};
  prices.forEach(p => {
    if (!p.district) return;
    if (!byDistrict[p.district]) byDistrict[p.district] = [];
    byDistrict[p.district].push(p.pricePerUnit);
  });

  const districts = Object.entries(byDistrict)
    .map(([name, ps]) => ({
      name,
      avg: Math.round(ps.reduce((a, b) => a + b, 0) / ps.length),
      min: Math.min(...ps),
      count: ps.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  if (!districts.length) return null;

  const lowestAvg  = districts[0]?.avg ?? 0;
  const globalAvg  = districts.length > 0
    ? Math.round(districts.reduce((s, d) => s + d.avg, 0) / districts.length)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-sage-600 uppercase tracking-wider">Today's District Prices</h3>
        <span className="text-xs text-sage-400">Avg across all: ₹{globalAvg}/kg</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {districts.map((d, i) => {
          const isCheapest = i === 0;
          const diff = d.avg - globalAvg;
          return (
            <div
              key={d.name}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center min-w-[110px] ${
                isCheapest
                  ? 'bg-primary-50 border-primary-300'
                  : 'bg-sage-50 border-sage-200'
              }`}
            >
              {isCheapest && (
                <p className="text-xs font-bold text-primary-600 mb-0.5">Cheapest</p>
              )}
              <p className="text-sm font-bold text-gray-900">{d.name}</p>
              <p className={`text-lg font-bold ${isCheapest ? 'text-primary-600' : 'text-gray-800'}`}>
                ₹{d.avg}
              </p>
              <p className="text-xs text-sage-400">{d.count} listing{d.count > 1 ? 's' : ''}</p>
              <p className={`text-xs font-medium mt-0.5 flex items-center justify-center gap-0.5 ${
                diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-sage-400'
              }`}>
                {diff < 0 ? <TrendingDown className="h-3 w-3" /> : diff > 0 ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {diff === 0 ? 'Avg' : `${diff > 0 ? '+' : ''}₹${Math.abs(diff)} vs avg`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function LivePrices() {
  const { user }    = useAuth();
  const [allPrices, setAllPrices]   = useState([]);
  const [prices, setPrices]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filter, setFilter]         = useState({ district: '', productId: '', favOnly: false });
  const [sortBy, setSortBy]         = useState('newest');
  const [viewMode, setViewMode]     = useState('grid'); // grid | table
  const [orderModal, setOrderModal] = useState(null);
  const [orderForm, setOrderForm]   = useState({ quantity: '', deliveryAddress: '', notes: '' });
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agroSavedAddresses') || '[]'); }
    catch { return []; }
  });
  const [ordering, setOrdering]     = useState(false);
  const [profile, setProfile]       = useState(null);

  // Cursor pagination state
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFarmer = user?.role === 'FARMER';
  const isBuyer  = user?.role === 'BUYER';

  const [favs, toggleFav] = useFavourites(isBuyer);

  useEffect(() => {
    fetchData();
    if (isBuyer) getProfile().then(r => setProfile(r.data.data)).catch(() => {});
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [pricesRes, productsRes] = await Promise.all([getAllPrices(), getAllProducts()]);
      const page = pricesRes.data.data || {};
      const data = page.data || [];
      setAllPrices(data);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
      setProducts(productsRes.data.data || []);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to load prices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getAllPrices(nextCursor);
      const page = res.data.data || {};
      const newData = page.data || [];
      setAllPrices(prev => [...prev, ...newData]);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to load more prices');
    } finally {
      setLoadingMore(false);
    }
  };

  const uniqueDistricts = [...new Set(allPrices.map(p => p.district).filter(Boolean))];

  /* Reactive filter + sort */
  useEffect(() => {
    let f = [...allPrices];
    if (filter.district)  f = f.filter(p => p.district?.toLowerCase() === filter.district.toLowerCase());
    if (filter.productId) f = f.filter(p => p.productId === parseInt(filter.productId));
    if (filter.favOnly)   f = f.filter(p => favs.has(p.productId));
    if (sortBy === 'price_asc')  f.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    if (sortBy === 'price_desc') f.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    setPrices(f);
  }, [filter, sortBy, allPrices, favs]);

  const clearFilters = () => setFilter({ district: '', productId: '', favOnly: false });

  const cheapestId = prices.length > 0
    ? prices.reduce((min, p) => p.pricePerUnit < min.pricePerUnit ? p : min, prices[0]).id
    : null;

  /* Global average for "X% below avg" on best price card */
  const globalAvg = allPrices.length > 0
    ? Math.round(allPrices.reduce((s, p) => s + p.pricePerUnit, 0) / allPrices.length)
    : 0;

  /* Save address to localStorage */
  const saveAddress = (addr) => {
    if (!addr.trim() || savedAddresses.includes(addr.trim())) return;
    const updated = [addr.trim(), ...savedAddresses].slice(0, 5);
    setSavedAddresses(updated);
    localStorage.setItem('agroSavedAddresses', JSON.stringify(updated));
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const qty = parseFloat(orderForm.quantity);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (qty > orderModal.quantityAvailable) {
      toast.error(`Only ${orderModal.quantityAvailable} ${orderModal.productUnit} available`);
      return;
    }
    setOrdering(true);
    try {
      if (orderForm.deliveryAddress) saveAddress(orderForm.deliveryAddress);
      await placeOrder({
        priceEntryId: orderModal.id,
        quantity: parseFloat(orderForm.quantity),
        deliveryAddress: orderForm.deliveryAddress,
        notes: orderForm.notes,
      });
      toast.success('Order placed! AgroTrade will coordinate with the farmer.');
      setOrderModal(null);
      setOrderForm({ quantity: '', deliveryAddress: '', notes: '' });
      fetchData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  const minutesAgo = Math.round((new Date() - lastRefresh) / 60000);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Live Makhana Prices</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sage-500 text-sm">
              {minutesAgo === 0 ? 'Just refreshed' : `Refreshed ${minutesAgo} min ago`}
            </p>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="text-primary-600 hover:text-primary-700 transition-colors"
              title="Refresh prices"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl border border-sage-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-sage-500 hover:bg-sage-50'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-sage-500 hover:bg-sage-50'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <span className="badge bg-primary-50 text-primary-700 border border-primary-200 font-semibold">
            {prices.length} listings
          </span>
        </div>
      </div>

      {/* ── District summary bar ── */}
      <DistrictSummary prices={allPrices} />

      {/* ── Filters + Sort ── */}
      <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-sage-600 mb-1">District</label>
            <select value={filter.district} onChange={e => setFilter({ ...filter, district: e.target.value })} className="input-field w-44">
              <option value="">All Districts</option>
              {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sage-600 mb-1">Product / Grade</label>
            <select value={filter.productId} onChange={e => setFilter({ ...filter, productId: e.target.value })} className="input-field w-48">
              <option value="">All Products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sage-600 mb-1">Sort by</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'newest',     label: 'Newest'   },
                { key: 'price_asc',  label: 'Price ↑'  },
                { key: 'price_desc', label: 'Price ↓'  },
              ].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    sortBy === s.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-sage-600 border-sage-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}>{s.label}</button>
              ))}
            </div>
          </div>
          {isBuyer && (
            <button
              onClick={() => setFilter(f => ({ ...f, favOnly: !f.favOnly }))}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 self-end ${
                filter.favOnly ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-sage-600 border-sage-200 hover:border-pink-300'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${filter.favOnly ? 'fill-current' : ''}`} />
              Favourites
            </button>
          )}
          {(filter.district || filter.productId || filter.favOnly) && (
            <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 self-end">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Active chips */}
        {(filter.district || filter.productId) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-sage-100">
            {filter.district && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg border border-primary-200">
                <MapPin className="h-3 w-3" /> {filter.district}
                <button onClick={() => setFilter({ ...filter, district: '' })} className="ml-1">×</button>
              </span>
            )}
            {filter.productId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg border border-primary-200">
                <Package className="h-3 w-3" /> {products.find(p => p.id === parseInt(filter.productId))?.name}
                <button onClick={() => setFilter({ ...filter, productId: '' })} className="ml-1">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Best deal banner (buyers only, only when cheapest is below avg) ── */}
      {isBuyer && cheapestId && prices.length > 1 && (() => {
        const best = prices.find(p => p.id === cheapestId);
        if (!best) return null;
        const pctBelow = globalAvg > 0 ? Math.round(((globalAvg - best.pricePerUnit) / globalAvg) * 100) : 0;
        if (pctBelow <= 0) return null; // don't show if cheapest is at or above average
        return (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl px-5 py-4 mb-6 flex items-center gap-4 shadow-soft-md">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-white fill-current" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Best Price Today</p>
              <p className="text-primary-100 text-xs mt-0.5">
                {best.productName} from {best.district} — ₹{best.pricePerUnit}/kg
                {pctBelow > 0 && ` · ${pctBelow}% below average`}
              </p>
            </div>
            <button
              onClick={() => setOrderModal(best)}
              className="flex-shrink-0 bg-white text-primary-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Order Now
            </button>
          </div>
        );
      })()}

      {/* ── No results ── */}
      {prices.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="h-12 w-12 text-sage-200 mx-auto mb-4" />
          <p className="text-sage-500 font-medium">No listings match your filters.</p>
          <button onClick={clearFilters} className="mt-3 text-primary-600 text-sm hover:underline">Clear filters</button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid view ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((price) => {
            const isFav = favs.has(price.productId);
            return (
              <div key={price.id}
                className={`card card-hover p-5 flex flex-col relative ${price.id === cheapestId ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
              >
                {price.id === cheapestId && (
                  <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-primary-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-soft">
                    <Star className="h-3 w-3" /> Best Price
                  </div>
                )}

                {/* Favourite button */}
                {isBuyer && (
                  <button
                    onClick={() => toggleFav(price.productId)}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 ${
                      isFav ? 'text-pink-500 bg-pink-50' : 'text-sage-300 hover:text-pink-400 hover:bg-pink-50'
                    }`}
                    title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                )}

                <div className="flex justify-between items-start mb-3 pr-8">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 leading-tight">{price.productName}</h3>
                    {price.grade && (
                      <span className="inline-block mt-1 text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-md font-medium">
                        {price.grade}
                      </span>
                    )}
                    {!isFarmer && <p className="text-xs text-sage-400 mt-1 truncate">
                      {price.farmerName}
                      {price.farmerExperience && <span className="ml-1 text-primary-500 font-medium">· {price.farmerExperience} yrs exp</span>}
                    </p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-primary-600">₹{price.pricePerUnit}</p>
                    <p className="text-xs text-sage-400">per {price.productUnit}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-sage-500 mb-4 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sage-400 flex-shrink-0" />
                    <span>{price.district || price.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sage-400 flex-shrink-0" />
                    <span>{price.date} at {price.time}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sage-50">
                    <span className="text-xs text-sage-400">Available</span>
                    <span className="font-semibold text-gray-700 text-sm">{price.quantityAvailable} {price.productUnit}</span>
                  </div>
                </div>

                {isBuyer && (
                  <button onClick={() => setOrderModal(price)} className="btn-primary w-full justify-center">
                    Place Order
                  </button>
                )}
                {isFarmer && <p className="text-xs text-sage-400 text-center italic">Market price reference only</p>}
                {!user && <p className="text-xs text-sage-400 text-center"><a href="/login" className="text-primary-600 font-medium">Sign in</a> to order</p>}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table view ── */
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 overflow-hidden">
          <table className="min-w-full divide-y divide-sage-100">
            <thead className="bg-sage-50">
              <tr>
                {['Product', 'District', 'Price/kg', 'Available', 'Posted', ...(isBuyer ? [''] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50">
              {prices.map(price => (
                <tr key={price.id} className={`hover:bg-sage-50 transition-colors duration-150 ${price.id === cheapestId ? 'bg-primary-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {price.id === cheapestId && <Star className="h-3.5 w-3.5 text-primary-500 fill-current flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{price.productName}</p>
                        {!isFarmer && <p className="text-xs text-sage-400">
                          {price.farmerName}
                          {price.farmerExperience && <span className="ml-1 text-primary-500">· {price.farmerExperience}yr</span>}
                        </p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-sage-600">{price.district || '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-600">₹{price.pricePerUnit}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">{price.quantityAvailable} {price.productUnit}</td>
                  <td className="px-4 py-3 text-xs text-sage-400">{price.date}</td>
                  {isBuyer && (
                    <td className="px-4 py-3">
                      <button onClick={() => setOrderModal(price)} className="btn-primary text-xs py-1.5 px-3">
                        Order
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Load More button ── */}
      {hasMore && prices.length > 0 && (
        <div className="flex justify-center mt-8">
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

      {/* ── Order modal ── */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-md w-full border border-sage-100 animate-fade-in">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Place Order</h2>
                <p className="text-sm text-sage-500 mt-0.5">{orderModal.productName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">₹{orderModal.pricePerUnit}</p>
                <p className="text-xs text-sage-400">per {orderModal.productUnit}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-sage-50 rounded-xl px-4 py-3 mb-5 text-sm text-sage-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-sage-400" />
                {orderModal.district || orderModal.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-sage-400" />
                Max {orderModal.quantityAvailable} {orderModal.productUnit}
              </div>
            </div>

            <form onSubmit={handleOrder} className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Quantity ({orderModal.productUnit})</label>
                <input type="number" step="0.01" min="0.01" max={orderModal.quantityAvailable} required
                  value={orderForm.quantity}
                  onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="input-field"
                  placeholder={`Enter qty (max ${orderModal.quantityAvailable})`}
                />
              </div>

              {/* Live total */}
              {orderForm.quantity && parseFloat(orderForm.quantity) > 0 && (
                <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-primary-700 font-medium">Estimated Total</p>
                    <p className="text-xs text-primary-500 mt-0.5">
                      {orderForm.quantity} {orderModal.productUnit} × ₹{orderModal.pricePerUnit}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-primary-700">
                    ₹{(parseFloat(orderForm.quantity) * orderModal.pricePerUnit).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Delivery address with saved addresses */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Delivery Address <span className="text-sage-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={orderForm.deliveryAddress}
                  onChange={e => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                  placeholder={profile?.address || 'Leave blank to use registered address'}
                  className="input-field"
                  list="saved-addresses"
                />
                <datalist id="saved-addresses">
                  {savedAddresses.map(a => <option key={a} value={a} />)}
                  {profile?.address && !savedAddresses.includes(profile.address) && (
                    <option value={profile.address} />
                  )}
                </datalist>
                {savedAddresses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {savedAddresses.slice(0, 3).map(a => (
                      <button key={a} type="button"
                        onClick={() => setOrderForm({ ...orderForm, deliveryAddress: a })}
                        className="text-xs px-2 py-1 bg-sage-50 border border-sage-200 rounded-lg text-sage-600 hover:border-primary-300 hover:bg-primary-50 transition-colors truncate max-w-[140px]"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Notes <span className="text-sage-400 font-normal">(optional)</span>
                </label>
                <textarea value={orderForm.notes} rows="2"
                  onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Any special requirements..."
                  className="input-field resize-none"
                />
              </div>

              <p className="text-xs text-sage-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                Price locked at ₹{orderModal.pricePerUnit}/{orderModal.productUnit} on confirm.
              </p>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={ordering} className="btn-primary flex-1 justify-center py-3">
                  {ordering ? 'Placing...' : 'Confirm Order'}
                </button>
                <button type="button"
                  onClick={() => { setOrderModal(null); setOrderForm({ quantity: '', deliveryAddress: '', notes: '' }); }}
                  className="btn-ghost flex-1 justify-center py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
