import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Package, Users, ArrowRight, Sun, Sunset, Moon } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: Sun };
  if (h < 17) return { text: 'Good afternoon', icon: Sun };
  if (h < 20) return { text: 'Good evening', icon: Sunset };
  return { text: 'Good night', icon: Moon };
}

const roleColors = {
  BUYER:  'bg-blue-50 text-blue-700 border border-blue-200',
  FARMER: 'bg-primary-50 text-primary-700 border border-primary-200',
  ADMIN:  'bg-violet-50 text-violet-700 border border-violet-200',
};

export default function Dashboard() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const GreetIcon = greeting.icon;

  const farmerLinks = [
    { to: '/farmer/prices',        label: 'My Price Listings', icon: TrendingUp,   desc: 'View and manage your posted prices',          color: 'bg-primary-50 group-hover:bg-primary-100' },
    { to: '/farmer/add-price',     label: 'Add New Price',     icon: Package,      desc: 'Post a new makhana price listing',            color: 'bg-green-50  group-hover:bg-green-100'   },
    { to: '/farmer/orders',        label: 'Orders Received',   icon: ShoppingCart, desc: 'View and manage orders from buyers',          color: 'bg-amber-50  group-hover:bg-amber-100'   },
    { to: '/farmer/price-history', label: 'Price History',     icon: TrendingUp,   desc: 'See all your past price changes over time',   color: 'bg-blue-50   group-hover:bg-blue-100'    },
  ];

  const buyerLinks = [
    { to: '/prices',       label: 'Browse Live Prices', icon: TrendingUp,   desc: 'Compare real-time makhana prices from 50+ verified farmers', color: 'bg-primary-50 group-hover:bg-primary-100' },
    { to: '/buyer/orders', label: 'My Orders',          icon: ShoppingCart, desc: 'Track your placed orders and delivery status',               color: 'bg-amber-50  group-hover:bg-amber-100'   },
  ];

  const adminLinks = [
    { to: '/admin',          label: 'Manage Orders',      icon: ShoppingCart, desc: 'View and update all platform orders',                       color: 'bg-primary-50 group-hover:bg-primary-100' },
    { to: '/admin/products', label: 'Manage Products',    icon: Package,      desc: 'Add or edit product catalog',                               color: 'bg-blue-50   group-hover:bg-blue-100'    },
    { to: '/admin/users',    label: 'Manage Users',       icon: Users,        desc: 'Onboard farmers — single or bulk Excel upload',             color: 'bg-violet-50 group-hover:bg-violet-100'  },
    { to: '/admin/prices',   label: 'Add / Update Price', icon: TrendingUp,   desc: 'View, edit and post prices on behalf of farmers',          color: 'bg-green-50  group-hover:bg-green-100'   },
  ];

  const links = user.role === 'FARMER' ? farmerLinks
              : user.role === 'BUYER'  ? buyerLinks
              : adminLinks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Welcome banner ── */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-soft-md">
        {/* makhana leaf watermark */}
        <svg viewBox="0 0 300 360" className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-52 opacity-10 pointer-events-none" aria-hidden="true">
          {/* Main leaf body */}
          <path d="M150 10 C60 10, 5 70, 5 150 C5 230, 60 290, 150 290 C240 290, 295 230, 295 150 C295 70, 240 10, 150 10 Z" fill="white"/>
          {/* Notch at top */}
          <path d="M150 10 L138 38 L162 38 Z" fill="#16a34a"/>
          {/* Central vein */}
          <line x1="150" y1="10"  x2="150" y2="290" stroke="#86efac" strokeWidth="4"   opacity="0.8"/>
          {/* Side veins */}
          <line x1="150" y1="150" x2="30"  y2="80"  stroke="#86efac" strokeWidth="2.5" opacity="0.7"/>
          <line x1="150" y1="150" x2="270" y2="80"  stroke="#86efac" strokeWidth="2.5" opacity="0.7"/>
          <line x1="150" y1="150" x2="10"  y2="150" stroke="#86efac" strokeWidth="2.5" opacity="0.7"/>
          <line x1="150" y1="150" x2="290" y2="150" stroke="#86efac" strokeWidth="2.5" opacity="0.7"/>
          <line x1="150" y1="150" x2="35"  y2="220" stroke="#86efac" strokeWidth="2"   opacity="0.6"/>
          <line x1="150" y1="150" x2="265" y2="220" stroke="#86efac" strokeWidth="2"   opacity="0.6"/>
          <line x1="150" y1="200" x2="80"  y2="270" stroke="#86efac" strokeWidth="1.5" opacity="0.5"/>
          <line x1="150" y1="200" x2="220" y2="270" stroke="#86efac" strokeWidth="1.5" opacity="0.5"/>
          {/* Stem */}
          <line x1="150" y1="290" x2="150" y2="350" stroke="#86efac" strokeWidth="5"   opacity="0.6"/>

          {/* ── Makhana flower in center of leaf ── */}
          {/* Leaf-shaped petals using cubic bezier paths, 8 petals */}
          {/* Each petal: pointed tip, wide base, natural curve */}
          <g transform="translate(150,148)">
            {/* Petal 1 - top */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92"/>
            {/* Petal 2 - top right */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(45)"/>
            {/* Petal 3 - right */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(90)"/>
            {/* Petal 4 - bottom right */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(135)"/>
            {/* Petal 5 - bottom */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(180)"/>
            {/* Petal 6 - bottom left */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(225)"/>
            {/* Petal 7 - left */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(270)"/>
            {/* Petal 8 - top left */}
            <path d="M0,0 C-8,-12 -5,-28 0,-34 C5,-28 8,-12 0,0 Z" fill="white" opacity="0.92" transform="rotate(315)"/>
            {/* Inner smaller petals offset by 22.5° */}
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(22.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(67.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(112.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(157.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(202.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(247.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(292.5)"/>
            <path d="M0,0 C-5,-8 -4,-20 0,-24 C4,-20 5,-8 0,0 Z" fill="white" opacity="0.85" transform="rotate(337.5)"/>
            {/* Center stamen */}
            <circle r="8"   fill="#fef08a" opacity="0.95"/>
            <circle r="4.5" fill="#fbbf24" opacity="1"/>
            {/* Stamen dots */}
            <circle cx="0"    cy="-6.5" r="1.2" fill="white" opacity="0.9"/>
            <circle cx="4.6"  cy="-4.6" r="1.2" fill="white" opacity="0.9"/>
            <circle cx="6.5"  cy="0"    r="1.2" fill="white" opacity="0.9"/>
            <circle cx="4.6"  cy="4.6"  r="1.2" fill="white" opacity="0.9"/>
            <circle cx="0"    cy="6.5"  r="1.2" fill="white" opacity="0.9"/>
            <circle cx="-4.6" cy="4.6"  r="1.2" fill="white" opacity="0.9"/>
            <circle cx="-6.5" cy="0"    r="1.2" fill="white" opacity="0.9"/>
            <circle cx="-4.6" cy="-4.6" r="1.2" fill="white" opacity="0.9"/>
          </g>

          {/* Makhana seed dots floating near leaf */}
          <circle cx="80"  cy="130" r="6"  fill="white" opacity="0.6"/>
          <circle cx="220" cy="120" r="5"  fill="white" opacity="0.5"/>
          <circle cx="70"  cy="190" r="4"  fill="white" opacity="0.5"/>
          <circle cx="230" cy="185" r="6"  fill="white" opacity="0.55"/>
          <circle cx="110" cy="250" r="5"  fill="white" opacity="0.45"/>
          <circle cx="195" cy="255" r="4"  fill="white" opacity="0.45"/>
        </svg>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <GreetIcon className="h-5 w-5 text-primary-200" />
            <span className="text-primary-200 text-sm font-medium">{greeting.text}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display text-white">{user.fullName}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`badge text-xs font-semibold bg-white/20 text-white border border-white/30`}>
              {user.role}
            </span>
            <span className="text-primary-100 text-sm">
              {user.role === 'FARMER' && 'Manage your makhana listings and view incoming orders.'}
              {user.role === 'BUYER'  && 'Compare live prices and order the best makhana from Bihar.'}
              {user.role === 'ADMIN'  && 'Manage the platform — orders, products, and users.'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick actions grid ── */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-sage-600 uppercase tracking-wider mb-4">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group block p-6 bg-white rounded-2xl shadow-soft border border-sage-100
                       hover:border-primary-200 hover:shadow-soft-md hover:-translate-y-0.5
                       transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${link.color} transition-colors duration-200`}>
                <link.icon className="h-5 w-5 text-primary-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-sage-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{link.label}</h3>
            <p className="text-sm text-sage-500 leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Buyer: market tip ── */}
      {user.role === 'BUYER' && (
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-800 text-sm mb-1">How ordering works</h3>
            <p className="text-primary-700 text-sm leading-relaxed">
              Browse live prices → compare grades and districts → place your order. AgroTrade handles logistics and quality checks. Your price is locked the moment you order.
            </p>
          </div>
          <Link to="/prices" className="flex-shrink-0 btn-primary text-xs py-2 px-4">
            Browse Prices
          </Link>
        </div>
      )}
    </div>
  );
}
