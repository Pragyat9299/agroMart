import { useState, useEffect } from 'react';
import { getProfile, updateProfile, changePassword } from '../api/profile';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { STATES, BIHAR_DISTRICTS } from '../data/locations';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [form, setForm] = useState({
    fullName: '', phone: '', address: '', city: '', district: '', state: '', pincode: '',
    yearsOfExperience: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res  = await getProfile();
      const data = res.data.data;
      setProfile(data);
      setForm({
        fullName: data.fullName || '', phone: data.phone || '', address: data.address || '',
        city: data.city || '', district: data.district || '', state: data.state || '',
        pincode: data.pincode || '', yearsOfExperience: data.yearsOfExperience?.toString() || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        ...form,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : null,
      });
      setProfile(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  const tabCls = (tab) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${
      activeTab === tab
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-sage-500 hover:text-gray-700 hover:border-sage-200'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b border-sage-100 mb-6">
        <button onClick={() => setActiveTab('profile')} className={tabCls('profile')}>
          <User className="h-4 w-4" /> Update Profile
        </button>
        <button onClick={() => setActiveTab('password')} className={tabCls('password')}>
          <Lock className="h-4 w-4" /> Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-6">
          <div className="mb-5 p-4 bg-sage-50 rounded-xl border border-sage-100">
            <p className="text-xs font-medium text-sage-500 uppercase tracking-wide">Email (cannot be changed)</p>
            <p className="font-semibold text-gray-900 mt-1">{profile.email}</p>
            <span className="badge bg-primary-100 text-primary-700 mt-1">{profile.role}</span>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'Phone',     key: 'phone',    type: 'tel'  },
                { label: 'City',      key: 'city',     type: 'text' },
                { label: 'Pincode',   key: 'pincode',  type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-sage-700 mb-1">{label}</label>
                  <input type={type} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">State</label>
                <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value, district: '' })} className="input-field">
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">District</label>
                {form.state === 'Bihar' ? (
                  <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field">
                    <option value="">Select District</option>
                    {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    placeholder="Enter district" className="input-field" />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-sage-700 mb-1">Address</label>
                <input type="text" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field" />
              </div>
              {profile.role === 'FARMER' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sage-700 mb-1">
                    Years of Experience in Makhana Farming
                  </label>
                  <input type="number" min="0" max="60"
                    value={form.yearsOfExperience}
                    onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
                    className="input-field" placeholder="e.g. 5" />
                </div>
              )}
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 p-6">
          <p className="text-sm text-sage-500 mb-6">
            Password must be at least 8 characters with 1 uppercase letter and 1 digit.
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            {[
              { label: 'Current Password', key: 'currentPassword', placeholder: '' },
              { label: 'New Password',     key: 'newPassword',     placeholder: 'Min 8 chars, 1 upper, 1 digit' },
              { label: 'Confirm Password', key: 'confirmPassword', placeholder: '' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-sage-700 mb-1">{label}</label>
                <input type="password" required value={passwordForm[key]} placeholder={placeholder}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  className="input-field" />
              </div>
            ))}
            <button type="submit" disabled={changingPassword}
              className="btn-primary px-6 py-2.5 bg-gray-800 hover:bg-gray-900">
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Account Status Section ── */}
      {profile && (
        <div className="mt-8 bg-white rounded-2xl shadow-soft border border-sage-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Account Status</h3>
          <p className="text-xs text-sage-500 mb-4">
            {profile.active !== false
              ? 'Your account is active. Your listings are visible on Live Prices.'
              : 'Your account is deactivated. Your listings are hidden from Live Prices.'}
          </p>
          {profile.active !== false ? (
            <button
              onClick={async () => {
                if (!confirm('Deactivate your account? Your listings will be hidden from buyers.')) return;
                try {
                  const { deactivateAccount } = await import('../api/profile');
                  await deactivateAccount();
                  toast.success('Account deactivated');
                  setProfile({ ...profile, active: false });
                } catch { toast.error('Failed to deactivate'); }
              }}
              className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Deactivate My Account
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  const { activateAccount } = await import('../api/profile');
                  await activateAccount();
                  toast.success('Account reactivated');
                  setProfile({ ...profile, active: true });
                } catch { toast.error('Failed to activate'); }
              }}
              className="px-4 py-2 text-sm rounded-lg border border-green-200 text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
            >
              Reactivate My Account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
