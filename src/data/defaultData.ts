import { Customer, ProductService, InvoiceData } from '../types/invoice';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Shiv Shakti Traders & Hardware',
    address: 'Main Bazaar, Near Railway Crossing, Deoband (Saharanpur)',
    gstin: '09AAACS1234F1Z5',
    state: 'Uttar Pradesh',
    stateCode: '09',
    placeOfSupply: 'Deoband (UP)',
    phone: '9876543210',
  },
  {
    id: 'cust-2',
    name: 'Gupta Iron & Steel Store',
    address: 'Ambala Road, Opp. Bus Stand, Saharanpur',
    gstin: '09BGKPG5432H1Z2',
    state: 'Uttar Pradesh',
    stateCode: '09',
    placeOfSupply: 'Saharanpur (UP)',
    phone: '9837012345',
  },
  {
    id: 'cust-3',
    name: 'Sharma Builders & Infra Developers',
    address: 'Court Road, Civil Lines, Muzaffarnagar',
    gstin: '09AAOFS9876E1Z9',
    state: 'Uttar Pradesh',
    stateCode: '09',
    placeOfSupply: 'Muzaffarnagar (UP)',
    phone: '9719001122',
  },
  {
    id: 'cust-4',
    name: 'Haryana Steel Fabricators & Co.',
    address: 'Plot No. 45, Industrial Area, Sector 3, Karnal',
    gstin: '06AABCH8877K1Z4',
    state: 'Haryana',
    stateCode: '06',
    placeOfSupply: 'Karnal (Haryana)',
    phone: '9416023456',
  },
  {
    id: 'cust-5',
    name: 'Apex Infrastructure Projects Ltd.',
    address: 'B-14, Okhla Industrial Area Phase-II, New Delhi',
    gstin: '07AAGCA4433D1Z1',
    state: 'Delhi',
    stateCode: '07',
    placeOfSupply: 'New Delhi',
    phone: '9811099887',
  },
  {
    id: 'cust-6',
    name: 'Roorkee Agro Industries',
    address: 'NH-58, Manglaur By-pass, Roorkee (Haridwar)',
    gstin: '05AADCU3322B1Z8',
    state: 'Uttarakhand',
    stateCode: '05',
    placeOfSupply: 'Roorkee (Uttarakhand)',
    phone: '9758012399',
  },
];

export const INITIAL_PRODUCTS: ProductService[] = [
  {
    id: 'prod-1',
    name: 'MS Angle 40x40x5 mm',
    hsnCode: '7216',
    defaultRate: 58,
    unit: 'Kg',
  },
  {
    id: 'prod-2',
    name: 'MS Channel 75x40 mm Heavy',
    hsnCode: '7216',
    defaultRate: 62,
    unit: 'Kg',
  },
  {
    id: 'prod-3',
    name: 'TMT Saria 12mm Fe-550D',
    hsnCode: '7214',
    defaultRate: 55,
    unit: 'Kg',
  },
  {
    id: 'prod-4',
    name: 'MS Square Pipe 2" x 2" (16 Gauge)',
    hsnCode: '7306',
    defaultRate: 64,
    unit: 'Kg',
  },
  {
    id: 'prod-5',
    name: 'MS Flat Patti 50x6 mm',
    hsnCode: '7211',
    defaultRate: 59,
    unit: 'Kg',
  },
  {
    id: 'prod-6',
    name: 'GI Corrugated Sheet 10 Ft (0.45mm)',
    hsnCode: '7210',
    defaultRate: 850,
    unit: 'Pc',
  },
  {
    id: 'prod-7',
    name: 'Stainless Steel Pipe 304 (1.5" OD)',
    hsnCode: '7306',
    defaultRate: 290,
    unit: 'Kg',
  },
  {
    id: 'prod-8',
    name: 'Steel Railing & Gate Fabrication Work',
    hsnCode: '9954',
    defaultRate: 120,
    unit: 'Sq.Ft',
  },
  {
    id: 'prod-9',
    name: 'Industrial Truss & Shed Work (Labor + Material)',
    hsnCode: '9954',
    defaultRate: 380,
    unit: 'Sq.Ft',
  },
];

export const getInitialInvoiceData = (): InvoiceData => {
  const today = new Date().toISOString().split('T')[0];
  return {
    invoiceNo: '1042',
    invoiceDate: today,
    reverseCharge: 'N',
    sellerState: 'Uttar Pradesh',
    sellerStateCode: '09',

    transportationMode: '', // Blank
    vehicleNumber: 'UP 11 T 4521',
    dateOfSupply: today,
    placeOfSupply: 'Deoband (UP)',

    receiverCustomerId: 'cust-1',
    receiverName: 'Shiv Shakti Traders & Hardware',
    receiverAddress: 'Main Bazaar, Near Railway Crossing, Deoband (Saharanpur)',
    receiverGstin: '09AAACS1234F1Z5',
    receiverState: 'Uttar Pradesh',
    receiverStateCode: '09',

    // Consignee kept completely blank as requested
    isConsigneeSameAsReceiver: false,
    consigneeCustomerId: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeGstin: '',
    consigneeState: '',
    consigneeStateCode: '',

    // 1 item row by default
    items: [
      {
        id: 'item-1',
        srNo: 1,
        productId: 'prod-1',
        name: 'MS Angle 40x40x5 mm',
        hsnCode: '7216',
        qty: 150,
        rate: 58,
        amount: 8700,
      },
    ],

    additionalCharges: '',
    applyGst: true,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    gstPayableOnReverseCharge: 'No',

    copyType: 'original',
  };
};
