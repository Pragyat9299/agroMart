import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllMyPriceHistory } from '../../api/farmer';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Minus, Clock, Package, Filter, X } from 'lucide-react';

export default function PriceHistory() {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterProduct, setFilterProduct] = useState('');

  // Cursor pagination state
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getAllMyPriceHistory()
      .then(res => {
        const page = res.data.data || {};
        setHistory(page.data || []);
        setNextCursor(page.nextCursor || null);
        setHasMore(page.hasMore || false);
      })
      .catch(() => toast.error('Failed to load price history'))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getAllMyPriceHistory(nextCursor);
      const page = res.data.data || {};
      const newData = page.data || [];
      setHistory(prev => [...prev, ...newData]);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to load more history');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  /* Unique products for filter */
  const products = [...new Map(history.map(h => [h.productId, h.productName])).entries()]
    .map(([id, name]) => ({ id, name }));

  const filtered = filterProduct
    ? history.filter(h => String(h.productId) === filterProduct)
    : history;

  /* Group by product using Map (guaranteed insertion order) — newest product section first */
  const groupMap = new Map();
  filtered.forEach(h => {
    if (!groupMap.has(h.productName)) groupMap.set(h.productName, []);
    groupMap.get(h.productName).push(h);
  });
  // entries are already sorted newest-first from backend, so first entry per product = most recent
  const grouped = Array.from(groupMap.entries());

  /* Trend indicator between consecutive entries */
  const formatChange = (entry) => {
    if (entry.changeType === 'STATUS') {
      return {
        label: `${entry.oldValue} → ${entry.newValue}`,
        cls: entry.newValue === 'ACTIVE' ? 'text-green-600' : 'text-amber-600',
        icon: entry.newValue === 'ACTIVE' ? TrendingUp : TrendingDown,
      };
    }
    if (entry.changeType === 'PRICING') {
      const diff = parseFloat(entry.newValue) - parseFloat(entry.oldValue);
      return {
        label: `₹${entry.oldValue} → ₹${entry.newValue}`,
        cls: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-sage-400',
        icon: diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus,
      };
    }
    // INVENTORY
    return {
      label: `${entry.oldValue} → ${entry.newValue}`,
      cls: 'text-blue-600',
      icon: Minus,
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Price History</h1>
          <p className="text-sage-500 text-sm mt-0.5">
            Every price update you've made — {history.length} change{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Link to="/farmer/prices" className="btn-ghost text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Active Listings
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No price changes yet</h3>
          <p className="text-sage-500 text-sm max-w-xs mx-auto">
            When you update the price or quantity of a listing, those changes will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Filter by product */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-sage-400" />
              <select
                value={filterProduct}
                onChange={e => setFilterProduct(e.target.value)}
                className="input-field w-56"
              >
                <option value="">All Products</option>
                {products.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.name}</option>
                ))}
              </select>
            </div>
            {filterProduct && (
              <button
                onClick={() => setFilterProduct('')}
                className="flex items-center gap-1 text-xs text-sage-500 hover:text-sage-700 transition-colors"
              >
                <X className="h-3 w-3" /> Clear filter
              </button>
            )}
            <span className="badge bg-sage-100 text-sage-600 ml-auto">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Per-product timeline sections */}
          {grouped.map(([productName, entries]) => (
            <div key={productName} className="mb-10">
              {/* Product header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{productName}</h2>
                <span className="text-xs text-sage-400">{entries.length} update{entries.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {entries.map((entry, i) => {
                  const change = formatChange(entry);
                  const ChangeIcon = change.icon;
                  return (
                    <div key={entry.id} className="flex gap-4">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary-500 border-2 border-white ring-2 ring-primary-200 flex-shrink-0 mt-4" />
                        {i < entries.length - 1 && (
                          <div className="w-0.5 flex-1 bg-sage-200 mt-1" style={{ minHeight: '32px' }} />
                        )}
                      </div>

                      {/* Card */}
                      <div className="flex-1 pb-4">
                        <div className="bg-white rounded-2xl border border-sage-100 shadow-soft p-4 hover:shadow-soft-md transition-all duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              {/* Change type badge + values */}
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`badge text-xs ${
                                  entry.changeType === 'STATUS'    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : entry.changeType === 'PRICING'  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {entry.changeType}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${change.cls}`}>
                                  <ChangeIcon className="h-3.5 w-3.5" />
                                  {change.label}
                                </span>
                              </div>

                              {/* Updated by */}
                              <p className="text-xs text-sage-400 mt-1">
                                Updated by <span className="font-medium">{entry.updatedByName}</span>
                              </p>
                            </div>

                            {/* Timestamp */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-gray-700">{entry.date}</p>
                              <p className="text-xs text-sage-400">{entry.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-4 mb-8">
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
                  'Load More History'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
