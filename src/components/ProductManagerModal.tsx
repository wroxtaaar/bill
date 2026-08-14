import React, { useState } from 'react';
import { ProductService } from '../types/invoice';
import { Plus, Trash2, Edit2, Check, X, PackagePlus, Box } from 'lucide-react';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductService[];
  onSaveProducts: (products: ProductService[]) => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProductService>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      name: '',
      hsnCode: '7216',
      defaultRate: 0,
      unit: 'Kg',
    });
  };

  const startEdit = (p: ProductService) => {
    setEditingId(p.id);
    setIsAddingNew(false);
    setFormData({ ...p });
  };

  const handleSaveItem = () => {
    if (!formData.name?.trim()) return;

    if (isAddingNew) {
      const newProd: ProductService = {
        id: 'prod-' + Date.now(),
        name: formData.name.trim(),
        hsnCode: (formData.hsnCode || '7216').trim(),
        defaultRate: Number(formData.defaultRate) || 0,
        unit: formData.unit || 'Kg',
      };
      const updated = [...products, newProd];
      onSaveProducts(updated);
      setIsAddingNew(false);
      setFormData({});
    } else if (editingId) {
      const updated = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name?.trim() || p.name,
              hsnCode: formData.hsnCode || p.hsnCode,
              defaultRate: formData.defaultRate !== undefined ? Number(formData.defaultRate) : p.defaultRate,
              unit: formData.unit || p.unit,
            }
          : p
      );
      onSaveProducts(updated);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product item?')) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-semibold text-lg">Product & Service Catalog</h2>
              <p className="text-xs text-slate-300">
                Configure dropdown items, HSN/ACS codes, and standard rates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Add / Edit Form */}
          {(isAddingNew || editingId) && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-indigo-950">
                  {isAddingNew ? 'Add New Product / Service' : 'Edit Product'}
                </span>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-3">
                  <label className="block font-medium text-slate-700 mb-1">
                    Product / Service Description *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MS Angle 50x50x6 mm"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">HSN / ACS Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 7216"
                    value={formData.hsnCode || ''}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white font-mono focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Default Rate (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 58"
                    value={formData.defaultRate ?? ''}
                    onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={formData.unit || 'Kg'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Pc">Pc (Piece)</option>
                    <option value="Meter">Meter</option>
                    <option value="Feet">Feet</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                    <option value="Ton">Ton (MT)</option>
                    <option value="Bundle">Bundle</option>
                    <option value="Job">Job / Service</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={!formData.name?.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save Product
                </button>
              </div>
            </div>
          )}

          {!isAddingNew && !editingId && (
            <button
              onClick={startAdd}
              className="w-full py-2.5 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg text-indigo-700 hover:bg-indigo-50/50 flex items-center justify-center gap-2 font-medium text-sm transition"
            >
              <PackagePlus className="w-4 h-4" /> + Add New Product Option
            </button>
          )}

          {/* List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-sm transition"
              >
                <div className="space-y-0.5 flex-1">
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      HSN: {p.hsnCode || '—'}
                    </span>
                    {p.defaultRate ? (
                      <span className="font-semibold text-emerald-700">
                        ₹{p.defaultRate.toLocaleString('en-IN')} / {p.unit || 'Kg'}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
