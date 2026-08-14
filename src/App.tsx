import React, { useState, useEffect } from 'react';
import { Customer, ProductService, InvoiceData } from './types/invoice';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, getInitialInvoiceData } from './data/defaultData';
import { InvoiceDocument } from './components/InvoiceDocument';
import { CustomerManagerModal } from './components/CustomerManagerModal';
import { MobileInvoiceEditor } from './components/MobileInvoiceEditor';
import { ProductManagerModal } from './components/ProductManagerModal';
import {
  Printer,
  Users,
  Package,
  PlusCircle,
  CheckCircle2,
  Edit3,
  FileText,
} from 'lucide-react';

export default function App() {
  // Load customers from localStorage or fallback
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('fsw_customers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  });

  // Load products from localStorage or fallback
  const [products, setProducts] = useState<ProductService[]>(() => {
    try {
      const saved = localStorage.getItem('fsw_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  // Invoice form state
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    try {
      const saved = localStorage.getItem('fsw_active_invoice_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialInvoiceData();
  });

  // Mode: 'editor' (spacious touch form) vs 'preview' (1:1 printed bill format)
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fsw_customers', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('fsw_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('fsw_active_invoice_v3', JSON.stringify(invoice));
    } catch (e) {
      console.error(e);
    }
  }, [invoice]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetToNew = () => {
    if (confirm('Create a fresh invoice? Current form values will be reset.')) {
      const nextNo = (parseInt(invoice.invoiceNo, 10) || 1000) + 1;
      const initial = getInitialInvoiceData();
      initial.invoiceNo = String(nextNo);
      initial.receiverCustomerId = '';
      initial.receiverName = '';
      initial.receiverAddress = '';
      initial.receiverGstin = '';
      initial.receiverState = 'Uttar Pradesh';
      initial.receiverStateCode = '09';
      initial.placeOfSupply = '';
      initial.transportationMode = '';
      initial.consigneeCustomerId = '';
      initial.consigneeName = '';
      initial.consigneeAddress = '';
      initial.consigneeGstin = '';
      initial.consigneeState = '';
      initial.consigneeStateCode = '';
      initial.items = [
        { id: 'item-1', srNo: 1, productId: '', name: '', hsnCode: '', qty: '', rate: '', amount: 0 },
      ];
      setInvoice(initial);
      setViewMode('editor');
      showToast('Fresh bill created (#FSW/' + nextNo + ')');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 right-3 z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-2">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center font-serif font-black text-sm text-white shadow-inner shrink-0">
              F
            </div>
            <div className="truncate">
              <span className="font-bold text-xs sm:text-sm tracking-wide block truncate">
                FANCY STEEL WORKS
              </span>
            </div>
          </div>

          {/* Toggle Button: Edit Form vs View Bill */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition ${
                viewMode === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Form</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bill View</span>
            </button>
          </div>

          {/* Print Action */}
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 md:p-6 flex flex-col items-center justify-start overflow-y-auto">
        {viewMode === 'editor' ? (
          /* Mobile Friendly Touch Editor */
          <div className="w-full">
            <MobileInvoiceEditor
              invoice={invoice}
              setInvoice={setInvoice}
              customers={customers}
              products={products}
              onOpenCustomerManager={() => setIsCustomerModalOpen(true)}
              onOpenProductManager={() => setIsProductModalOpen(true)}
              onViewPreview={() => setViewMode('preview')}
            />
          </div>
        ) : (
          /* 1:1 Printed Bill Format in a horizontally scrollable container */
          <div className="w-full flex flex-col items-center space-y-3 pb-24">
            <div className="w-full max-w-[740px] flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <button
                onClick={() => setViewMode('editor')}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Back to Edit Form
              </button>
              
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

            {/* Horizontal Scroll wrapper for pristine bill layout on any screen width */}
            <div className="w-full overflow-x-auto pb-4 flex justify-center">
              <InvoiceDocument
                invoice={invoice}
                setInvoice={setInvoice}
                customers={customers}
                products={products}
              />
            </div>
          </div>
        )}
      </main>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg print:hidden">
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="p-1 text-slate-700 hover:text-indigo-600 flex flex-col items-center text-[10px] font-medium"
        >
          <Users className="w-4 h-4 text-indigo-600 mb-0.5" />
          <span>Parties ({customers.length})</span>
        </button>

        <button
          onClick={() => setIsProductModalOpen(true)}
          className="p-1 text-slate-700 hover:text-emerald-600 flex flex-col items-center text-[10px] font-medium"
        >
          <Package className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span>Items ({products.length})</span>
        </button>

        <button
          onClick={handleResetToNew}
          className="p-1 text-slate-700 hover:text-amber-600 flex flex-col items-center text-[10px] font-medium"
        >
          <PlusCircle className="w-4 h-4 text-amber-600 mb-0.5" />
          <span>New Bill</span>
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
          className="p-1 text-indigo-700 flex flex-col items-center text-[10px] font-bold"
        >
          {viewMode === 'editor' ? (
            <>
              <FileText className="w-4 h-4 text-indigo-600 mb-0.5" />
              <span>View Bill</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 text-indigo-600 mb-0.5" />
              <span>Edit Form</span>
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* Customer Directory Modal */}
      <CustomerManagerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        onSaveCustomers={(updated) => {
          setCustomers(updated);
          showToast('Customer directory updated');
        }}
        onSelectCustomer={(c) => {
          setInvoice((prev) => ({
            ...prev,
            receiverCustomerId: c.id,
            receiverName: c.name,
            receiverAddress: c.address,
            receiverGstin: c.gstin,
            receiverState: c.state,
            receiverStateCode: c.stateCode,
            placeOfSupply: c.placeOfSupply || prev.placeOfSupply,
          }));
          showToast(`Selected "${c.name}"`);
        }}
      />

      {/* Product Catalog Modal */}
      <ProductManagerModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        products={products}
        onSaveProducts={(updated) => {
          setProducts(updated);
          showToast('Product catalog updated');
        }}
      />
    </div>
  );
}
