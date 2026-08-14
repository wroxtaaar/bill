import React, { useState } from 'react';
import { Customer } from '../types/invoice';
import { Plus, Trash2, Edit2, Check, X, UserPlus, Building2 } from 'lucide-react';

interface CustomerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSaveCustomers: (customers: Customer[]) => void;
  onSelectCustomer?: (customer: Customer) => void;
}

export const CustomerManagerModal: React.FC<CustomerManagerModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSaveCustomers,
  onSelectCustomer,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      gstin: '',
      state: 'Uttar Pradesh',
      stateCode: '09',
      placeOfSupply: '',
      phone: '',
    });
  };

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setIsAddingNew(false);
    setFormData({ ...c });
  };

  const handleSaveItem = () => {
    if (!formData.name?.trim()) return;

    if (isAddingNew) {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: formData.name.trim(),
        address: formData.address || '',
        gstin: (formData.gstin || '').toUpperCase().trim(),
        state: formData.state || 'Uttar Pradesh',
        stateCode: formData.stateCode || '09',
        placeOfSupply: formData.placeOfSupply || formData.state || '',
        phone: formData.phone || '',
      };
      const updated = [...customers, newCust];
      onSaveCustomers(updated);
      setIsAddingNew(false);
      setFormData({});
      if (onSelectCustomer) {
        onSelectCustomer(newCust);
      }
    } else if (editingId) {
      const updated = customers.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name?.trim() || c.name,
              address: formData.address || '',
              gstin: (formData.gstin || '').toUpperCase().trim(),
              state: formData.state || c.state,
              stateCode: formData.stateCode || c.stateCode,
              placeOfSupply: formData.placeOfSupply || c.placeOfSupply,
              phone: formData.phone || '',
            }
          : c
      );
      onSaveCustomers(updated);
      setEditingId(null);
      setFormData({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const updated = customers.filter((c) => c.id !== id);
      onSaveCustomers(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-semibold text-lg">Manage Customer / Buyer Directory</h2>
              <p className="text-xs text-slate-300">
                Add, edit or configure customer details for fast 1-click invoice filling
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
                  {isAddingNew ? 'Add New Customer' : 'Edit Customer Details'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shiv Shakti Traders"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600 font-medium"
                    autoFocus
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Address</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Main Bazaar, Near Railway Crossing, Deoband"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">GSTIN Number (15 Digits)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="09AAACS1234F1Z5"
                    value={formData.gstin || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const stateCode = val.length >= 2 && !isNaN(Number(val.slice(0, 2))) ? val.slice(0, 2) : formData.stateCode;
                      setFormData({ ...formData, gstin: val, stateCode });
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white uppercase font-mono focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Place of Supply</label>
                  <input
                    type="text"
                    placeholder="e.g. Deoband (UP)"
                    value={formData.placeOfSupply || ''}
                    onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">State Code</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="09"
                    value={formData.stateCode || ''}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 bg-white font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={!formData.name?.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save Customer
                </button>
              </div>
            </div>
          )}

          {!isAddingNew && !editingId && (
            <button
              onClick={startAdd}
              className="w-full py-2.5 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg text-indigo-700 hover:bg-indigo-50/50 flex items-center justify-center gap-2 font-medium text-sm transition"
            >
              <UserPlus className="w-4 h-4" /> + Add New Customer to Directory
            </button>
          )}

          {/* List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-sm transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    {c.state && (
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {c.state} ({c.stateCode || '09'})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">{c.address || 'No address set'}</div>
                  <div className="text-xs flex gap-4 text-slate-500 font-mono">
                    <span>GSTIN: {c.gstin || 'Unregistered / UR'}</span>
                    {c.placeOfSupply && <span>Supply: {c.placeOfSupply}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onSelectCustomer && (
                    <button
                      onClick={() => {
                        onSelectCustomer(c);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded transition"
                    >
                      Use on Bill
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
