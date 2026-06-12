import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label, mobile = false) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`${mobile ? 'block w-full px-4 py-2.5' : 'px-3 py-1.5'} rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-primary-50 text-primary-700'
            : 'text-sage-600 hover:text-primary-700 hover:bg-sage-50'
        }`}
      >
        {label}
      </Link>
    );
  };

  const navLinks = (mobile = false) => (
    <>
      {navLink('/dashboard', 'Dashboard', mobile)}
      {navLink('/prices', 'Live Prices', mobile)}
      {user.role === 'FARMER' && navLink('/farmer/prices', 'My Listings', mobile)}
      {user.role === 'FARMER' && navLink('/farmer/orders', 'Orders', mobile)}
      {user.role === 'FARMER' && navLink('/farmer/price-history', 'Price History', mobile)}
      {user.role === 'BUYER'  && navLink('/buyer/orders', 'My Orders', mobile)}
      {user.role === 'ADMIN' && (
        <>
          {navLink('/admin',          'Orders', mobile)}
          {navLink('/admin/prices',   'Add / Update Price', mobile)}
          {navLink('/admin/users',    'Vendors', mobile)}
          {navLink('/admin/products', 'Products', mobile)}
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-sage-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo + nav links */}
          <div className="flex items-center gap-2">
            <Link
              to={user ? '/dashboard' : '/'}
              className="flex items-center gap-2 mr-4 group"
            >
              <Leaf className="h-7 w-7 text-primary-600 transition-transform duration-200 group-hover:rotate-6" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">AgroTrade</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks(false)}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-sage-700
                             hover:bg-sage-50 hover:text-primary-700 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{user.fullName}</span>
                  <span className="badge bg-primary-50 text-primary-700">{user.role}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sage-500
                             hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-sage-500 hover:bg-sage-50 transition-all duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-sage-600
                             hover:text-primary-700 hover:bg-sage-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile nav drawer */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-sage-100 bg-white/95 backdrop-blur-sm">
          <div className="px-3 py-3 space-y-1">
            {navLinks(true)}
          </div>
          <div className="border-t border-sage-100 px-4 py-3">
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-red-600
                         hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
