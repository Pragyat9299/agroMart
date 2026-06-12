import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LivePrices from './pages/LivePrices';
import Profile from './pages/Profile';
import AddPrice from './pages/farmer/AddPrice';
import MyPrices from './pages/farmer/MyPrices';
import FarmerOrders from './pages/farmer/FarmerOrders';
import PriceHistory from './pages/farmer/PriceHistory';
import BuyerOrders from './pages/buyer/BuyerOrders';
import AdminPanel from './pages/admin/AdminPanel';
import ManageProducts from './pages/admin/ManageProducts';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePrices from './pages/admin/ManagePrices';

/* Routes where the Navbar should be hidden
   (these pages have their own nav or full-screen layouts) */
const HIDE_NAVBAR = ['/', '/login', '/register', '/forgot-password'];

/* Routes where the Footer should be hidden */
const HIDE_FOOTER = ['/login', '/register', '/forgot-password'];

export default function App() {
  const location  = useLocation();
  const { user }  = useAuth();
  const hideNavbar = HIDE_NAVBAR.includes(location.pathname);
  const hideFooter = HIDE_FOOTER.includes(location.pathname);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1f2d1f',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontSize: '14px',
          },
        }}
      />
      {!hideNavbar && <Navbar />}

      <div className={`${!hideNavbar ? 'min-h-[calc(100vh-64px)] flex flex-col' : ''}`}>
        <div key={location.pathname} className="page-enter flex-1">
        <Routes location={location}>
          {/* ── Public ── */}
          {/* / is the landing page; if already logged in go straight to dashboard */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Home />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/prices" element={<LivePrices />} />

          {/* ── Protected — all logged-in users ── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* ── Farmer ── */}
          <Route path="/farmer/add-price"    element={<ProtectedRoute roles={['FARMER']}><AddPrice /></ProtectedRoute>} />
          <Route path="/farmer/prices"       element={<ProtectedRoute roles={['FARMER']}><MyPrices /></ProtectedRoute>} />
          <Route path="/farmer/orders"       element={<ProtectedRoute roles={['FARMER']}><FarmerOrders /></ProtectedRoute>} />
          <Route path="/farmer/price-history" element={<ProtectedRoute roles={['FARMER']}><PriceHistory /></ProtectedRoute>} />

          {/* ── Buyer ── */}
          <Route path="/buyer/orders" element={<ProtectedRoute roles={['BUYER']}><BuyerOrders /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin"          element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute roles={['ADMIN']}><ManageProducts /></ProtectedRoute>} />
          <Route path="/admin/users"    element={<ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/prices"   element={<ProtectedRoute roles={['ADMIN']}><ManagePrices /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}
