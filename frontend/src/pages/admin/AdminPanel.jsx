import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/admin';
import toast from 'react-hot-toast';
import { ShoppingCart, Clock, TrendingUp, IndianRupee, Search, X } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border border-amber-200'    },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border border-blue-200'       },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-violet-50 text-violet-700 border border-violet-200' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border border-green-200'    },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-50 text-red-600 border border-red-200'          },
};

const NEXT_STATUSES = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
};

const TAB_FILTERS = [
  { key: 'ALL',       label: 'All'       },
  { key: 'PENDING',   label: 'Pending'   },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'IN_TRANSIT',label: 'In Transit'},
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminPanel() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [search, setSearch]   = useState('');

  // Cursor pagination state
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      const page = res.data.data || {};
      setOrders(page.data || []);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getAllOrders(nextCursor);
      const page = res.data.data || {};
      setOrders(prev => [...prev, ...(page.data || [])]);
      setNextCursor(page.nextCursor || null);
      setHasMore(page.hasMore || false);
    } catch {
      toast.error('Failed to load more orders');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order #${orderId} → ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  /* Stats */
  const pending   = orders.filter(o => o.status === 'PENDING').length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;
  const revenue   = orders.filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const totalCommission = orders.filter(o => o.status === 'DELIVERED' && o.commissionAmount)
    .reduce((s, o) => s + parseFloat(o.commissionAmount || 0), 0);

  /* Filter + search */
  const filtered = orders
    .filter(o => filter === 'ALL' || o.status === filter)
    .filter(o => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.buyerName?.toLowerCase().includes(q) ||
        o.farmerName?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Order Management</h1>
        <span className="badge bg-sage-100 text-sage-600 self-start sm:self-auto">{orders.length} total orders</span>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[
          { icon: ShoppingCart, label: 'Total Orders',    value: orders.length,                               color: 'text-gray-900'    },
          { icon: Clock,        label: 'Pending Action',  value: pending,                                     color: pending > 0 ? 'text-amber-600' : 'text-gray-900' },
          { icon: TrendingUp,   label: 'Delivered',       value: delivered,                                   color: 'text-green-600'   },
          { icon: IndianRupee,  label: 'Total Revenue',   value: `₹${revenue.toLocaleString('en-IN')}`,       color: 'text-primary-600' },
          { icon: IndianRupee,  label: 'Our Commission', value: `₹${totalCommission.toLocaleString('en-IN')}`, color: 'text-green-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-sage-100 shadow-soft p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-sage-400" />
              <p className="text-xs text-sage-500">{s.label}</p>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {TAB_FILTERS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200 ${
                filter === t.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                  : 'bg-white text-sage-600 border-sage-200 hover:border-primary-300 hover:bg-primary-50'
              }`}>
              {t.label}
              {t.key === 'PENDING' && pending > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-400" />
          <input
            type="text"
            placeholder="Search buyer, farmer, product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 pr-8 w-64 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sage-400">
          {search ? `No orders matching "${search}"` : `No ${filter.toLowerCase()} orders.`}
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="md:hidden space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={order.id} className="bg-white rounded-xl border border-sage-100 shadow-soft p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-sage-400">#{order.id}</p>
                      <h3 className="font-bold text-gray-900 text-sm">{order.productName}</h3>
                    </div>
                    <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-sage-600 mb-3">
                    <div><span className="text-sage-400">Buyer:</span> {order.buyerName}</div>
                    <div><span className="text-sage-400">Farmer:</span> {order.farmerName}</div>
                    <div><span className="text-sage-400">Qty:</span> {order.quantity} {order.productUnit}</div>
                    <div><span className="text-sage-400">Total:</span> <span className="font-bold text-gray-900">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span></div>
                    {order.commissionAmount && (
                      <div><span className="text-sage-400">Commission:</span> <span className="text-green-600 font-semibold">₹{parseFloat(order.commissionAmount).toFixed(0)}</span></div>
                    )}
                    <div><span className="text-sage-400">Date:</span> {order.date}</div>
                  </div>
                  {order.notes && <p className="text-xs text-sage-400 italic mb-3">"{order.notes}"</p>}
                  {NEXT_STATUSES[order.status]?.length > 0 && (
                    <div className="flex gap-2 pt-2 border-t border-sage-50">
                      {NEXT_STATUSES[order.status].map(s => {
                        const isCancelAction = s === 'CANCELLED';
                        return (
                          <button key={s} onClick={() => handleStatusChange(order.id, s)}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium transition-all duration-200 ${
                              isCancelAction
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-500 hover:text-white'
                                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-500 hover:text-white'
                            }`}>
                            {s.replace('_', ' ')}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden md:block bg-white rounded-2xl shadow-soft border border-sage-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-sage-100">
              <thead className="bg-sage-50">
                <tr>
                  {['ID', 'Product', 'Buyer', 'Farmer', 'Qty', 'Total', 'Commission', 'Notes', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-50">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-sage-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-sage-500 font-medium">#{order.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{order.productName}</td>
                      <td className="px-4 py-3 text-sm text-sage-600">{order.buyerName}</td>
                      <td className="px-4 py-3 text-sm text-sage-600">{order.farmerName}</td>
                      <td className="px-4 py-3 text-sm text-sage-600">{order.quantity} {order.productUnit}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.commissionAmount ? (
                          <span className="text-green-600 font-semibold">₹{parseFloat(order.commissionAmount).toFixed(0)}
                            <span className="text-xs text-sage-400 font-normal ml-1">({order.commissionPercent}%)</span>
                          </span>
                        ) : <span className="text-sage-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-sage-500 max-w-[200px]" title={order.notes || ''}>
                        {order.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-sage-400">{order.date}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {NEXT_STATUSES[order.status]?.map(s => {
                            const isCancelAction = s === 'CANCELLED';
                            return (
                              <button key={s} onClick={() => handleStatusChange(order.id, s)}
                                className={`px-2.5 py-1 text-xs rounded-lg border font-medium whitespace-nowrap transition-all duration-200 ${
                                  isCancelAction
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500'
                                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500'
                                }`}>
                                {s.replace('_', ' ')}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Load More */}
      {hasMore && filtered.length > 0 && (
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
              'Load More Orders'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
