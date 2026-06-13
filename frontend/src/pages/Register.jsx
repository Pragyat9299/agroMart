import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';
import { STATES, BIHAR_DISTRICTS } from '../data/locations';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    role: 'BUYER', city: '', district: '', state: 'Bihar', address: '', pincode: '',
    yearsOfExperience: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      // Convert empty yearsOfExperience to null so backend doesn't choke on "" → Integer
      if (payload.yearsOfExperience === '' || payload.yearsOfExperience === null) {
        payload.yearsOfExperience = null;
      } else {
        payload.yearsOfExperience = parseInt(payload.yearsOfExperience, 10) || null;
      }
      const user = await register(payload);
      toast.success(`Welcome, ${user.fullName}! Account created.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const errors = err.response?.data?.data;
      if (errors && typeof errors === 'object') {
        Object.values(errors).forEach((e) => toast.error(e));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-sage-50 to-primary-50 py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 mb-4">
            <Leaf className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="text-3xl font-display text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-sage-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft-md border border-sage-100 p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-sage-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" required value={form.fullName} onChange={handleChange}
                className="input-field" placeholder="Rahul Kumar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Email <span className="text-sage-400 font-normal">(optional)</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                placeholder="9876543210" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" required value={form.password} onChange={handleChange}
                placeholder="Min 8 chars, 1 upper, 1 digit" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">I am a <span className="text-red-500">*</span></label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field">
                <option value="BUYER">Buyer</option>
                <option value="FARMER">Farmer / Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">State</label>
              <select name="state" value={form.state} onChange={handleChange} className="input-field">
                <option value="">Select State</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">District</label>
              {form.state === 'Bihar' ? (
                <select name="district" value={form.district} onChange={handleChange} className="input-field">
                  <option value="">Select District</option>
                  {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input type="text" name="district" value={form.district} onChange={handleChange}
                  placeholder="Enter district" className="input-field" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">City / Village</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Pincode</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-sage-700 mb-1">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="input-field" />
            </div>
            {form.role === 'FARMER' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Years of Experience in Makhana Farming
                </label>
                <input type="number" min="0" max="60" name="yearsOfExperience"
                  value={form.yearsOfExperience} onChange={handleChange}
                  className="input-field" placeholder="e.g. 5" />
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
