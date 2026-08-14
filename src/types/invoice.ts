export interface Customer {
  id: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  placeOfSupply: string;
  phone?: string;
}

export interface ProductService {
  id: string;
  name: string;
  hsnCode: string;
  defaultRate?: number;
  unit?: string;
}

export interface InvoiceItem {
  id: string;
  srNo: number;
  productId?: string;
  name: string;
  hsnCode: string;
  qty: number | '';
  rate: number | '';
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  reverseCharge: 'Y' | 'N';
  sellerState: string;
  sellerStateCode: string;
  
  // Transport
  transportationMode: string;
  vehicleNumber: string;
  dateOfSupply: string;
  placeOfSupply: string;

  // Receiver
  receiverCustomerId?: string;
  receiverName: string;
  receiverAddress: string;
  receiverGstin: string;
  receiverState: string;
  receiverStateCode: string;

  // Consignee
  isConsigneeSameAsReceiver: boolean;
  consigneeCustomerId?: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneeState: string;
  consigneeStateCode: string;

  // Items
  items: InvoiceItem[];

  // Extra charges & taxes
  additionalCharges: number | '';
  applyGst: boolean; // toggle whether to compute GST
  cgstRate: number; // default 9%
  sgstRate: number; // default 9%
  igstRate: number; // default 18%
  gstPayableOnReverseCharge: 'Yes' | 'No';

  copyType: 'original' | 'duplicate' | 'triplicate';
}
