import { useState, useEffect, useRef } from 'react';
import { getUsers, updateUser, adminResetPassword, toggleUserStatus, downloadFarmerTemplate } from '../../api/admin';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Upload, Edit2, X, User } from 'lucide-react';
import { STATES, BIHAR_DISTRICTS } from '../../data/locations';

/* ── Edit user modal ────────────────────────────────── */
function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    email: user.email || '',
    phone: user.phone || '',
    yearsOfExperience: user.yearsOfExperience?.toString() || '',
    commissionPercent: user.commissionPercent?.toString() || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && form.phone.length !== 10) {
      toast.error('Phone must be exactly 10 digits');
      return;
    }
    setSaving(true);
    try {
      await updateUser(user.id, {
        email: form.email || null,
        phone: form.phone || null,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : null,
        commissionPercent: form.commissionPercent ? parseFloat(form.commissionPercent) : null,
      });
      toast.success('User updated successfully');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[200] p-4 overflow-y-auto min-h-screen">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-md w-full border border-sage-100 animate-fade-in my-8 relative">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit Contact Details</h3>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-3.5 w-3.5 text-sage-400" />
              <p className="text-sage-500 text-sm">{user.fullName}</p>
              <span className="badge bg-primary-50 text-primary-700 text-xs">{user.role}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700">
          <p className="font-semibold mb-0.5">Change log</p>
          <p className="text-amber-600">All changes are recorded in the audit log with your admin account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-field" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Phone (10 digits)</label>
            <input type="text" value={form.phone} maxLength={10}
              onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              className="input-field" placeholder="9876543210" />
            {form.phone && form.phone.length > 0 && form.phone.length !== 10 && (
              <p className="text-xs text-red-500 mt-1">{form.phone.length}/10 digits</p>
            )}
          </div>
          {user.role === 'FARMER' && (
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Years of Experience</label>
              <input type="number" min="0" max="60" value={form.yearsOfExperience}
                onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
                className="input-field" placeholder="e.g. 5" />
            </div>
          )}
          {user.role === 'BUYER' && (
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Commission (%)</label>
              <input type="number" step="0.1" min="0" max="50" value={form.commissionPercent || ''}
                onChange={e => setForm({ ...form, commissionPercent: e.target.value })}
                className="input-field" placeholder="e.g. 5.0" />
              <p className="text-xs text-sage-400 mt-1">Platform profit per order from this buyer</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center py-3">
              Cancel
            </button>
          </div>
        </form>

        {/* Reset password section */}
        <div className="mt-5 pt-5 border-t border-sage-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Reset Password</p>
              <p className="text-xs text-sage-400 mt-0.5">
                Resets to default: {user.role === 'FARMER' ? 'Farmer@123' : 'Buyer@123'}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await adminResetPassword(user.id);
                  toast.success('Password reset to default. User must change on next login.');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to reset');
                }
              }}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold
                         hover:bg-red-100 transition-all duration-200"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function ManageUsers() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('FARMER');
  const [showForm, setShowForm]       = useState(false);
  const [editUser, setEditUser]       = useState(null);
  const [form, setForm]               = useState({
    fullName: '', email: '', phone: '', city: '', district: '', state: 'Bihar', pincode: '', address: '',
    yearsOfExperience: '',
  });
  const [saving, setSaving]           = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchUsers(); }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(filter);
      const data = res.data.data || [];
      // Sort by ID desc — newest users first
      data.sort((a, b) => b.id - a.id);
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarmer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post('/admin/farmers', form);
      toast.success(res.data.message);
      setShowForm(false);
      setForm({ fullName: '', email: '', phone: '', city: '', district: '', state: 'Bihar', pincode: '', address: '', yearsOfExperience: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create farmer');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await API.post('/admin/farmers/bulk', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data.data);
      toast.success(`Uploaded: ${res.data.data.successCount} success, ${res.data.data.failedCount} failed`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sage-500 text-sm mt-0.5">Manage farmers and buyers on the platform</p>
        </div>
        {filter === 'FARMER' && (
          <div className="flex gap-3">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Farmer
            </button>
            <button onClick={() => fileRef.current.click()} className="btn-ghost flex items-center gap-2">
              <Upload className="h-4 w-4" /> Bulk Upload
            </button>
            <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleBulkUpload} />
          </div>
        )}
      </div>

      {/* Filter tabs — FARMER and BUYER only */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'FARMER', label: 'Farmers' },
          { key: 'BUYER',  label: 'Buyers'  },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === t.key
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white border border-sage-200 text-sage-700 hover:bg-sage-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload result */}
      {uploadResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-blue-800">
            Upload Result: {uploadResult.successCount} added, {uploadResult.failedCount} failed (of {uploadResult.totalRows} rows)
          </p>
          {uploadResult.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 list-disc list-inside space-y-0.5">
              {uploadResult.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
              {uploadResult.errors.length > 10 && <li>...and {uploadResult.errors.length - 10} more</li>}
            </ul>
          )}
          <button onClick={() => setUploadResult(null)} className="text-xs text-blue-600 mt-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Create farmer form */}
      {showForm && filter === 'FARMER' && (
        <form onSubmit={handleCreateFarmer}
          className="bg-white rounded-2xl shadow-soft border border-sage-100 p-6 mb-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Add New Farmer</h2>
              <p className="text-xs text-sage-400 mt-0.5">Default password: Farmer@123</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="text-sage-400 hover:text-sage-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="Full Name"
                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="input-field" />
            </div>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Email (optional)</label>
              <input type="email" placeholder="Email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Phone <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="10 digit phone"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field" />
            </div>
            {/* State dropdown */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">State</label>
              <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value, district: '' })} className="input-field">
                <option value="">Select State</option>
                {STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* District dropdown */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">District</label>
              {form.state === 'Bihar' ? (
                <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field">
                  <option value="">Select District</option>
                  {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input type="text" placeholder="Enter district"
                  value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                  className="input-field" />
              )}
            </div>
            {/* City */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">City / Village</label>
              <input type="text" placeholder="City or Village"
                value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="input-field" />
            </div>
            {/* Pincode */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Pincode</label>
              <input type="text" placeholder="Pincode"
                value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
                className="input-field" />
            </div>
            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Address</label>
              <input type="text" placeholder="Address"
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="input-field" />
            </div>
            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-medium text-sage-600 mb-1">Experience (yrs)</label>
              <input type="number" placeholder="Years"
                value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
                className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Farmer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Template hint (farmer only) */}
      {filter === 'FARMER' && (
        <div className="bg-sage-50 border border-sage-100 rounded-xl p-4 mb-5 flex items-center justify-between">
          <p className="text-sm text-sage-600">Need the Excel format? Download the template, fill it, and upload.</p>
          <button
            onClick={async () => {
              try {
                const res = await downloadFarmerTemplate();
                const url = URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'farmer_upload_template.xlsx';
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                toast.error('Failed to download template');
              }
            }}
            className="btn-primary text-xs py-2 px-4"
          >
            Download Template
          </button>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-sage-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-sage-100">
            <thead className="bg-sage-50">
              <tr>
                {['ID', 'Name', 'Email', 'Phone', 'District', 'State', filter === 'FARMER' ? 'Exp (Yrs)' : 'Commission', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-sage-50 transition-colors duration-150">
                  <td className="px-4 py-3 text-sm text-sage-500">#{u.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">{u.phone}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">{u.district || '—'}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">{u.state || '—'}</td>
                  <td className="px-4 py-3 text-sm text-sage-600">
                    {filter === 'FARMER'
                      ? (u.yearsOfExperience != null ? `${u.yearsOfExperience} yr${u.yearsOfExperience !== 1 ? 's' : ''}` : '—')
                      : (u.commissionPercent != null ? `${u.commissionPercent}%` : '—')
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${
                      u.active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditUser(u)}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        title="Edit user"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await toggleUserStatus(u.id);
                            toast.success(u.active ? 'User deactivated' : 'User activated');
                            fetchUsers();
                          } catch { toast.error('Failed to toggle status'); }
                        }}
                        className={`px-2 py-1 text-xs rounded-lg border font-medium transition-all duration-200 ${
                          u.active
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        }`}
                        title={u.active ? 'Deactivate user' : 'Activate user'}
                      >
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-10 text-sage-400 text-sm">No {filter.toLowerCase()}s found</div>
          )}
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
