import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, TrendingUp, Shield, Truck, BarChart3, Users, CheckCircle2,
  MapPin, ArrowRight, Plane, Hotel, Car, LogIn, UserPlus, ChevronUp,
  ChevronDown,
} from 'lucide-react';

/* ── Scroll reveal ─────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    const els = ref.current?.querySelectorAll('.reveal');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Demo price ticker ─────────────────────────────── */
const DEMO_PRICES = [
  { product: 'Makhana Premium',  grade: 'Grade A',  price: 680, district: 'Darbhanga',  age: '2 min ago',  trend: 'up'   },
  { product: 'Makhana Standard', grade: 'Grade B',  price: 520, district: 'Madhubani',  age: '8 min ago',  trend: 'down' },
  { product: 'Makhana Premium',  grade: 'Grade A+', price: 720, district: 'Sitamarhi',  age: '14 min ago', trend: 'up'   },
  { product: 'Makhana Economy',  grade: 'Grade C',  price: 390, district: 'Darbhanga',  age: '22 min ago', trend: 'same' },
  { product: 'Makhana Standard', grade: 'Grade B+', price: 560, district: 'Supaul',     age: '31 min ago', trend: 'up'   },
];

function PriceTicker() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % DEMO_PRICES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-white rounded-2xl shadow-soft-lg border border-sage-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100 bg-primary-50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Live Prices</span>
        </div>
        <span className="text-xs text-sage-500">{DEMO_PRICES.length} active listings</span>
      </div>
      <div className="divide-y divide-sage-50">
        {DEMO_PRICES.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: active === i ? 'rgba(52,161,94,0.05)' : 'rgba(255,255,255,0)',
              opacity: active === i ? 1 : 0.65,
            }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between px-4 py-3 gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.product}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-sage-500 bg-sage-100 px-1.5 py-0.5 rounded-md">{p.grade}</span>
                <span className="flex items-center gap-0.5 text-xs text-sage-400">
                  <MapPin className="h-2.5 w-2.5" />{p.district}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-base font-bold ${
                p.trend === 'up' ? 'text-green-600' : p.trend === 'down' ? 'text-red-500' : 'text-gray-800'
              }`}>
                ₹{p.price}<span className="text-xs font-normal text-sage-400">/kg</span>
              </p>
              <p className="text-xs text-sage-400 mt-0.5">{p.age}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="px-4 py-2.5 bg-sage-50 border-t border-sage-100">
        <p className="text-xs text-sage-400 text-center">Updated in real-time from verified farmers</p>
      </div>
    </div>
  );
}

/* ── How it works steps ────────────────────────────── */
const STEPS = [
  { number: '01', title: 'Farmers Post Live Prices', color: 'bg-primary-600',
    desc: 'Verified makhana farmers across Bihar update their prices in real-time — grades, quantities, and districts, all transparent.' },
  { number: '02', title: 'You Compare & Order',      color: 'bg-blue-600',
    desc: 'Browse prices across districts, filter by grade, and place your order in under a minute — no phone calls needed.' },
  { number: '03', title: 'We Deliver to Your City',  color: 'bg-orange-500',
    desc: 'AgroTrade coordinates everything with the farmer — logistics, quality check, and doorstep delivery.' },
];

/* ── Makhana pond scene — hero background ─────────── */
function MakhanaPondScene() {
  return (
    <svg
      viewBox="0 0 1200 700"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ opacity: 0.13 }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* ── Water ripple rings ── */}
      <ellipse cx="900" cy="500" rx="160" ry="40" fill="none" stroke="#27854a" strokeWidth="1.5" opacity="0.6"/>
      <ellipse cx="900" cy="500" rx="110" ry="27" fill="none" stroke="#27854a" strokeWidth="1"   opacity="0.5"/>
      <ellipse cx="900" cy="500" rx="65"  ry="16" fill="none" stroke="#27854a" strokeWidth="1"   opacity="0.4"/>
      <ellipse cx="200" cy="580" rx="120" ry="30" fill="none" stroke="#27854a" strokeWidth="1.5" opacity="0.5"/>
      <ellipse cx="200" cy="580" rx="75"  ry="18" fill="none" stroke="#27854a" strokeWidth="1"   opacity="0.4"/>
      <ellipse cx="600" cy="620" rx="90"  ry="22" fill="none" stroke="#27854a" strokeWidth="1"   opacity="0.4"/>

      {/* ── Large makhana leaf — bottom right ── */}
      <g transform="translate(820, 350) rotate(-15)">
        <ellipse cx="0" cy="0" rx="130" ry="120" fill="#27854a" opacity="0.9"/>
        {/* notch in leaf */}
        <path d="M0 -120 L-15 -90 L15 -90 Z" fill="#f0fdf4" opacity="1"/>
        {/* veins */}
        <line x1="0" y1="-120" x2="0" y2="120"   stroke="#1a5c34" strokeWidth="2.5" opacity="0.6"/>
        <line x1="0" y1="0"   x2="-100" y2="-50" stroke="#1a5c34" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="0"   x2="100"  y2="-50" stroke="#1a5c34" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="0"   x2="-120" y2="10"  stroke="#1a5c34" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="0"   x2="120"  y2="10"  stroke="#1a5c34" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="0"   x2="-90"  y2="70"  stroke="#1a5c34" strokeWidth="1.5" opacity="0.4"/>
        <line x1="0" y1="0"   x2="90"   y2="70"  stroke="#1a5c34" strokeWidth="1.5" opacity="0.4"/>
        <line x1="0" y1="20"  x2="-50"  y2="105" stroke="#1a5c34" strokeWidth="1"   opacity="0.35"/>
        <line x1="0" y1="20"  x2="50"   y2="105" stroke="#1a5c34" strokeWidth="1"   opacity="0.35"/>
        {/* stem */}
        <line x1="0" y1="120" x2="0" y2="200" stroke="#1a5c34" strokeWidth="3" opacity="0.5"/>
      </g>

      {/* ── Medium makhana leaf — bottom left ── */}
      <g transform="translate(150, 480) rotate(20)">
        <ellipse cx="0" cy="0" rx="90" ry="82" fill="#27854a" opacity="0.85"/>
        <path d="M0 -82 L-10 -60 L10 -60 Z" fill="#f0fdf4" opacity="1"/>
        <line x1="0" y1="-82" x2="0" y2="82"   stroke="#1a5c34" strokeWidth="2"   opacity="0.6"/>
        <line x1="0" y1="0"   x2="-75" y2="-30" stroke="#1a5c34" strokeWidth="1.2" opacity="0.5"/>
        <line x1="0" y1="0"   x2="75"  y2="-30" stroke="#1a5c34" strokeWidth="1.2" opacity="0.5"/>
        <line x1="0" y1="0"   x2="-82" y2="5"   stroke="#1a5c34" strokeWidth="1.2" opacity="0.5"/>
        <line x1="0" y1="0"   x2="82"  y2="5"   stroke="#1a5c34" strokeWidth="1.2" opacity="0.5"/>
        <line x1="0" y1="0"   x2="-60" y2="55"  stroke="#1a5c34" strokeWidth="1.2" opacity="0.4"/>
        <line x1="0" y1="0"   x2="60"  y2="55"  stroke="#1a5c34" strokeWidth="1.2" opacity="0.4"/>
        <line x1="0" y1="82"  x2="0"   y2="150" stroke="#1a5c34" strokeWidth="2.5" opacity="0.5"/>
      </g>

      {/* ── Small leaf — top right ── */}
      <g transform="translate(1050, 120) rotate(-25)">
        <ellipse cx="0" cy="0" rx="60" ry="55" fill="#27854a" opacity="0.7"/>
        <path d="M0 -55 L-8 -38 L8 -38 Z" fill="#f0fdf4" opacity="1"/>
        <line x1="0" y1="-55" x2="0" y2="55"   stroke="#1a5c34" strokeWidth="1.5" opacity="0.6"/>
        <line x1="0" y1="0"   x2="-50" y2="-20" stroke="#1a5c34" strokeWidth="1"   opacity="0.5"/>
        <line x1="0" y1="0"   x2="50"  y2="-20" stroke="#1a5c34" strokeWidth="1"   opacity="0.5"/>
        <line x1="0" y1="0"   x2="-52" y2="8"   stroke="#1a5c34" strokeWidth="1"   opacity="0.5"/>
        <line x1="0" y1="0"   x2="52"  y2="8"   stroke="#1a5c34" strokeWidth="1"   opacity="0.5"/>
        <line x1="0" y1="55"  x2="0"   y2="110" stroke="#1a5c34" strokeWidth="2"   opacity="0.5"/>
      </g>

      {/* ── Tiny leaf — left side ── */}
      <g transform="translate(60, 250) rotate(35)">
        <ellipse cx="0" cy="0" rx="45" ry="40" fill="#27854a" opacity="0.65"/>
        <line x1="0" y1="-40" x2="0" y2="40"  stroke="#1a5c34" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="0"  x2="-38" y2="-12" stroke="#1a5c34" strokeWidth="1"  opacity="0.4"/>
        <line x1="0" y1="0"  x2="38"  y2="-12" stroke="#1a5c34" strokeWidth="1"  opacity="0.4"/>
        <line x1="0" y1="40" x2="0"   y2="90"  stroke="#1a5c34" strokeWidth="2"  opacity="0.4"/>
      </g>

      {/* ── Makhana seeds (small white-ish circles) scattered ── */}
      {/* cluster near big leaf */}
      <circle cx="760" cy="440" r="7"  fill="#4ade80" opacity="0.7"/>
      <circle cx="775" cy="455" r="5"  fill="#4ade80" opacity="0.6"/>
      <circle cx="755" cy="465" r="6"  fill="#4ade80" opacity="0.65"/>
      <circle cx="780" cy="435" r="4"  fill="#4ade80" opacity="0.55"/>
      {/* cluster bottom left */}
      <circle cx="250" cy="560" r="6"  fill="#4ade80" opacity="0.6"/>
      <circle cx="265" cy="550" r="4"  fill="#4ade80" opacity="0.5"/>
      <circle cx="240" cy="545" r="5"  fill="#4ade80" opacity="0.55"/>
      {/* scattered top */}
      <circle cx="500" cy="80"  r="5"  fill="#4ade80" opacity="0.45"/>
      <circle cx="520" cy="95"  r="4"  fill="#4ade80" opacity="0.4"/>
      <circle cx="480" cy="100" r="6"  fill="#4ade80" opacity="0.5"/>
      {/* mid right */}
      <circle cx="1000" cy="300" r="5" fill="#4ade80" opacity="0.45"/>
      <circle cx="1015" cy="290" r="4" fill="#4ade80" opacity="0.4"/>
      {/* floating singles */}
      <circle cx="350" cy="150" r="4"  fill="#4ade80" opacity="0.4"/>
      <circle cx="650" cy="200" r="5"  fill="#4ade80" opacity="0.45"/>
      <circle cx="900" cy="160" r="4"  fill="#4ade80" opacity="0.4"/>
      <circle cx="120" cy="400" r="5"  fill="#4ade80" opacity="0.4"/>

      {/* ── Makhana plant stalks ── */}
      <line x1="820" y1="550" x2="820" y2="650" stroke="#27854a" strokeWidth="2.5" opacity="0.4"/>
      <line x1="150" y1="630" x2="150" y2="700" stroke="#27854a" strokeWidth="2"   opacity="0.35"/>
      <line x1="1050" y1="220" x2="1050" y2="310" stroke="#27854a" strokeWidth="2" opacity="0.35"/>
    </svg>
  );
}

/* ── Scroll to top button ──────────────────────────── */
function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary-600 text-white
                     flex items-center justify-center shadow-soft-lg hover:bg-primary-700
                     hover:shadow-soft-lg transition-all duration-200"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function Home() {
  const pageRef    = useScrollReveal();
  const [scrolled, setScrolled] = useState(false);

  /* Transparent navbar becomes frosted on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen relative">

      {/* ── Global dot pattern — lowest layer ─── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2327854a' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#ffffff',
        }}
      />

      {/* ── NAVBAR ── sticky: stays at top as user scrolls ── */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'sticky', top: 0, zIndex: 100 }}
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 backdrop-blur-md border-b border-sage-200 shadow-soft'
            : 'bg-white/90 backdrop-blur-sm border-b border-sage-100 shadow-soft'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              AgroTrade
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200
                         text-sage-700 border-sage-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-soft hover:shadow-soft-md transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Semi-transparent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/85 via-cream-100/85 to-sage-50/85 pointer-events-none" />

        {/* Makhana pond scene — full width background */}
        <MakhanaPondScene />

        {/* Soft colour blobs */}
        <div className="absolute top-20 right-20 w-56 h-56 bg-primary-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-sage-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full" style={{ zIndex: 2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — headline + CTA */}
            <div>
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold mb-6 uppercase tracking-wider border border-primary-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                India's Makhana Marketplace
              </motion.div>

              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-gray-900 leading-tight mb-5"
              >
                Live makhana prices<br />
                <span className="text-primary-600">from Bihar's farmers.</span><br />
                <span className="text-gray-500 text-2xl sm:text-3xl md:text-4xl font-sans font-semibold">No trips. No middlemen.</span>
              </motion.h1>

              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-sage-600 text-lg mb-8 max-w-lg leading-relaxed"
              >
                50+ verified farmers across Darbhanga, Madhubani &amp; Sitamarhi — compare real-time prices and order without leaving your city.
              </motion.p>

              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    className="px-7 py-3.5 gradient-animated text-white rounded-xl font-semibold text-base
                               flex items-center gap-2 shadow-soft-lg shadow-primary-200/50"
                  >
                    Start Sourcing <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  href="#how-it-works"
                  className="px-7 py-3.5 bg-white border-2 border-sage-200 text-sage-700 rounded-xl
                             font-medium hover:border-primary-300 hover:bg-cream-50 text-base
                             transition-all duration-200 shadow-soft"
                >
                  See How It Works
                </motion.a>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex flex-wrap items-center gap-5"
              >
                {['50+ Verified Farmers', '5 Districts Covered', 'Free to Join'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-sage-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — price ticker (above leaf z-index) */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', damping: 20 }}
              style={{ position: 'relative', zIndex: 3 }}
            >
              <PriceTicker />
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { value: '24/7', label: 'Live updates'   },
                  { value: '₹0',   label: 'Travel cost'    },
                  { value: '<1m',  label: 'To place order' },
                ].map((s) => (
                  <div key={s.label} className="card p-3 text-center">
                    <p className="text-lg font-bold text-primary-600">{s.value}</p>
                    <p className="text-xs text-sage-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-sage-400"
          style={{ zIndex: 2 }}
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/95 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(239,68,68,0.07),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              The Old Way
            </span>
            <h2 className="text-4xl md:text-5xl font-display text-white leading-tight mb-6">
              Sourcing makhana used to mean<br />
              <span className="text-red-400">burning ₹20,000 before buying 1 kg</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Travel, hotels, negotiations, no price guarantee — all before a single deal was closed. Every. Single. Time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Plane, title: 'Travel to Bihar', cost: '₹5K–₹15K', desc: 'Flight or train to Darbhanga just to meet farmers. Repeated every time prices changed.' },
              { icon: Hotel, title: 'Hotel + Stay',    cost: '₹3K–₹8K',  desc: '3–5 days on the ground — visiting farms, negotiating, checking stock quality manually.' },
              { icon: Car,   title: 'Zero Guarantee',  cost: '₹0 return', desc: 'After spending ₹20K+ you still might leave with the wrong price or no deal at all.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -5 }}
                className="reveal bg-white/5 rounded-2xl p-8 border border-white/8 hover:border-red-400/30 transition-all duration-200"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-2xl font-bold text-red-400 mb-3">{item.cost}</p>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-cream-50/85 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16 reveal">
            <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-3">The new way</p>
            <h2 className="text-4xl md:text-5xl font-display text-gray-900 mb-4">How AgroTrade works</h2>
            <p className="text-sage-500 text-lg max-w-xl mx-auto">Three steps. No flights. No hotels. No wasted days.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                whileHover={{ y: -6 }}
                className="reveal card p-8 card-hover"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-soft-md`}>
                  <span className="text-xl font-black text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sage-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-10 reveal">
            <h3 className="text-3xl md:text-4xl font-display text-gray-900 mb-3">What's on the Platform</h3>
            <p className="text-sage-500 text-lg">Everything you need to source makhana — from your phone, in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: TrendingUp, title: 'Real-Time Prices',     bg: 'bg-primary-50 border-primary-200', ic: 'text-primary-600', desc: 'Prices update the moment a farmer posts. Always current, never stale.' },
              { icon: BarChart3,  title: 'Price History Charts', bg: 'bg-blue-50 border-blue-200',       ic: 'text-blue-600',    desc: 'See how prices moved over days and weeks. Buy at the right time, not just any time.' },
              { icon: MapPin,     title: 'District-Level Data',  bg: 'bg-pink-50 border-pink-200',       ic: 'text-pink-600',    desc: 'Filter by Darbhanga, Madhubani, Sitamarhi — each region has a distinct grade and price point.' },
              { icon: Shield,     title: 'Quality Guaranteed',   bg: 'bg-violet-50 border-violet-200',   ic: 'text-violet-600',  desc: 'Every farmer is field-verified. Grade-matched and price-locked before dispatch.' },
              { icon: Truck,      title: 'Logistics Handled',    bg: 'bg-orange-50 border-orange-200',   ic: 'text-orange-600',  desc: 'We coordinate delivery from farm to your warehouse — no cold calls, no middlemen.' },
              { icon: Users,      title: '50+ Farmer Network',   bg: 'bg-amber-50 border-amber-200',     ic: 'text-amber-600',   desc: 'The largest verified makhana sourcing network across Bihar, growing every week.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`reveal p-6 rounded-2xl border-2 ${f.bg} hover:shadow-soft-md transition-all duration-200 cursor-default`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <f.icon className={`h-6 w-6 ${f.ic} mb-3`} />
                <h4 className="text-base font-bold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-sage-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BUYERS CHOOSE US ─────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-900 via-sage-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-sage-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16 reveal">
            <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm font-semibold mb-4 border border-primary-500/30">
              The AgroTrade Advantage
            </span>
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">Why Buyers Choose Us</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Every feature is built around one goal — making makhana sourcing predictable, protected, and profitable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp,   title: 'Price Locked at Order',  accent: 'text-green-400',  bg: 'bg-green-500/10',  border: 'hover:border-green-500/40',  desc: 'The price you see is the price you pay. Zero last-minute rate changes or surprise markups.' },
              { icon: CheckCircle2, title: 'Verified Farmers Only',  accent: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'hover:border-blue-500/40',   desc: 'Every farmer on the platform is physically verified by our field team before they can list.' },
              { icon: BarChart3,    title: 'Always Fresh Data',      accent: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'hover:border-amber-500/40',  desc: 'Stale listings are auto-flagged. You only see prices that are current and relevant right now.' },
              { icon: Truck,        title: 'We Handle Logistics',    accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/40', desc: 'From Darbhanga to your city — transport coordinated by us. No cold calls, no middlemen.' },
              { icon: MapPin,       title: 'Multi-District Access',  accent: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'hover:border-pink-500/40',   desc: 'Compare rates from Darbhanga, Madhubani, Sitamarhi instantly — all in one place.' },
              { icon: Shield,       title: 'Quality Assurance',      accent: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/40', desc: 'Grade-matched and QC-checked before dispatch. What you order is exactly what you receive.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`reveal bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 ${item.border} transition-all duration-200 cursor-default`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bg} mb-5 ${item.accent}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
            {[
              { value: '100%', label: 'Price Transparency' },
              { value: '5 days', label: 'Dispute Resolution' },
              { value: '50+', label: 'Verified Farmers' },
              { value: '₹0', label: 'Hidden Charges' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-primary-400">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ──────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/85 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-display text-gray-900 mb-4">Our Vision</h2>
            <p className="text-sage-500 text-lg">Building India's most trusted agro platform — one step at a time.</p>
          </div>
          <div className="space-y-0">
            {[
              { phase: '1', title: 'Live Marketplace',     status: 'Live Now',    active: true,  desc: 'Real-time prices, district filtering, instant ordering. Connecting buyers to farmers digitally.' },
              { phase: '2', title: 'Price History Charts', status: 'Coming Soon', active: false, desc: 'Interactive charts showing price trends per product and farmer over days and weeks.' },
              { phase: '3', title: 'Sample & QC System',   status: 'Planned',     active: false, desc: 'QR-tagged samples, golden sample storage, quality evaluation before bulk orders.' },
              { phase: '4', title: 'Escrow & Payments',    status: 'Planned',     active: false, desc: 'Secure escrow — funds release only after delivery confirmation. Disputes resolved in 5 days.' },
              { phase: '5', title: 'Multi-Commodity',      status: 'Future',      active: false, desc: 'Beyond makhana — rice, spices, pulses. Same trust layer across all agro commodities.' },
            ].map((item, i) => (
              <div key={item.phase} className="reveal flex gap-6" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-base shadow-soft transition-all duration-200 ${
                      item.active ? 'gradient-animated text-white' : 'bg-sage-50 border-2 border-sage-200 text-sage-400'
                    }`}
                  >
                    {item.phase}
                  </motion.div>
                  {i < 4 && <div className={`w-0.5 flex-1 mt-2 rounded-full ${item.active ? 'bg-primary-200' : 'bg-sage-100'}`} style={{ minHeight: '36px' }} />}
                </div>
                <div className="pb-10">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    <span className={`badge ${item.active ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-sage-100 text-sage-500 border border-sage-200'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sage-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/85 via-cream-100/85 to-sage-50/85 pointer-events-none" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative reveal">
          <h2 className="text-4xl md:text-5xl font-display text-gray-900 mb-4">Ready to source smarter?</h2>
          <p className="text-sage-500 text-lg mb-10 max-w-xl mx-auto">
            Join buyers saving ₹15,000+ per sourcing cycle. No travel, no hassle — just makhana at the right price.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="px-8 py-4 gradient-animated text-white rounded-2xl font-bold text-lg
                           flex items-center gap-2 shadow-soft-lg shadow-primary-200/50"
              >
                <LogIn className="h-5 w-5" /> Sign In
              </Link>
            </motion.div>
            <Link
              to="/register"
              className="px-8 py-4 bg-white border-2 border-sage-200 text-sage-700 rounded-2xl font-medium
                         hover:border-primary-300 hover:bg-cream-50 text-lg flex items-center gap-2
                         shadow-soft transition-all duration-200"
            >
              <UserPlus className="h-5 w-5" /> Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold text-white tracking-tight">AgroTrade</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                India's first makhana marketplace connecting Bihar's farmers directly to buyers across the country — no middlemen, no travel.
              </p>
              <div className="flex items-center gap-3">
                <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs">
                  Live Marketplace
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Live Prices',    href: '/prices'   },
                  { label: 'Sign In',        href: '/login'    },
                  { label: 'Create Account', href: '/register' },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-white/40 text-sm hover:text-primary-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Products</h4>
              <ul className="space-y-2.5">
                {[
                  'Makhana Premium (Grade A)',
                  'Makhana Standard (Grade B)',
                  'Makhana Economy (Grade C)',
                  'Raw Makhana Seeds',
                  'Organic Certified',
                ].map(p => (
                  <li key={p} className="text-white/40 text-sm">{p}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2.5 text-white/40 text-sm">
                <li>Email: support@agrotrade.in</li>
                <li>Phone: +91 98765 43210</li>
                <li>Location: Darbhanga, Bihar, India</li>
              </ul>
              <div className="mt-5">
                <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Sourcing Districts</h5>
                <div className="flex flex-wrap gap-1.5">
                  {['Darbhanga', 'Madhubani', 'Sitamarhi', 'Supaul', 'Saharsa'].map(d => (
                    <span key={d} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-md border border-white/10">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-xs">
                © {new Date().getFullYear()} AgroTrade. All rights reserved. Built for Indian farmers and buyers.
              </p>
              <div className="flex items-center gap-4 text-white/30 text-xs">
                <span className="hover:text-white/50 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white/50 cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-white/50 cursor-pointer transition-colors">Refund Policy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Scroll to top ─────────────────────────────── */}
      <ScrollToTop />
    </div>
  );
}
