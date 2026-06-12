import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Leaf, LogIn, Eye, EyeOff } from 'lucide-react';

/* ── Botanical leaf SVG — agri background decoration ─ */
function LeafBg() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute pointer-events-none select-none"
      style={{ width: 520, height: 520, opacity: 0.09, top: '-60px', left: '-80px', transform: 'rotate(-20deg)' }}
      aria-hidden="true"
    >
      {/* Main leaf body — makhana/lotus leaf, broad and circular */}
      <path
        d="M200 20 C80 20, 10 100, 10 200 C10 300, 80 380, 200 380 C320 380, 390 300, 390 200 C390 100, 320 20, 200 20 Z"
        fill="#27854a"
      />
      {/* Central vein */}
      <path d="M200 380 L200 20" stroke="#1a5c34" strokeWidth="4" fill="none" opacity="0.5" />
      {/* Side veins */}
      <path d="M200 200 L60 120"  stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L340 120" stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L40 200"  stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L360 200" stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L60 290"  stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L340 290" stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 260 L120 340" stroke="#1a5c34" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M200 260 L280 340" stroke="#1a5c34" strokeWidth="2" fill="none" opacity="0.3" />
    </svg>
  );
}

function SmallLeafBg() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute pointer-events-none select-none"
      style={{ width: 280, height: 280, opacity: 0.06, bottom: '-40px', right: '-50px', transform: 'rotate(160deg)' }}
      aria-hidden="true"
    >
      <path
        d="M200 20 C80 20, 10 100, 10 200 C10 300, 80 380, 200 380 C320 380, 390 300, 390 200 C390 100, 320 20, 200 20 Z"
        fill="#27854a"
      />
      <path d="M200 380 L200 20" stroke="#1a5c34" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M200 200 L60 120"  stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L340 120" stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L40 200"  stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
      <path d="M200 200 L360 200" stroke="#1a5c34" strokeWidth="2.5" fill="none" opacity="0.4" />
    </svg>
  );
}

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [savedEmails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedEmails')) || []; }
    catch { return []; }
  });
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const emails = JSON.parse(localStorage.getItem('savedEmails') || '[]');
      if (!emails.includes(form.email)) {
        emails.unshift(form.email);
        localStorage.setItem('savedEmails', JSON.stringify(emails.slice(0, 5)));
      }
      const user = await login(form);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      setForm({ ...form, password: '' });
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a4731 0%, #0f2d1e 50%, #162b1e 100%)' }}
    >
      {/* ── Agri leaf decorations ── */}
      <LeafBg />
      <SmallLeafBg />

      {/* ── Subtle dot pattern overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Login card ── */}
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Green top band */}
          <div className="h-2 gradient-animated" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2.5 mb-8">
              <div className="p-2 rounded-xl bg-primary-100">
                <Leaf className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">AgroTrade</span>
            </div>

            <h1 className="text-2xl font-display text-gray-900 text-center mb-1">Welcome back</h1>
            <p className="text-sage-500 text-center text-sm mb-7">
              Sign in to access live makhana prices
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"
              >
                <span className="font-semibold">Error:</span> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email or Phone */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1.5">Email or Phone</label>
                <input
                  type="text" required list="email-suggestions" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`input-field ${error ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="you@example.com or 9876543210"
                  autoComplete="username"
                />
                <datalist id="email-suggestions">
                  {savedEmails.map((em) => <option key={em} value={em} />)}
                </datalist>
              </div>

              {/* Password with show/hide */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`input-field pr-11 ${error ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-sage-100" />
              <span className="text-xs text-sage-400">or</span>
              <div className="flex-1 h-px bg-sage-100" />
            </div>

            <p className="text-center text-sm text-sage-500">
              New here?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Create free account
              </Link>
            </p>

            <div className="mt-4 flex items-center justify-center gap-4">
              <Link
                to="/forgot-password"
                className="text-sm text-sage-400 hover:text-primary-600 transition-colors"
              >
                Forgot Password?
              </Link>
              <span className="text-sage-200">|</span>
              <Link
                to="/"
                className="text-sm text-sage-400 hover:text-sage-600 transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Below card note */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 AgroTrade — India's Makhana Marketplace
        </p>
      </motion.div>
    </div>
  );
}
