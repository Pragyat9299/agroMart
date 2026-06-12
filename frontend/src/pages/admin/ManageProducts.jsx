import { useState, useEffect } from 'react';
import { getAllProducts } from '../../api/products';
import { createProduct, updateProduct, deleteProduct } from '../../api/admin';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

/* ── Confirm deactivate dialog ─────────────────────── */
function ConfirmDialog({ productName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-sm w-full border border-sage-100 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Deactivate Product?</h3>
            <p className="text-sage-500 text-sm mt-1">
              <span className="font-medium text-gray-900">{productName}</span> will be hidden from farmers and buyers. Existing listings won't be affected.
            </p>
          </div>
          <button onClick={onCancel} className="p-1 text-sage-400 hover:text-sage-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all duration-200">
            Yes, Deactivate
          </button>
          <button onClick={onCancel} className="flex-1 btn-ghost py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function ManageProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null); // { id, name }
  const [form, setForm]           = useState({
    name: '', category: '', grade: '', description: '', unit: 'kg',
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success('Product updated');
      } else {
        await createProduct(form);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', category: '', grade: '', description: '', unit: 'kg' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, category: p.category || '', grade: p.grade || '',
      description: p.description || '', unit: p.unit || 'kg',
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmProduct) return;
    try {
      await deleteProduct(confirmProduct.id);
      toast.success('Product deactivated');
      setConfirmProduct(null);
      fetchProducts();
    } catch {
      toast.error('Failed to deactivate');
      setConfirmProduct(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Products</h1>
          <p className="text-sage-500 text-sm mt-0.5">{products.length} active product{products.length !== 1 ? 's' : ''} in catalogue</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ name: '', category: '', grade: '', description: '', unit: 'kg' });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-soft border border-sage-100 p-6 mb-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{editId ? 'Edit Product' : 'New Product'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-sage-400 hover:text-sage-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Product Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" />
            <input placeholder="Category (e.g. Makhana)" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input-field" />
            <input placeholder="Grade (e.g. A, B, Premium)" value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value })}
              className="input-field" />
            <input required placeholder="Unit (kg, quintal)" value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="input-field" />
          </div>
          <textarea placeholder="Description (optional)" rows="2" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="input-field resize-none w-full" />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              {editId ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-sage-100 overflow-hidden">
        <table className="min-w-full divide-y divide-sage-100">
          <thead className="bg-sage-50">
            <tr>
              {['Name', 'Category', 'Grade', 'Unit', 'Description', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sage-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-sage-50 transition-colors duration-150">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-sm text-sage-600">{p.category || '—'}</td>
                <td className="px-4 py-3 text-sm text-sage-600">{p.grade || '—'}</td>
                <td className="px-4 py-3 text-sm text-sage-600">{p.unit}</td>
                <td className="px-4 py-3 text-sm text-sage-400 max-w-xs truncate">{p.description || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      title="Edit product">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmProduct({ id: p.id, name: p.name })}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      title="Deactivate product">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-10 text-sage-400 text-sm">No products yet.</div>
        )}
      </div>

      {/* Confirm deactivate */}
      {confirmProduct && (
        <ConfirmDialog
          productName={confirmProduct.name}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmProduct(null)}
        />
      )}
    </div>
  );
}
