import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../api/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Leaf, Phone, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep]         = useState(1); // 1: enter phone, 2: enter OTP, 3: new password, 4: success
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoOtp, setDemoOtp]   = useState(''); // For demo: shows the OTP
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    setLoading(true);
    try {
      const res = await forgotPassword(phone);
      const otpFromResponse = res.data.data; // Demo only
      setDemoOtp(otpFromResponse);
      toast.success(res.data.message || 'OTP sent! Check your phone.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(phone, otp, newPassword);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a4731 0%, #0f2d1e 50%, #162b1e 100%)' }}>

      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 gradient-animated" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-primary-100">
                <Leaf className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">AgroTrade</span>
            </div>

            {/* ── Step 1: Enter Phone ── */}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Forgot Password?</h1>
                <p className="text-sage-500 text-center text-sm mb-7">
                  Enter your registered phone number. We'll send you an OTP.
                </p>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                      <input type="text" maxLength={10} required value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="input-field pl-10" placeholder="Enter 10-digit phone number" />
                    </div>
                    {phone && phone.length < 10 && (
                      <p className="text-xs text-sage-400 mt-1">{phone.length}/10 digits</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: Enter OTP ── */}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Enter OTP</h1>
                <p className="text-sage-500 text-center text-sm mb-4">
                  We sent a 6-digit OTP to ******{phone.slice(-4)}
                </p>

                {/* Demo: show OTP */}
                {demoOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-center">
                    <p className="text-xs text-amber-600 font-medium">Demo mode — your OTP is:</p>
                    <p className="text-2xl font-bold text-amber-800 tracking-widest mt-1">{demoOtp}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">OTP Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                      <input type="text" maxLength={6} required value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="input-field pl-10 text-center text-lg tracking-widest font-bold"
                        placeholder="• • • • • •" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setOtp(''); setDemoOtp(''); }}
                    className="w-full text-sm text-sage-400 hover:text-sage-600 transition-colors">
                    Resend OTP
                  </button>
                </form>
              </>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 3 && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Set New Password</h1>
                <p className="text-sage-500 text-center text-sm mb-7">
                  Min 8 characters, 1 uppercase, 1 lowercase, 1 digit.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                      <input type="password" required minLength={8} value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="input-field pl-10" placeholder="New password" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                      <input type="password" required value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="input-field pl-10" placeholder="Confirm password" />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 4: Success ── */}
            {step === 4 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-sage-500 text-sm mb-6">
                  Your password has been changed successfully. You can now login with your new password.
                </p>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  Go to Login
                </Link>
              </div>
            )}

            {/* Back to login link */}
            {step !== 4 && (
              <div className="mt-5 text-center">
                <Link to="/login"
                  className="text-sm text-sage-400 hover:text-sage-600 transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 AgroTrade — India's Makhana Marketplace
        </p>
      </motion.div>
    </div>
  );
}
