import React, { useState } from 'react';
import { Customer, ProductService, InvoiceData, InvoiceItem } from '../types/invoice';
import { numberToIndianWords } from '../utils/numberToWords';
import {
  User,
  Package,
  Plus,
  Trash2,
  Truck,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MobileInvoiceEditorProps {
  invoice: InvoiceData;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceData>>;
  customers: Customer[];
  products: ProductService[];
  onOpenCustomerManager: () => void;
  onOpenProductManager: () => void;
  onViewPreview: () => void;
}

export const MobileInvoiceEditor: React.FC<MobileInvoiceEditorProps> = ({
  invoice,
  setInvoice,
  customers,
  products,
  onOpenCustomerManager,
  onOpenProductManager,
  onViewPreview,
}) => {
  const [showTransport, setShowTransport] = useState(false);

  // Customer selection handler - Auto fills place of supply, address, GSTIN, state, state code
  const handleSelectReceiver = (customerId: string) => {
    if (!customerId) return;
    const selected = customers.find((c) => c.id === customerId);
    if (!selected) return;

    setInvoice((prev) => ({
      ...prev,
      receiverCustomerId: selected.id,
      receiverName: selected.name,
      receiverAddress: selected.address,
      receiverGstin: selected.gstin,
      receiverState: selected.state,
      receiverStateCode: selected.stateCode,
      placeOfSupply: selected.placeOfSupply || selected.state || prev.placeOfSupply,
    }));
  };

  // Product selection handler - auto fills HSN code, default rate, and computes amount
  const handleSelectProduct = (index: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index] };

      if (selected) {
        item.productId = selected.id;
        item.name = selected.name;
        item.hsnCode = selected.hsnCode || item.hsnCode;
        if (selected.defaultRate && (!item.rate || item.rate === '')) {
          item.rate = selected.defaultRate;
        }
        const qtyNum = typeof item.qty === 'number' ? item.qty : 0;
        const rateNum = typeof item.rate === 'number' ? item.rate : 0;
        item.amount = Math.round(qtyNum * rateNum * 100) / 100;
      } else {
        item.productId = '';
      }

      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  // Item field change handler - updates amount immediately on Qty or Rate edit
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: value };

      if (field === 'qty' || field === 'rate') {
        const qtyNum = item.qty === '' ? 0 : Number(item.qty);
        const rateNum = item.rate === '' ? 0 : Number(item.rate);
        item.amount =
          isNaN(qtyNum) || isNaN(rateNum) ? 0 : Math.round(qtyNum * rateNum * 100) / 100;
      }

      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const handleAddItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: 'item-' + Date.now(),
          srNo: prev.items.length + 1,
          productId: '',
          name: '',
          hsnCode: '',
          qty: '',
          rate: '',
          amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    setInvoice((prev) => {
      const updatedItems = prev.items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, srNo: i + 1 }));
      return { ...prev, items: updatedItems };
    });
  };

  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const additionalCharges = typeof invoice.additionalCharges === 'number' ? invoice.additionalCharges : 0;
  const taxableAmount = subtotal + additionalCharges;
  const isInterState = invoice.receiverStateCode && invoice.receiverStateCode !== '09';

  const cgstAmount = invoice.applyGst && !isInterState ? (taxableAmount * invoice.cgstRate) / 100 : 0;
  const sgstAmount = invoice.applyGst && !isInterState ? (taxableAmount * invoice.sgstRate) / 100 : 0;
  const igstAmount = invoice.applyGst && isInterState ? (taxableAmount * invoice.igstRate) / 100 : 0;
  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
  const totalAmountAfterTax = Math.round((taxableAmount + totalTaxAmount) * 100) / 100;
  const totalInWords = numberToIndianWords(totalAmountAfterTax);

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 pb-24 text-slate-800">
      
      {/* 1. INVOICE HEADER BAR */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <div className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
              <span>Fancy Steel Works</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                Tax Invoice
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Deoband (UP) • M: 9897012107</div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400">FSW/</span>
            <input
              type="text"
              value={invoice.invoiceNo}
              onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })}
              className="w-14 font-bold text-indigo-900 border-b border-indigo-300 text-center bg-indigo-50/50 rounded px-1 py-0.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Invoice Date</label>
            <input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
              className="w-full font-mono text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Place of Supply</label>
            <input
              type="text"
              value={invoice.placeOfSupply}
              onChange={(e) => setInvoice({ ...invoice, placeOfSupply: e.target.value })}
              placeholder="e.g. Deoband (UP)"
              className="w-full p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 2. SECTION: BUYER / RECEIVER DETAILS */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
              Buyer / Receiver (Name)
            </span>
          </div>
          <button
            onClick={onOpenCustomerManager}
            className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded"
          >
            + Manage Buyers
          </button>
        </div>

        {/* PRIMARY DROPDOWN FOR BUYER */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Choose Buyer from Dropdown:
          </label>
          <select
            value={invoice.receiverCustomerId || ''}
            onChange={(e) => handleSelectReceiver(e.target.value)}
            className="w-full text-xs font-semibold bg-indigo-50 border-2 border-indigo-200 rounded-lg p-2.5 text-indigo-950 focus:outline-indigo-600 focus:bg-white"
          >
            <option value="">▼ Tap to select buyer (Auto-fills address, GSTIN & code)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.state})
              </option>
            ))}
          </select>
        </div>

        {/* AUTO-FILLED / EDITABLE FIELDS */}
        <div className="space-y-2 pt-1">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Buyer Name *</label>
            <input
              type="text"
              value={invoice.receiverName}
              onChange={(e) => setInvoice({ ...invoice, receiverName: e.target.value })}
              placeholder="e.g. Shiv Shakti Traders"
              className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Address</label>
            <textarea
              rows={2}
              value={invoice.receiverAddress}
              onChange={(e) => setInvoice({ ...invoice, receiverAddress: e.target.value })}
              placeholder="Full address..."
              className="w-full text-xs border border-slate-200 rounded-lg p-2 text-slate-800 bg-white resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">GSTIN Number</label>
            <input
              type="text"
              maxLength={15}
              value={invoice.receiverGstin}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                const code = val.length >= 2 && !isNaN(Number(val.slice(0, 2))) ? val.slice(0, 2) : invoice.receiverStateCode;
                setInvoice({ ...invoice, receiverGstin: val, receiverStateCode: code });
              }}
              placeholder="09AAACS1234F1Z5"
              className="w-full font-mono font-bold text-xs uppercase tracking-wider border border-slate-200 rounded-lg p-2 text-slate-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">State</label>
              <input
                type="text"
                value={invoice.receiverState}
                onChange={(e) => setInvoice({ ...invoice, receiverState: e.target.value })}
                placeholder="Uttar Pradesh"
                className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 bg-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">State Code</label>
              <input
                type="text"
                maxLength={2}
                value={invoice.receiverStateCode}
                onChange={(e) => setInvoice({ ...invoice, receiverStateCode: e.target.value })}
                placeholder="09"
                className="w-full font-mono font-bold text-center border border-slate-200 rounded-lg p-2 text-slate-900 bg-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: PRODUCT & SERVICE ITEMS (Starts with 1 item row by default) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
              Product & Service Items ({invoice.items.length})
            </span>
          </div>
          <button
            onClick={onOpenProductManager}
            className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded"
          >
            + Item Catalog
          </button>
        </div>

        {/* ITEMS CARDS */}
        {invoice.items.map((item, index) => {
          const itemAmount = item.amount || 0;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2 relative"
            >
              {/* Item Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  Item #{item.srNo}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-900">
                    Amount: ₹{itemAmount > 0 ? itemAmount.toFixed(2) : '0.00'}
                  </span>
                  {invoice.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Dropdown */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                  Select Product / Service:
                </label>
                <select
                  value={item.productId || ''}
                  onChange={(e) => handleSelectProduct(index, e.target.value)}
                  className="w-full text-xs font-semibold bg-emerald-50/70 border border-emerald-200 rounded-lg p-2 text-slate-900 focus:outline-emerald-600"
                >
                  <option value="">▼ Choose from Product Dropdown</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (HSN: {p.hsnCode} {p.defaultRate ? `• ₹${p.defaultRate}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description field */}
              <div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Or type custom product description..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 text-slate-900 bg-white"
                />
              </div>

              {/* Qty, Rate & Auto Multiplication Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">HSN Code</label>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                    placeholder="7216"
                    className="w-full font-mono text-center text-xs border border-slate-200 rounded-lg p-2 text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-indigo-700 block mb-0.5">Qty *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={item.qty === '' ? '' : item.qty}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'qty',
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className="w-full font-mono font-bold text-center text-xs border-2 border-indigo-200 rounded-lg p-2 text-indigo-950 bg-indigo-50/40 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-indigo-700 block mb-0.5">Rate (₹) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={item.rate === '' ? '' : item.rate}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'rate',
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="0.00"
                    className="w-full font-mono font-bold text-right text-xs border-2 border-indigo-200 rounded-lg p-2 text-indigo-950 bg-indigo-50/40 focus:outline-indigo-600"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Row Button */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl text-indigo-700 font-semibold text-xs flex items-center justify-center gap-1.5 bg-indigo-50/50"
        >
          <Plus className="w-4 h-4" /> + Add Another Item Row
        </button>
      </div>

      {/* 4. OPTIONAL TRANSPORT ACCORDION (Blank mode default) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTransport(!showTransport)}
          className="w-full p-3 text-xs font-semibold text-slate-700 flex items-center justify-between bg-slate-50 hover:bg-slate-100"
        >
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-500" />
            <span>Transport & Vehicle Details (Optional)</span>
          </div>
          {showTransport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTransport && (
          <div className="p-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Transportation Mode</label>
              <input
                type="text"
                value={invoice.transportationMode}
                onChange={(e) => setInvoice({ ...invoice, transportationMode: e.target.value })}
                placeholder="Leave blank or specify"
                className="w-full border border-slate-200 rounded-lg p-2 text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Vehicle Number</label>
              <input
                type="text"
                value={invoice.vehicleNumber}
                onChange={(e) => setInvoice({ ...invoice, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. UP 11 T 4521"
                className="w-full font-mono uppercase font-bold border border-slate-200 rounded-lg p-2 text-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. TOTALS, TAX BREAKDOWN & AMOUNT IN WORDS */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
            Invoice Summary & Taxes
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Subtotal: ₹{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="divide-y divide-slate-100 space-y-1.5">
          <div className="flex justify-between items-center pt-1 text-slate-600">
            <span>Extra Freight / Charges:</span>
            <div className="flex items-center gap-1">
              <span>₹</span>
              <input
                type="number"
                step="any"
                value={invoice.additionalCharges === '' ? '' : invoice.additionalCharges}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    additionalCharges: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="w-20 text-right p-1 font-mono border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {invoice.applyGst && !isInterState && (
            <div className="flex justify-between pt-1.5 text-slate-600 text-[11px]">
              <span>CGST (9%) + SGST (9%):</span>
              <span className="font-mono font-medium text-slate-800">
                ₹ {(cgstAmount + sgstAmount).toFixed(2)}
              </span>
            </div>
          )}

          {invoice.applyGst && isInterState && (
            <div className="flex justify-between pt-1.5 text-slate-600 text-[11px]">
              <span>IGST (18% Inter-State):</span>
              <span className="font-mono font-medium text-slate-800">₹ {igstAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2.5 bg-indigo-50/80 px-3 rounded-lg mt-1">
            <span className="font-bold text-xs sm:text-sm text-indigo-950">Total Amount After Tax:</span>
            <span className="text-base sm:text-lg font-black font-mono text-indigo-700">
              ₹ {totalAmountAfterTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total In Words */}
        <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] leading-snug">
          <span className="font-bold text-slate-600 block mb-0.5">Amount in Words:</span>
          <span className="font-serif italic font-bold text-indigo-950">
            {totalInWords}
          </span>
        </div>

        {/* View Full Physical Bill Button */}
        <button
          type="button"
          onClick={onViewPreview}
          className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <Eye className="w-4 h-4" />
          <span>View Fancy Steel Works Bill (Print / PDF)</span>
        </button>
      </div>
    </div>
  );
};
