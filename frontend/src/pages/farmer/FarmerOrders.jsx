import { useState, useEffect } from 'react';
import { getFarmerOrders } from '../../api/farmer';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, MapPin, Clock, TrendingUp, ShoppingBag, IndianRupee } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border border-amber-200'    },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border border-blue-200'       },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-violet-50 text-violet-700 border border-violet-200' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border border-green-200'    },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-50 text-red-600 border border-red-200'          },
};

const TAB_FILTERS = [
  { key: 'ALL',       label: 'All'       },
  { key: 'PENDING',   label: 'Pending'   },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function FarmerOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');

  useEffect(() => {
    getFarmerOrders()
      .then(res => setOrders(res.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  /* Stats */
  const totalEarnings  = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const pendingOrders  = orders.filter(o => o.status === 'PENDING').length;

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Received</h1>
          <p className="text-sage-500 text-sm mt-0.5">Orders placed by buyers for your listings</p>
        </div>
        <Link to="/farmer/prices" className="btn-ghost flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" /> My Listings
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-sage-500 text-sm mb-6 max-w-xs mx-auto">
            Once buyers place orders for your listings, they'll appear here.
          </p>
          <Link to="/farmer/add-price" className="btn-primary inline-flex items-center gap-2">
            Post a Listing
          </Link>
        </div>
      ) : (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { icon: Package,     label: 'Total Orders',   value: orders.length,                                         color: 'text-gray-900'    },
              { icon: Clock,       label: 'Needs Action',   value: pendingOrders,                                         color: pendingOrders > 0 ? 'text-amber-600' : 'text-gray-900' },
              { icon: IndianRupee, label: 'Total Earned',   value: `₹${totalEarnings.toLocaleString('en-IN')}`,           color: 'text-primary-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-sage-100 shadow-soft p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-4 w-4 text-sage-400" />
                  <p className="text-xs text-sage-500">{s.label}</p>
                </div>
                <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {TAB_FILTERS.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                  filter === t.key
                    ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                    : 'bg-white text-sage-600 border-sage-200 hover:border-primary-300 hover:bg-primary-50'
                }`}>
                {t.label}
                {t.key === 'PENDING' && pendingOrders > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingOrders}</span>
                )}
              </button>
            ))}
          </div>

          {/* Order cards */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-sage-400">No {filter.toLowerCase()} orders.</div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={order.id}
                    className="bg-white rounded-2xl shadow-soft border border-sage-100 p-5 hover:shadow-soft-md transition-all duration-200">

                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{order.productName}</h3>
                          <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-sage-500 mt-1">
                          {order.quantity} {order.productUnit} @ ₹{order.pricePerUnit}/{order.productUnit}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-primary-700">
                          ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-sage-400 mt-0.5">{order.date}</p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-sage-50 rounded-xl p-3">
                        <p className="text-xs text-sage-400 font-medium uppercase tracking-wide mb-1">Buyer</p>
                        <p className="font-semibold text-gray-900">{order.buyerName}</p>
                      </div>
                      <div className="bg-sage-50 rounded-xl p-3">
                        <p className="text-xs text-sage-400 font-medium uppercase tracking-wide mb-1">Delivery Address</p>
                        <p className="text-gray-700 text-sm">{order.deliveryAddress || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Notes & timestamp */}
                    {(order.notes || order.time) && (
                      <div className="flex flex-wrap gap-4 text-xs text-sage-400 mt-3 pt-3 border-t border-sage-50">
                        {order.notes && (
                          <span className="italic">"{order.notes}"</span>
                        )}
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" /> {order.date} at {order.time}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
