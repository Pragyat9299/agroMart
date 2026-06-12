import { useState, useEffect } from 'react';
import { getBuyerOrders, cancelOrder } from '../../api/buyer';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Clock, TrendingUp, ShoppingBag, XCircle, X } from 'lucide-react';

/* ── Confirm cancel dialog ───────────────────────────── */
function CancelConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-sm w-full border border-sage-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Cancel Order?</h3>
            <p className="text-sage-500 text-sm mt-1">
              This will cancel your order and restore the quantity back to the farmer's listing.
            </p>
          </div>
          <button onClick={onCancel} className="p-1 text-sage-400 hover:text-sage-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all duration-200">
            Yes, Cancel Order
          </button>
          <button onClick={onCancel} className="flex-1 btn-ghost py-2.5">Keep Order</button>
        </div>
      </div>
    </div>
  );
}

/* ── Status config ───────────────────────────────── */
const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border border-amber-200',    step: 0 },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border border-blue-200',       step: 1 },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-violet-50 text-violet-700 border border-violet-200', step: 2 },
  DELIVERED:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border border-green-200',    step: 3 },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-50 text-red-600 border border-red-200',          step: -1 },
};

const STEPS = ['Order Placed', 'Confirmed', 'In Transit', 'Delivered'];

/* ── Progress tracker ────────────────────────────── */
function OrderProgress({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-xs text-red-500 font-medium">This order was cancelled</span>
      </div>
    );
  }
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="mt-4 flex items-start">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-col items-center" style={{ flex: 1 }}>
          {/* Circle + connecting line row */}
          <div className="flex items-center w-full">
            {/* Left line (hidden for first step) */}
            <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : i <= currentStep ? 'bg-primary-500' : 'bg-sage-200'}`} />

            {/* Circle */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < currentStep
                ? 'bg-primary-600 border-primary-600 text-white'
                : i === currentStep
                  ? 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100'
                  : 'bg-white border-sage-200 text-sage-400'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>

            {/* Right line (hidden for last step) */}
            <div className={`flex-1 h-0.5 ${i === STEPS.length - 1 ? 'invisible' : i < currentStep ? 'bg-primary-500' : 'bg-sage-200'}`} />
          </div>

          {/* Label directly below circle */}
          <p className={`mt-1.5 text-xs text-center leading-tight px-1 ${
            i === currentStep ? 'text-primary-600 font-semibold' : 'text-sage-400'
          }`}>
            {step}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────── */
export default function BuyerOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    getBuyerOrders()
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

  const totalSpend   = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

  const TAB_FILTERS = [
    { key: 'ALL',       label: 'All'       },
    { key: 'ACTIVE',    label: 'Active'    },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredOrders =
    filter === 'ACTIVE'    ? orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    : filter === 'DELIVERED' ? orders.filter(o => o.status === 'DELIVERED')
    : filter === 'CANCELLED' ? orders.filter(o => o.status === 'CANCELLED')
    : orders;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-sage-500 text-sm mt-0.5">Track your makhana orders</p>
        </div>
        <Link to="/prices" className="btn-primary flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" /> Browse Prices
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-sage-500 text-sm mb-6 max-w-xs mx-auto">
            Browse live prices from verified makhana farmers and place your first order.
          </p>
          <Link to="/prices" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Browse Live Prices
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-gray-900' },
              { label: 'Active',       value: activeOrders,  color: 'text-primary-600' },
              { label: 'Total Spend',  value: `₹${totalSpend.toLocaleString('en-IN')}`, color: 'text-primary-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-sage-100 shadow-soft p-3 sm:p-4 text-center">
                <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-sage-500 mt-0.5">{s.label}</p>
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
                {t.key === 'ACTIVE' && activeOrders > 0 && (
                  <span className="ml-1.5 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeOrders}</span>
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
                    {/* Top */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{order.productName}</h3>
                          <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-sage-500 mt-1">
                          {order.quantity} {order.productUnit} @ ₹{order.pricePerUnit}/{order.productUnit}
                        </p>
                        {order.notes && <p className="text-xs text-sage-400 italic mt-1">"{order.notes}"</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-primary-700">
                          ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-sage-400 mt-0.5">{order.date}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs text-sage-500 mb-4 pb-4 border-b border-sage-50">
                      {order.farmerName && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> {order.farmerName}
                          {order.farmerCity && ` · ${order.farmerCity}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {order.date} at {order.time}
                      </span>
                    </div>

                    {/* Progress */}
                    <OrderProgress status={order.status} />

                    {/* Cancel button — only for PENDING or CONFIRMED */}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <div className="mt-4 pt-4 border-t border-sage-50 flex items-center justify-between">
                        <p className="text-xs text-sage-400">
                          {order.status === 'PENDING' ? 'Waiting for confirmation' : 'Order confirmed — not yet shipped'}
                        </p>
                        <button
                          onClick={() => setCancelTarget(order.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200
                                     rounded-xl text-xs font-semibold hover:bg-red-100 transition-all duration-200"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cancel confirm dialog */}
      {cancelTarget && (
        <CancelConfirmDialog
          onConfirm={async () => {
            try {
              await cancelOrder(cancelTarget);
              toast.success('Order cancelled');
              getBuyerOrders()
                .then(res => setOrders(res.data.data || []))
                .catch(() => {});
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to cancel');
            } finally {
              setCancelTarget(null);
            }
          }}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
