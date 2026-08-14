import React from 'react';
import { Customer, ProductService, InvoiceData } from '../types/invoice';
import { numberToIndianWords } from '../utils/numberToWords';

interface InvoiceDocumentProps {
  invoice: InvoiceData;
  setInvoice?: React.Dispatch<React.SetStateAction<InvoiceData>>;
  customers?: Customer[];
  products?: ProductService[];
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
}) => {
  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const additionalCharges = typeof invoice.additionalCharges === 'number' ? invoice.additionalCharges : 0;
  const taxableAmount = subtotal + additionalCharges;

  // Inter-State (IGST) vs Intra-State (CGST + SGST)
  const isInterState = invoice.receiverStateCode && invoice.receiverStateCode !== '09';

  const cgstAmount = invoice.applyGst && !isInterState ? (taxableAmount * invoice.cgstRate) / 100 : 0;
  const sgstAmount = invoice.applyGst && !isInterState ? (taxableAmount * invoice.sgstRate) / 100 : 0;
  const igstAmount = invoice.applyGst && isInterState ? (taxableAmount * invoice.igstRate) / 100 : 0;
  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
  const totalAmountAfterTax = Math.round((taxableAmount + totalTaxAmount) * 100) / 100;
  const totalInWords = numberToIndianWords(totalAmountAfterTax);

  // Render 15 separate GSTIN boxes exactly as on the physical tax invoice
  const renderGstinBoxes = (gstinValue: string) => {
    const chars = (gstinValue || '').padEnd(15, ' ').slice(0, 15).split('');
    return (
      <div className="inline-flex border border-[#2b2d75] divide-x divide-[#2b2d75] bg-white">
        {chars.map((ch, idx) => (
          <div
            key={idx}
            className="w-4 sm:w-4.5 h-5 sm:h-5.5 flex items-center justify-center font-mono font-bold text-[11px] sm:text-xs text-[#1f2368]"
          >
            {ch.trim() || ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[740px] min-w-[740px] mx-auto bg-white shadow-xl rounded-none print:shadow-none print:m-0 print:p-0 print:w-full print:min-w-0 text-[#1b216b] font-sans antialiased text-[12.5px] leading-tight border-2 border-[#2b2d75]">
      
      {/* 1. Top Header */}
      <div className="p-3 pb-2 text-center border-b-2 border-[#2b2d75] relative">
        <div className="absolute top-2 right-3 text-[10px] text-right font-medium leading-tight print:block">
          <div className={`${invoice.copyType === 'original' ? 'font-bold underline text-[#1b216b]' : 'text-slate-500'}`}>
            White Original for Recipient
          </div>
          <div className={`${invoice.copyType === 'duplicate' ? 'font-bold underline text-pink-700' : 'text-slate-500'}`}>
            Pink Duplicate for Supplier/Transporter
          </div>
          <div className={`${invoice.copyType === 'triplicate' ? 'font-bold underline text-amber-800' : 'text-slate-500'}`}>
            Yellow Triplicate for Supplier
          </div>
        </div>

        <h1 className="text-4xl font-serif font-black tracking-wide text-[#1b216b] uppercase">
          FANCY STEEL WORKS
        </h1>
        <div className="text-sm font-bold tracking-normal mt-0.5 text-[#242978]">
          G.T. ROAD, DEOBAND (SAHARANPUR) M: 9897012107
        </div>
      </div>

      {/* 2. Subheader Bar */}
      <div className="grid grid-cols-12 border-b border-[#2b2d75] items-center px-3 py-1 font-bold text-sm bg-slate-50/50 print:bg-transparent">
        <div className="col-span-4 flex items-center gap-1 font-mono text-sm">
          <span>GSTIN:</span>
          <span className="tracking-wider text-[#141b63]">09CGFPS8637E1ZX</span>
        </div>
        <div className="col-span-4 text-center">
          <span className="text-lg font-serif font-extrabold tracking-wide uppercase">
            Tax Invoice
          </span>
        </div>
        <div className="col-span-4 text-right text-xs text-slate-700">
          <span className="font-semibold">State:</span> Uttar Pradesh (09)
        </div>
      </div>

      {/* 3. Invoice Metadata & Transport (Reverse Charge as in image) */}
      <div className="grid grid-cols-12 border-b border-[#2b2d75]">
        <div className="col-span-7 p-2.5 space-y-2 border-r border-[#2b2d75]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-semibold text-xs">
              <span>Invoice No.:</span>
              <span className="font-mono font-bold text-[#141b63] border-b border-dotted border-[#2b2d75] px-1">
                FSW/ {invoice.invoiceNo}
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-xs">
              <span>Date:</span>
              <span className="font-mono text-[#141b63] border-b border-dotted border-[#2b2d75] px-1">
                {invoice.invoiceDate}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <div>
              <span className="font-semibold">Reverse Charge:</span>{' '}
              <span className="font-bold border-b border-dotted border-[#2b2d75] px-2">{invoice.reverseCharge || 'N'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="font-semibold">State :</span> Uttar Pradesh
              </div>
              <div>
                <span className="font-semibold">State Code :</span>{' '}
                <span className="font-mono font-bold">09</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5 p-2 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1e2570]">Transportation Mode:</span>
            <span className="font-medium border-b border-dotted border-[#2b2d75] px-1 min-w-[90px] text-right">
              {invoice.transportationMode || ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1e2570]">Vehicle Number:</span>
            <span className="font-mono font-bold uppercase border-b border-dotted border-[#2b2d75] px-1 min-w-[90px] text-right">
              {invoice.vehicleNumber || ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1e2570]">Date of Supply:</span>
            <span className="font-mono border-b border-dotted border-[#2b2d75] px-1 min-w-[90px] text-right">
              {invoice.dateOfSupply || invoice.invoiceDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1e2570]">Place of Supply:</span>
            <span className="font-bold text-[#141b63] border-b border-dotted border-[#2b2d75] px-1 min-w-[90px] text-right">
              {invoice.placeOfSupply || ''}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Details of Receiver & Details of Consignee (Consignee kept blank as on paper image) */}
      <div className="grid grid-cols-12 border-b border-[#2b2d75]">
        {/* Receiver */}
        <div className="col-span-6 p-2.5 border-r border-[#2b2d75] space-y-1.5">
          <div className="font-bold text-xs uppercase tracking-wide text-[#1b216b] pb-0.5 border-b border-dotted border-[#2b2d75]">
            DETAILS OF RECEIVER | BILLED TO:
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold shrink-0">Name :</span>
              <span className="font-bold text-[#141b63] border-b border-dotted border-[#2b2d75] flex-1">
                {invoice.receiverName || ''}
              </span>
            </div>
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold shrink-0">Address:</span>
              <span className="text-slate-800 border-b border-dotted border-[#2b2d75] flex-1 leading-snug">
                {invoice.receiverAddress || ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="font-semibold shrink-0">GSTIN :</span>
              {renderGstinBoxes(invoice.receiverGstin)}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1">
                <span className="font-semibold">State :</span>{' '}
                <span className="border-b border-dotted border-[#2b2d75] px-1">{invoice.receiverState || 'Uttar Pradesh'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">State Code:</span>{' '}
                <span className="font-mono font-bold border-b border-dotted border-[#2b2d75] px-1">{invoice.receiverStateCode || '09'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consignee - Kept exact as in the original invoice blank format */}
        <div className="col-span-6 p-2.5 space-y-1.5">
          <div className="font-bold text-xs uppercase tracking-wide text-[#1b216b] pb-0.5 border-b border-dotted border-[#2b2d75]">
            DETAILS OF CONSIGNEE | SHIPPED TO:
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold shrink-0">Name :</span>
              <span className="font-bold text-[#141b63] border-b border-dotted border-[#2b2d75] flex-1 min-h-[18px]">
                {invoice.consigneeName || ''}
              </span>
            </div>
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold shrink-0">Address:</span>
              <span className="text-slate-800 border-b border-dotted border-[#2b2d75] flex-1 leading-snug min-h-[18px]">
                {invoice.consigneeAddress || ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="font-semibold shrink-0">GSTIN :</span>
              {renderGstinBoxes(invoice.consigneeGstin || '')}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1">
                <span className="font-semibold">State :</span>{' '}
                <span className="border-b border-dotted border-[#2b2d75] px-1 min-w-[60px]">
                  {invoice.consigneeState || ''}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">State Code:</span>{' '}
                <span className="font-mono font-bold border-b border-dotted border-[#2b2d75] px-1 min-w-[30px]">
                  {invoice.consigneeStateCode || ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Items Table */}
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-[#2b2d75] font-bold text-center text-[#1b216b] bg-slate-50/50 print:bg-transparent">
            <th className="py-2 px-1 border-r border-[#2b2d75] w-10">Sr.<br/>No.</th>
            <th className="py-2 px-2 border-r border-[#2b2d75] text-left">Name of Product / Service</th>
            <th className="py-2 px-1 border-r border-[#2b2d75] w-20">HSN<br/>ACS</th>
            <th className="py-2 px-1 border-r border-[#2b2d75] w-18">Qty</th>
            <th className="py-2 px-1 border-r border-[#2b2d75] w-22">Rate</th>
            <th className="py-2 px-2 w-28 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-[#2b2d75] min-h-[36px]">
              <td className="py-2 px-1 border-r border-[#2b2d75] text-center font-mono font-medium align-middle">
                {item.srNo}
              </td>
              <td className="py-2 px-2 border-r border-[#2b2d75] align-middle font-medium text-[#141b63]">
                {item.name || '—'}
              </td>
              <td className="py-2 px-1 border-r border-[#2b2d75] text-center font-mono align-middle">
                {item.hsnCode || '—'}
              </td>
              <td className="py-2 px-1 border-r border-[#2b2d75] text-center font-mono font-bold align-middle">
                {item.qty !== '' ? item.qty : ''}
              </td>
              <td className="py-2 px-1 border-r border-[#2b2d75] text-right font-mono font-bold align-middle">
                {item.rate !== '' ? Number(item.rate).toFixed(2) : ''}
              </td>
              <td className="py-2 px-2 text-right font-mono font-bold text-[#141b63] align-middle">
                {item.amount > 0 ? item.amount.toFixed(2) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 6. Footer & Totals */}
      <div className="grid grid-cols-12">
        <div className="col-span-7 border-r border-[#2b2d75] flex flex-col justify-between">
          {/* Words */}
          <div className="p-2.5 border-b border-[#2b2d75] min-h-[64px]">
            <div className="font-bold text-xs text-[#1b216b] mb-1">Total Invoice Amount in Words:</div>
            <div className="text-xs font-serif italic font-bold tracking-wide text-[#141b63] border-b border-dotted border-[#2b2d75] pb-0.5 leading-relaxed">
              {totalInWords}
            </div>
          </div>

          {/* Bank Details */}
          <div className="p-2.5 border-b border-[#2b2d75] bg-slate-50/40 print:bg-transparent text-xs space-y-0.5">
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold text-[#1b216b]">Bank Details:</span>
              <span className="col-span-8 font-semibold">Punjab National Bank</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold text-[#1b216b]">Bank A/c No:</span>
              <span className="col-span-8 font-mono font-bold tracking-wider text-[#141b63]">
                6217002100001824
              </span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold text-[#1b216b]">IFSC:</span>
              <span className="col-span-8 font-mono font-bold tracking-wider text-[#141b63]">
                PUNB0621700
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="p-2 text-[10.5px] leading-tight space-y-0.5 text-slate-800">
            <div className="font-bold text-[#1b216b] text-[11px] mb-0.5">Terms and Conditions :</div>
            <p>(1) We shall not be responsible for the goods after given to the transport Co./Railway.</p>
            <p>(2) Goods once sold shall not be taken back or exchanged.</p>
            <p>(3) All Disputes Subject to Deoband Jurisdiction Only.</p>
            <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500 font-semibold">
              <span>E.&O.E.</span>
              <span className="italic">(Common Seal)</span>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="col-span-5 flex flex-col justify-between">
          <div className="divide-y divide-[#2b2d75] text-xs">
            <div className="flex justify-between items-center p-2 font-bold">
              <span>Total Amount Before Tax</span>
              <span className="font-mono text-[#141b63]">
                ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5">
              <span className="text-slate-700">Add: Charge if any</span>
              <span className="font-mono font-semibold">
                {additionalCharges > 0 ? `₹ ${additionalCharges.toFixed(2)}` : '0.00'}
              </span>
            </div>

            {invoice.applyGst && !isInterState && (
              <>
                <div className="flex justify-between items-center p-1.5">
                  <span className="text-slate-700">Add: CGST @ 9%</span>
                  <span className="font-mono font-semibold text-[#141b63]">
                    {cgstAmount > 0 ? `₹ ${cgstAmount.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-1.5">
                  <span className="text-slate-700">Add: SGST @ 9%</span>
                  <span className="font-mono font-semibold text-[#141b63]">
                    {sgstAmount > 0 ? `₹ ${sgstAmount.toFixed(2)}` : '—'}
                  </span>
                </div>
              </>
            )}

            {invoice.applyGst && isInterState && (
              <div className="flex justify-between items-center p-1.5">
                <span className="text-slate-700">Add: IGST @ 18%</span>
                <span className="font-mono font-semibold text-[#141b63]">
                  {igstAmount > 0 ? `₹ ${igstAmount.toFixed(2)}` : '—'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-1.5 bg-slate-50/70 font-semibold print:bg-transparent">
              <span>Total Tax Amount GST</span>
              <span className="font-mono text-[#141b63]">₹ {totalTaxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-indigo-50/80 font-bold text-sm text-[#141b63] print:bg-transparent">
              <span>Total Amount After Tax :</span>
              <span className="font-mono text-base">
                ₹ {totalAmountAfterTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 text-[11px]">
              <span className="text-slate-700">GST Payable on Reverse Charge</span>
              <span className="font-bold">{invoice.reverseCharge === 'Y' ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="p-2 border-t border-[#2b2d75] text-center pt-3 mt-auto">
            <div className="text-[9.5px] italic text-slate-500 mb-1">
              Certified that the particulars given above are true and correct.
            </div>
            <div className="font-serif font-bold text-sm tracking-wide text-[#1b216b]">
              For Fancy Steel Works
            </div>
            <div className="h-9"></div>
            <div className="text-[11px] font-semibold text-[#1b216b] border-t border-dotted border-[#2b2d75] pt-1">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
