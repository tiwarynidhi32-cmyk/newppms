export interface Customer {
  id: string;
  name: string;
  companyName: string;
  gstNo: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
  type: 'Walk-in' | 'Corporate' | 'Vendor';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  customerId: string;
  startDate: string;
  endDate?: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  assignedContractorId?: string;
  budget?: number;
}

export interface Job {
  id: string;
  jcNo: string;
  orderDate: string;
  customerId: string;
  projectId?: string;
  productType: string;
  size: string;
  quantity: number;
  colorType: 'B/W' | '2 Color' | '4 Color' | 'Multi';
  paperType: string;
  gsm: number;
  printingType: string;
  finishing: string[];
  deliveryDate: string;
  status: 'Pending' | 'In Progress' | 'Paused' | 'Completed' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  contractorId?: string;
  machineId?: string;
  isOutsourced: boolean;
  outsourcingVendorId?: string;
  isPartyPaper: boolean; 
  logs: JobLog[];
  // New Fields
  noOfForms?: number;
  noOfColors?: number;
  wastagePercentage?: number;
  noOfPages?: number;
  ups?: number;
}

export interface JobLog {
  id: string;
  jobId: string;
  action: 'Start' | 'Stop' | 'Pause' | 'Resume' | 'Cancel';
  timestamp: string;
  operatorId: string;
  remarks?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Paper' | 'Ink' | 'Plates' | 'Spare Parts' | 'Packaging' | 'Consumable' | 'Ink & Chemicals';
  unit: string;
  currentStock: number;
  openingStock: number;
  reorderLevel: number;
  purchasePrice: number;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  source: 'Self-Owned' | 'Party-Provided';
  providedBy?: string;
  hsnCode?: string;
  gstRate?: number;
  quantityUom: string;
  paperDetails?: {
    isReel: boolean;
    millName?: string;
    reelSizeCm?: number;
    gsm: number;
    sheetsPerPack?: 125 | 500;
  };
  photos: {
    label?: string;
    front?: string;
    back?: string;
  };
  additionalFields: Record<string, string>;
  lastUpdated: string;
  alternateUnit?: {
    unit: string;
    conversionFactor: number;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  lastServiceDate: string;
  nextServiceDate: string;
  status: 'Operational' | 'Maintenance' | 'Breakdown';
  serviceHistory: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  date: string;
  type: 'Preventive' | 'Repair';
  description: string;
  cost: number;
  technicianName: string;
}

export interface Contractor {
  id: string;
  name: string;
  type: 'Jobwork' | 'Service' | 'Supply';
  phone: string;
  email: string;
  panNo: string;
  tdsApplicable: boolean;
  tdsPercentage: number;
}

export interface ContractorPayment {
  id: string;
  contractorId: string;
  date: string;
  amount: number;
  tdsAmount: number;
  netAmount: number;
  projectId?: string;
  jobId?: string;
  status: 'Pending' | 'Paid';
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  status: 'Active' | 'Resigned' | 'Past Staff';
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Accountant' | 'Staff';
  isBlocked: boolean;
}

export interface Lead {
  id: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  interest: string;
  source: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Negotiating' | 'Converted' | 'Lost';
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  category: 'Service Engineer' | 'Past Staff' | 'Vendor' | 'Other';
  phone: string;
  email: string;
  remarks?: string;
}

export interface GRN {
  id: string;
  date: string;
  supplierId: string;
  challanNo: string;
  challanPhoto?: string;
  items: {
    itemId: string;
    quantity: number;
    price: number;
  }[];
  status: 'Completed' | 'Pending';
}

export interface DeliveryChallan {
  id: string;
  date: string;
  customerId: string;
  jobIds: string[];
  vehicleNo?: string;
  status: 'Generated' | 'In Transit' | 'Delivered';
}

export interface AppSettings {
  financialYear: string;
  disallowScreenshots: boolean;
}

export interface PricingConfig {
  id: string;
  paperPrices: {
    paperType: string;
    gsm: number;
    pricePerUnit: number;
  }[];
  printingRates: {
    machineType: string;
    ratePerHour: number;
    setupCost: number;
  }[];
  inkCostPerColor: number;
  plateCostPerPlate: number;
  laborCostPerManHour: number;
  overheadPercentage: number;
  profitMarginPercentage: number;
  gstPercentage: number;
}

export interface QuotationItem {
  id: string;
  product: string;
  size: string;
  quantity: number;
  details: string;
  paperType: string;
  gsm: number;
  printingType: string;
  noOfColors: number;
  noOfPlates: number;
  laborHours: number;
  finishingCost: number;
  costs: {
    paper: number;
    printing: number;
    ink: number;
    plate: number;
    labor: number;
    overhead: number;
    profit: number;
    subtotal: number;
    gst: number;
    total: number;
    unitPrice: number;
  };
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted' | 'Rejected';
  remarks?: string;
}
