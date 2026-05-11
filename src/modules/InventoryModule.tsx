import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Search, Filter, AlertCircle, ArrowDownCircle, ArrowUpCircle, X, 
  Tag, Box, Layers, History, Users, TrendingDown, TrendingUp, Info, MoreHorizontal,
  ChevronDown, DollarSign, Calculator, Printer, FileText, Truck, Camera, Settings, Trash2
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Paper' | 'Ink & Chemicals' | 'Plates' | 'Spare Parts' | 'Packaging' | 'Consumables';
  quantityUom: 'Sheets' | 'Kg' | 'Liters' | 'Nos' | 'Rolls' | 'Reams' | 'Packs';
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  purchasePrice: number;
  supplierId: string;
  supplierName: string;
  hsnCode?: string;
  gstRate?: number;
  lastUpdated: string;
  warehouse: 'Main Store' | 'Press Floor' | 'Warehouse-A' | 'Warehouse-B';
  source: 'Self-Owned' | 'Party-Provided';
  providedBy?: string; // Supplier Name (if Self-Owned) or Customer Name (if Party-Provided)
  alternateUnit?: {
    unit: string;
    conversionFactor: number; // e.g. 1 Alt Unit = X Base Units
  };
  paperDetails?: {
    isReel: boolean;
    millName?: string;
    reelSizeCm?: number;
    gsm: number;
    sheetsPerPack?: 125 | 500;
    packagingType?: 'Reams' | 'Bundles' | 'Cartons' | 'Loose'; 
  };
  photos: {
    label?: string;
    front?: string;
    back?: string;
  };
  additionalFields: Array<{key: string, value: string}>;
}

const mockInventory: InventoryItem[] = [
  { 
    id: 'MAT-P001', 
    name: '220 GSM BILT Art Card (A1)', 
    category: 'Paper', 
    openingStock: 5000,
    currentStock: 1200, 
    quantityUom: 'Sheets', 
    reorderLevel: 2000, 
    purchasePrice: 12.50,
    supplierId: 'SUP-001',
    supplierName: 'Reliable Paper House',
    lastUpdated: '2024-03-24',
    warehouse: 'Main Store',
    source: 'Self-Owned',
    paperDetails: { isReel: false, millName: 'BILT', gsm: 220, sheetsPerPack: 500 },
    photos: {},
    additionalFields: []
  },
  { 
    id: 'MAT-R005', 
    name: '89cm Maplitho Reel (Ballarpur)', 
    category: 'Paper', 
    openingStock: 2000,
    currentStock: 1500, 
    quantityUom: 'Kg', 
    reorderLevel: 500, 
    purchasePrice: 65.00,
    supplierId: 'SUP-001',
    supplierName: 'Reliable Paper House',
    lastUpdated: '2024-03-24',
    warehouse: 'Warehouse-A',
    source: 'Self-Owned',
    paperDetails: { isReel: true, millName: 'Ballarpur', reelSizeCm: 89, gsm: 70 },
    photos: {},
    additionalFields: [{key: 'Mill Name', value: 'BILT'}]
  },
  { 
    id: 'MAT-P002', 
    name: '70 GSM Glazed Newsprint (Party)', 
    category: 'Paper', 
    openingStock: 0,
    currentStock: 15000, 
    quantityUom: 'Sheets', 
    reorderLevel: 0, 
    purchasePrice: 0,
    supplierId: 'SUP-PARTY',
    supplierName: 'Malhotra Publishing (Customer)',
    lastUpdated: '2024-03-24',
    warehouse: 'Press Floor',
    source: 'Party-Provided',
    paperDetails: { isReel: false, millName: 'Mill X', gsm: 70 },
    photos: {},
    additionalFields: []
  },
  { 
    id: 'MAT-R006', 
    name: '60cm Offset Reel (BILT)', 
    category: 'Paper', 
    openingStock: 1000,
    currentStock: 800, 
    quantityUom: 'Kg', 
    reorderLevel: 200, 
    purchasePrice: 58.00,
    supplierId: 'SUP-001',
    supplierName: 'Reliable Paper House',
    lastUpdated: '2024-03-24',
    warehouse: 'Warehouse-B',
    source: 'Self-Owned',
    paperDetails: { isReel: true, millName: 'BILT', reelSizeCm: 60, gsm: 60 },
    photos: {},
    additionalFields: []
  }
];

const categories = ['All', 'Paper', 'Ink & Chemicals', 'Plates', 'Spare Parts', 'Packaging', 'Consumables'];

interface Warehouse {
  id: string;
  name: string;
  location: string;
  type: 'Cold' | 'Standard' | 'Restricted' | 'Floor';
  manager: string;
}

export default function InventoryModule() {
  const [jobs] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeWarehouse, setActiveWarehouse] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);
  const [isWarehouseManagerOpen, setIsWarehouseManagerOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [itemToIssue, setItemToIssue] = useState<InventoryItem | null>(null);
  const [grnSource, setGrnSource] = useState<string>('Reliable Paper House');

  const [customers] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [machines] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_machines');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('printing_pms_inventory');
    return saved ? JSON.parse(saved) : mockInventory;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('printing_pms_warehouses');
    const defaultW = [
      { id: 'W-01', name: 'Main Store', location: 'Section A - Ground', type: 'Standard', manager: 'Anil Kumar' },
      { id: 'W-02', name: 'Press Floor', location: 'In-line Storage', type: 'Floor', manager: 'Suresh Singh' },
      { id: 'W-03', name: 'Warehouse-A', location: 'Annex Building', type: 'Standard', manager: 'Rajesh Sharma' },
      { id: 'W-04', name: 'Warehouse-B', location: 'Annex Building', type: 'Standard', manager: 'Rohan Mehra' },
    ];
    return saved ? JSON.parse(saved) : defaultW;
  });

  const [categoryFields, setCategoryFields] = useState<Record<string, string[]>>({
    'Paper': ['Mill Name', 'Finish'],
    'Ink & Chemicals': ['Manufacturer', 'Batch / Lot'],
    'Plates': ['Type', 'Coating'],
    'Spare Parts': ['Machine Model', 'OEM Part #'],
    'Packaging': ['Material Type'],
    'Consumables': ['Expiry Date']
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showGRN, setShowGRN] = useState(false);
  const [showGRNLog, setShowGRNLog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState<InventoryItem['category']>('Paper');
  const [selectedSource, setSelectedSource] = useState<'Self-Owned' | 'Party-Provided'>('Self-Owned');
  const [showAltUnit, setShowAltUnit] = useState(false);
  const [grnLines, setGrnLines] = useState<{itemName: string, qty: number, description: string, unit: string}[]>([{itemName: '', qty: 0, description: '', unit: ''}]);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [issueTargetType, setIssueTargetType] = useState<'JOB-CARD' | 'MACHINE'>('JOB-CARD');
  
  const [wastageLogs, setWastageLogs] = useState<{id: string, itemName: string, qty: number, reason: string, date: string}[]>(() => {
    const saved = localStorage.getItem('printing_pms_wastage');
    const defaultW = [
      { id: 'W-001', itemName: '220 GSM BILT Art Card', qty: 50, reason: 'Printing Spoilage', date: '2024-03-25' }
    ];
    return saved ? JSON.parse(saved) : defaultW;
  });

  const [grnHistory, setGrnHistory] = useState(() => {
    const saved = localStorage.getItem('printing_pms_grn_history');
    const defaultG = [
      { id: 'GRN/2024/042', date: '2024-03-24', item: '220 GSM BILT Art Card', qty: 500, vendor: 'Reliable Paper', status: 'Verified' },
      { id: 'GRN/2024/041', date: '2024-03-22', item: 'Toyo Cyan Ink', qty: 10, vendor: 'Toyo Ink India', status: 'Pending QC' },
      { id: 'GRN/2024/040', date: '2024-03-20', item: 'Thermal Plates', qty: 50, vendor: 'Imaging Systems', status: 'Verified' },
    ];
    return saved ? JSON.parse(saved) : defaultG;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('printing_pms_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('printing_pms_wastage', JSON.stringify(wastageLogs));
  }, [wastageLogs]);

  useEffect(() => {
    localStorage.setItem('printing_pms_grn_history', JSON.stringify(grnHistory));
  }, [grnHistory]);
  const [grnPhoto, setGrnPhoto] = useState<string | null>(null);

  const handleProcessGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const vendor = formData.get('vendor') as string;
    const providedBy = formData.get('providedBy') as string;

    if (grnLines.some(line => !line.itemName || line.qty <= 0)) {
      alert('Please ensure all items have a selection and a valid quantity.');
      return;
    }
    
    setInventory(prev => prev.map(item => {
      const lineMatch = grnLines.find(l => l.itemName === item.name);

      if (lineMatch) {
        return { 
          ...item, 
          currentStock: item.currentStock + lineMatch.qty, 
          lastUpdated: new Date().toISOString().split('T')[0] 
        };
      }
      return item;
    }));

    // Register logs
    const newLogs = grnLines.map(line => ({
      id: `GRN/2024/0${43 + grnHistory.length}`,
      date: new Date().toISOString().split('T')[0],
      item: `${line.itemName} (${line.unit})`,
      qty: line.qty,
      vendor: providedBy || vendor || 'GRN Entry',
      status: 'Verified'
    }));

    setGrnHistory([...newLogs, ...grnHistory]);
    setShowGRN(false);
    setGrnLines([{itemName: '', qty: 0, description: '', unit: ''}]);
    alert(`GRN Processed Successfully. ${grnLines.length} item(s) inward registered.`);
  };

  const handleAddWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const itemName = formData.get('itemName') as string;
    const qty = Number(formData.get('qty'));
    const reason = formData.get('reason') as string;

    if (!itemName || qty <= 0) {
      alert('Invalid wastage data.');
      return;
    }

    // Update stock
    setInventory(prev => prev.map(item => 
      item.name === itemName 
        ? { ...item, currentStock: item.currentStock - qty, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ));

    // Log wastage
    const newWastage = {
      id: `W-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      itemName,
      qty,
      reason,
      date: new Date().toISOString().split('T')[0]
    };
    setWastageLogs([newWastage, ...wastageLogs]);
    setIsWastageModalOpen(false);
    alert('Wastage logged and stock adjusted.');
  };

  const addGrnLine = () => {
    setGrnLines([...grnLines, {itemName: '', qty: 0, description: '', unit: ''}]);
  };

  const updateGrnLine = (index: number, field: 'itemName' | 'qty' | 'description' | 'unit', value: string | number) => {
    const updated = [...grnLines];
    updated[index] = { ...updated[index], [field]: value };
    setGrnLines(updated);
  };

  const removeGrnLine = (index: number) => {
    if (grnLines.length > 1) {
      setGrnLines(grnLines.filter((_, i) => i !== index));
    } else {
      setGrnLines([{itemName: '', qty: 0, description: ''}]);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const categoryMapping: Record<string, InventoryItem['category']> = {
      'Paper': 'Paper',
      'Ink': 'Ink & Chemicals',
      'Plates': 'Plates',
      'Spare': 'Spare Parts',
      'Packaging': 'Packaging',
      'Consumables': 'Consumables'
    };

    const category = formData.get('category') as InventoryItem['category'] || 'Paper';
    const isReel = formData.get('isReel') === 'on';

    const additionalFields: {key: string, value: string}[] = (categoryFields[category] || []).map(fieldName => ({
      key: fieldName,
      value: formData.get(`custom_${fieldName}`) as string || ''
    }));

    const newItem: InventoryItem = {
      id: `MAT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: formData.get('name') as string,
      category,
      openingStock: Number(formData.get('stock')),
      currentStock: Number(formData.get('stock')),
      quantityUom: formData.get('quantityUom') as InventoryItem['quantityUom'],
      reorderLevel: Number(formData.get('reorderLevel')),
      purchasePrice: Number(formData.get('price')),
      hsnCode: formData.get('hsnCode') as string,
      gstRate: Number(formData.get('gstRate')),
      supplierId: 'SUP-NEW',
      supplierName: formData.get('supplier') as string,
      lastUpdated: new Date().toISOString().split('T')[0],
      warehouse: (formData.get('warehouse') as any) || 'Main Store',
      source: selectedSource,
      providedBy: formData.get('providedBy') as string,
      alternateUnit: showAltUnit ? {
        unit: formData.get('altUnit') as string,
        conversionFactor: Number(formData.get('conversionFactor'))
      } : undefined,
      paperDetails: {
        isReel,
        millName: formData.get('millName') as string, // Added Mill Name
        reelSizeCm: isReel ? Number(formData.get('reelSize')) : undefined,
        gsm: Number(formData.get('gsm')),
        sheetsPerPack: Number(formData.get('sheetsPerPack')) as any
      },
      photos: {},
      additionalFields
    };
    setInventory([newItem, ...inventory]);
    setIsModalOpen(false);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const warehouseData: Warehouse = {
      id: editingWarehouse?.id || `W-0${warehouses.length + 1}`,
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as any,
      manager: formData.get('manager') as string,
    };
    
    if (editingWarehouse) {
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? warehouseData : w));
      setEditingWarehouse(null);
    } else {
      setWarehouses([...warehouses, warehouseData]);
    }
    (e.target as HTMLFormElement).reset();
    alert(editingWarehouse ? 'Warehouse updated successfully!' : 'Warehouse registered happily!');
  };

  const filteredItems = inventory.filter(i => {
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchesWarehouse = activeWarehouse === 'All' || i.warehouse === activeWarehouse;
    const matchesSearch = (i.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (i.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && matchesWarehouse;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans">Inventory & Store Management</h2>
          <p className="text-secondary text-sm">Track raw materials, issue stock to jobs, and monitor reorder levels.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsWarehouseManagerOpen(true)}
            className="bg-white border border-gray-200 text-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <Layers size={20} className="text-accent-cyan" /> Multi-Warehouse
          </button>
          <button 
            onClick={() => setIsFieldManagerOpen(true)}
            className="bg-white border border-gray-200 text-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <Settings size={20} className="text-secondary group-hover:rotate-90 transition-transform" /> Manage Fields
          </button>
          <button 
            onClick={() => setShowGRN(true)}
            className="group bg-white border border-gray-200 text-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ArrowDownCircle size={20} className="text-accent-cyan group-hover:text-white transition-colors" /> New GRN
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-accent-cyan text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <Plus size={20} /> Add New Material
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Inventory Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
                <div className="flex flex-col gap-4 w-full">
                   <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                     {categories.map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat)}
                         className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                           activeCategory === cat ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-100'
                         }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                   <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full border-t border-gray-100 pt-3">
                     <span className="text-[10px] font-black uppercase text-secondary mr-2">Location:</span>
                     {['All', ...warehouses.map(w => w.name)].map((w) => (
                       <button
                         key={w}
                         onClick={() => setActiveWarehouse(w)}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                           activeWarehouse === w ? 'bg-accent-cyan border-accent-cyan text-white shadow-md' : 'text-secondary border-gray-200 hover:bg-white'
                         }`}
                       >
                         {w}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="relative w-full md:w-72">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                   <input 
                     type="text" 
                     placeholder="Search item or SKU..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                   />
                </div>
             </div>
             
             <div className="overflow-x-auto font-sans">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                      <th className="px-6 py-4">Item Identification</th>
                      <th className="px-6 py-4">Tax & Price</th>
                      <th className="px-6 py-4 text-center">Current Stock</th>
                      <th className="px-6 py-4 text-center">Batch / Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-2xl ${
                               item.category === 'Paper' ? 'bg-accent-cyan/10 text-accent-cyan' :
                               item.category === 'Ink & Chemicals' ? 'bg-accent-magenta/10 text-accent-magenta' :
                               'bg-accent-amber/10 text-accent-amber'
                             }`}>
                                {item.category === 'Paper' && <FileText size={20} />}
                                {item.category === 'Ink & Chemicals' && <Tag size={20} />}
                                {item.category === 'Plates' && <Layers size={20} />}
                                {item.category === 'Packaging' && <Box size={20} />}
                             </div>
                             <div>
                               <p className="font-bold text-primary group-hover:text-accent-cyan transition-colors">{item.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-secondary font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded">{item.id}</span>
                                  <span className="text-[10px] text-secondary/60 font-bold uppercase tracking-tighter italic">{item.category}</span>
                               </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-primary">₹{item.purchasePrice.toFixed(2)} / {item.quantityUom}</p>
                           <p className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-1">
                               {item.source === 'Party-Provided' ? <Briefcase size={10} /> : <Users size={10} />}
                               {item.source === 'Party-Provided' ? `Party: ${item.providedBy || 'Unknown'}` : item.supplierName}
                           </p>
                           <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                              <span className="text-[9px] font-black text-white bg-primary px-1.5 py-0.5 rounded border border-primary/20 shrink-0">HSN: {item.hsnCode || 'N/A'}</span>
                              <span className="text-[9px] font-black text-accent-cyan bg-accent-cyan/5 px-1.5 py-0.5 rounded border border-accent-cyan/20 shrink-0">GST: {item.gstRate || '0'}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-block text-center">
                            <p className={`text-xl font-black ${item.currentStock <= item.reorderLevel ? 'text-danger' : 'text-primary'}`}>
                               {item.currentStock.toLocaleString()}
                            </p>
                            <span className="text-[10px] text-secondary font-black uppercase opacity-40">{item.quantityUom}</span>
                            {item.alternateUnit && (
                              <p className="text-[9px] text-accent-cyan font-bold italic mt-0.5">
                                 ≈ {(item.currentStock / item.alternateUnit.conversionFactor).toFixed(1)} {item.alternateUnit.unit}s
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex flex-col items-center gap-2">
                             <span className={`text-[9px] font-black uppercase px-2 py-1 rounded shadow-sm border ${
                               item.currentStock <= item.reorderLevel ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                             }`}>
                               {item.currentStock <= item.reorderLevel ? 'Low Stock' : 'Optimized'}
                             </span>
                             <span className="text-[9px] text-secondary opacity-50 font-bold">Updated: {item.lastUpdated}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setItemToIssue(item);
                                  setIsIssueModalOpen(true);
                                }}
                                className="p-2 hover:bg-accent-cyan/10 hover:text-accent-cyan rounded-xl transition-all"
                                title="Issue Material"
                              >
                                 <ArrowUpCircle size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-secondary"
                                title="View Details"
                              >
                                 <MoreHorizontal size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                   <h3 className="text-lg font-black text-primary mb-1 font-sans">Stock Health</h3>
                   <p className="text-secondary text-xs">Total material value in inventory: <span className="font-bold text-primary italic">₹1,45,200</span></p>
                </div>
                <div className="mt-8 space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-secondary">Consumption Rate</span>
                      <TrendingUp size={16} className="text-success" />
                   </div>
                   <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-cyan w-[65%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                   </div>
                   <p className="text-[10px] text-secondary/60 font-bold italic text-right">Based on last 30 days job logs</p>
                </div>
             </div>
             <Calculator size={140} className="absolute -right-5 -bottom-5 text-gray-50/50 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6 text-accent-amber">
                <AlertCircle size={24} />
                <h3 className="text-lg font-bold text-primary font-sans">Critical Alerts</h3>
             </div>
             <div className="space-y-4">
                {inventory.filter(i => i.currentStock <= i.reorderLevel).map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-danger/5 border border-danger/10 group hover:shadow-md transition-all">
                     <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-xs text-primary">{item.name}</p>
                        <button 
                          onClick={() => {
                            if (confirm(`Generate urgent Purchase Order for ${item.name} from ${item.supplierName}?`)) {
                              alert(`PO #URG-${Math.floor(1000 + Math.random() * 9000)} generated and sent to ${item.supplierName}. Check Purchase Module for status.`);
                            }
                          }}
                          className="text-[9px] font-black text-white bg-accent-cyan px-2 py-1 rounded shadow-sm hover:scale-105 transition-transform uppercase tracking-tighter"
                        >
                          Place PO
                        </button>
                     </div>
                     <div className="flex justify-between text-[10px] text-secondary font-bold">
                        <span>Has: {item.currentStock} {item.quantityUom}</span>
                        <span className="opacity-50">Min: {item.reorderLevel}</span>
                     </div>
                     <div className="mt-3 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-danger h-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)]" 
                          style={{ width: `${(item.currentStock/item.reorderLevel)*100}%` }} 
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <button 
            onClick={() => setShowGRNLog(true)}
            className="w-full bg-white border-2 border-dashed border-gray-200 p-5 rounded-3xl text-secondary hover:border-accent-cyan hover:text-accent-cyan transition-all flex flex-col items-center gap-2 group"
          >
             <History size={24} className="group-hover:rotate-180 transition-transform duration-700" />
             <span className="text-xs font-black uppercase tracking-widest">Inventory Logs / GRN History</span>
          </button>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-accent-magenta">
                   <TrendingDown size={24} />
                   <h3 className="text-lg font-bold text-primary font-sans">Wastage Log</h3>
                </div>
                <button 
                  onClick={() => setIsWastageModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-accent-magenta"
                >
                  <Plus size={18} />
                </button>
             </div>
             <div className="space-y-3">
                {wastageLogs.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-primary truncate max-w-[120px]">{log.itemName}</span>
                        <span className="text-[10px] font-black text-danger">-{log.qty}</span>
                     </div>
                     <p className="text-[9px] text-secondary font-bold italic">{log.reason}</p>
                     <p className="text-[8px] text-secondary/40 font-bold mt-1 uppercase">{log.date}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden font-sans flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white shrink-0">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-xl">
                      <Package size={20} />
                   </div>
                   <h3 className="text-xl font-bold">Catalog New Material</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="flex flex-col overflow-hidden bg-gray-50/30">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                       Item Full Name / Description
                    </label>
                    <input name="name" required placeholder="Technova Eros 610 x 914" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-wider">Category</label>
                      <select 
                        name="category" 
                        value={selectedAddCategory}
                        onChange={(e) => setSelectedAddCategory(e.target.value as InventoryItem['category'])}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold"
                      >
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center justify-between">
                         Quantity (UOM)
                         <button 
                           type="button" 
                           onClick={() => setShowAltUnit(!showAltUnit)}
                           className={`text-[9px] px-2 py-0.5 rounded ${showAltUnit ? 'bg-primary text-white' : 'bg-gray-100 text-secondary'} transition-colors`}
                         >
                            {showAltUnit ? 'Remove Alt Unit' : '+ Add Alt Unit'}
                         </button>
                      </label>
                      <div className="space-y-3">
                        <select name="quantityUom" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold">
                          <option value="Sheet">Sheets</option>
                          <option value="Kg">Kg</option>
                          <option value="Nos">Nos</option>
                          <option value="Liters">Liters</option>
                          <option value="Rolls">Rolls</option>
                          <option value="Reams">Reams</option>
                          <option value="Packs">Packs</option>
                        </select>

                        {showAltUnit && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 overflow-hidden"
                          >
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black text-secondary tracking-widest uppercase">Alt Unit Name</label>
                                   <input name="altUnit" placeholder="e.g. Box" className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black text-secondary tracking-widest uppercase">Conversion (1 Alt = ?)</label>
                                   <input name="conversionFactor" type="number" step="0.01" placeholder="e.g. 50" className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
                                </div>
                             </div>
                             <p className="text-[9px] text-secondary/60 italic leading-tight">Example: If 1 Box contains 50 Nos, enter "Box" and "50". Stock will be managed in Nos but you can view in Boxes.</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-wider">HSN Code</label>
                      <input name="hsnCode" placeholder="Ex: 4802" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-primary uppercase tracking-wider">GST Rate (%)</label>
                       <select name="gstRate" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold">
                         <option value="0">0% (Exempt)</option>
                         <option value="5">5%</option>
                         <option value="12">12%</option>
                         <option value="18" selected>18%</option>
                         <option value="28">28%</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider">Warehouse</label>
                    <select name="warehouse" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold">
                      {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider">Source</label>
                    <select 
                      name="source" 
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold"
                    >
                      <option value="Self-Owned">Self-Owned (Company Purchase)</option>
                      <option value="Party-Provided">Party-Provided (Job Specific)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider italic">
                      {selectedSource === 'Self-Owned' ? 'Preferred Supplier' : 'Select Party (Customer)'}
                    </label>
                    <div className="relative group">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/30 group-focus-within:text-accent-cyan transition-colors" size={16} />
                       <select name="providedBy" required className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold">
                          <option value="">{selectedSource === 'Self-Owned' ? 'Choose Supplier...' : 'Choose Customer...'}</option>
                          {selectedSource === 'Self-Owned' 
                            ? ['Reliable Paper House', 'Toyo Ink India', 'Imaging Systems', 'Packaging Solutions'].map(s => <option key={s} value={s}>{s}</option>)
                            : customers.map(c => <option key={c.id} value={c.company || c.name}>{c.company || c.name}</option>)
                          }
                          <option value="New/Other">+ Add New Party</option>
                       </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-4 bg-accent-cyan/5 rounded-2xl border border-accent-cyan/20 space-y-4">
                    <p className="text-[10px] font-black uppercase text-accent-cyan">Paper Specific Details</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isReel" className="w-4 h-4 accent-accent-cyan" />
                        <span className="text-xs font-bold text-primary">Is Paper Reel?</span>
                      </label>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-secondary uppercase">Mill Name / Manufacturer</label>
                        <input name="millName" type="text" placeholder="e.g. BILT, Khanna" className="w-full px-3 py-1 bg-white border rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-secondary uppercase">Reel Size (cm)</label>
                        <input name="reelSize" type="number" placeholder="e.g. 89" className="w-full px-3 py-1 bg-white border rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-secondary uppercase">GSM</label>
                        <input name="gsm" type="number" placeholder="70" className="w-full px-3 py-1 bg-white border rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-secondary uppercase">Packaging (Sheets/Pack)</label>
                        <select name="sheetsPerPack" className="w-full px-3 py-1 bg-white border rounded text-xs">
                           <option value="500">500 Sheets (Standard)</option>
                           <option value="125">125 Sheets</option>
                           <option value="1">Loose / Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-secondary uppercase">Packaging Type</label>
                        <select name="packagingType" className="w-full px-3 py-1 bg-white border rounded text-xs">
                          <option value="Reams">Reams</option>
                          <option value="Bundles">Bundles</option>
                          <option value="Cartons">Cartons</option>
                          <option value="Loose">Loose</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <p className="text-[10px] font-black uppercase text-secondary">Material Photos (3 Required)</p>
                    <div className="grid grid-cols-3 gap-4">
                      {['Label', 'Front', 'Back'].map(label => (
                        <div key={label} className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-accent-cyan transition-all cursor-pointer bg-white group">
                           <Printer size={16} className="text-gray-300 group-hover:text-accent-cyan" />
                           <span className="text-[8px] font-black uppercase text-secondary">{label} Photo</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider">Opening Stock</label>
                    <input name="stock" type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-wider">Reorder Level</label>
                    <input name="reorderLevel" type="number" required placeholder="10" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl" />
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-white flex gap-4 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary hover:bg-gray-100 transition-all">
                    Dismiss
                  </button>
                  <button type="submit" className="flex-1 px-4 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all">
                    Register Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRN Modal (Simulated) */}
      <AnimatePresence>
        {isViewModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 font-sans">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-primary uppercase italic">{selectedItem.name}</h3>
                    <p className="text-secondary text-[10px] font-bold tracking-widest uppercase mt-1">{selectedItem.id} • {selectedItem.category}</p>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[10px] font-black text-secondary uppercase opacity-50 mb-1">Current Stock</p>
                     <p className="text-2xl font-black text-primary">{selectedItem.currentStock} <span className="text-sm opacity-50 font-bold uppercase">{selectedItem.quantityUom}</span></p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[10px] font-black text-secondary uppercase opacity-50 mb-1">Purchase Price</p>
                     <p className="text-2xl font-black text-primary">₹{selectedItem.purchasePrice.toFixed(2)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-accent-cyan/5 rounded-2xl border border-accent-cyan/10">
                     <p className="text-[9px] font-black text-accent-cyan uppercase mb-1">HSN Code</p>
                     <p className="text-lg font-black text-primary uppercase italic">{selectedItem.hsnCode || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-accent-cyan/5 rounded-2xl border border-accent-cyan/10">
                     <p className="text-[9px] font-black text-accent-cyan uppercase mb-1">GST Rate</p>
                     <p className="text-lg font-black text-primary uppercase italic">{selectedItem.gstRate || 12}%</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                     <span className="font-bold text-secondary">Preferred Supplier</span>
                     <span className="font-black text-primary uppercase italic">{selectedItem.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                     <span className="font-bold text-secondary">Minimum Reorder Level</span>
                     <span className="font-black text-danger uppercase italic">{selectedItem.reorderLevel} {selectedItem.quantityUom}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                     <span className="font-bold text-secondary">Source Type</span>
                     <span className="font-black text-primary uppercase italic">{selectedItem.source}</span>
                  </div>
                  {selectedItem.source === 'Party-Provided' && (
                    <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                       <span className="font-bold text-secondary">Provided By (Customer)</span>
                       <span className="font-black text-accent-cyan uppercase italic">{selectedItem.providedBy}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                     <span className="font-bold text-secondary">Warehouse Location</span>
                     <span className="font-black text-primary uppercase italic">{selectedItem.warehouse}</span>
                  </div>
               </div>

               {selectedItem.additionalFields && selectedItem.additionalFields.length > 0 && (
                  <div className="mt-6 p-4 bg-accent-cyan/5 rounded-2xl border border-accent-cyan/10">
                     <p className="text-[10px] font-black uppercase text-accent-cyan tracking-widest mb-3">Custom Attributes</p>
                     <div className="grid grid-cols-2 gap-y-3">
                        {selectedItem.additionalFields.map(field => (
                           <div key={field.key}>
                              <p className="text-[9px] font-bold text-secondary uppercase opacity-60">{field.key}</p>
                              <p className="text-xs font-bold text-primary">{field.value || 'N/A'}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               <div className="mt-8 grid grid-cols-2 gap-3">
                  <button onClick={() => {
                    const report = `INVENTORY MOVEMENT REPORT: ${selectedItem.name}\nPeriod: Last 30 Days\nOpening: ${selectedItem.openingStock}\nConsumed: ${selectedItem.openingStock - selectedItem.currentStock}\nClosing: ${selectedItem.currentStock}`;
                    const blob = new Blob([report], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `StockReport_${selectedItem.id}.txt`;
                    link.click();
                    setTimeout(() => window.print(), 500);
                  }} className="px-4 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase text-secondary hover:bg-gray-100 transition-all">Stock Report</button>
                  <button onClick={() => {
                    const msg = window.prompt('Enter message for Vendor:', `Inquiry regarding ${selectedItem.name} stock & pricing.`);
                    if(msg) alert(`Message sent to ${selectedItem.supplierName} via ERP Gateway.`);
                  }} className="px-4 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all">Contact Vendor</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGRNLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGRNLog(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden font-sans flex flex-col border-4 border-white">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter">GRN Movement History</h3>
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest">Historical material inward registry</p>
                  </div>
                  <button onClick={() => setShowGRNLog(false)} className="p-4 hover:bg-gray-100 rounded-full"><X size={20} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-4 text-xs">
                  {grnHistory.map((log, i) => (
                    <div key={i} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan transition-colors shadow-sm text-secondary">
                             <TrendingDown size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-primary">{log.id}</p>
                             <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter">{log.date} • {log.vendor}</p>
                             <p className="text-[10px] text-accent-cyan font-bold mt-1">{log.item}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-primary">+{log.qty}</p>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${log.status === 'Verified' ? 'bg-success/10 text-success' : 'bg-accent-amber/10 text-accent-amber'}`}>{log.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-8 border-t border-gray-100 text-center">
                  <p className="text-[10px] font-black text-secondary uppercase opacity-40">End of recent logs</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGRN && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGRN(false)}
              className="absolute inset-0 bg-primary/60 backdrop-blur-md"
            />
            <form 
              onSubmit={handleProcessGRN}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans border-4 border-white"
            >
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-accent-cyan/10 text-accent-cyan rounded-[25px]">
                        <Truck size={32} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-primary">Goods Receipt Note</h3>
                        <p className="text-secondary text-xs uppercase tracking-widest font-bold">Register Incoming Material Inward</p>
                     </div>
                  </div>
                  <button onClick={() => setShowGRN(false)} className="p-4 hover:bg-gray-100 rounded-full transition-colors text-secondary">
                     <X size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2 space-y-8">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                             <TrendingDown size={14} className="text-accent-cyan" /> Shipment Identification
                           </h4>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-primary uppercase">Inward Date</label>
                                 <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-primary uppercase">Vendor Invoice #</label>
                                 <input type="text" placeholder="INV-2024-001" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-primary uppercase">Select Supplier / Inward Source</label>
                              <select 
                                name="vendor" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                value={grnSource}
                                onChange={(e) => setGrnSource(e.target.value)}
                              >
                                 <option>Reliable Paper House</option>
                                 <option>Toyo Ink India</option>
                                 <option>Imaging Systems</option>
                                 <option value="Party-Provided">Party Provided (Customer Supply)</option>
                              </select>
                           </div>
                           {grnSource === 'Party-Provided' && (
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-primary uppercase">Choose Customer</label>
                                <select name="providedBy" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm" required>
                                   <option value="">Select Customer...</option>
                                   {customers.map(c => <option key={c.id} value={c.company || c.name}>{c.company || c.name}</option>)}
                                </select>
                             </div>
                           )}
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Material Details</h4>
                                 <div className="flex gap-2">
                                    <label className="cursor-pointer p-2 bg-accent-cyan/10 text-accent-cyan rounded-xl hover:bg-accent-cyan hover:text-white transition-all flex items-center gap-2">
                                       <Camera size={14} />
                                       <span className="text-[9px] font-black uppercase">Challan Photo</span>
                                       <input 
                                          type="file" 
                                          accept="image/*" 
                                          capture="environment" 
                                          className="hidden" 
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => setGrnPhoto(reader.result as string);
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                       />
                                    </label>
                                 </div>
                              </div>

                              {grnPhoto && (
                                <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-accent-cyan shadow-lg mb-4 group">
                                   <img src={grnPhoto} alt="Challan" className="w-full h-full object-cover" />
                                   <button 
                                     onClick={() => setGrnPhoto(null)} 
                                     type="button"
                                     className="absolute top-1 right-1 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Trash2 size={10} />
                                   </button>
                                </div>
                              )}
                           </div>
                           <div className="space-y-4">
                              {grnLines.map((line, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                   <div className="flex-1">
                                      <p className="text-[10px] font-bold text-secondary uppercase mb-1">Item Selection</p>
                                      <select 
                                        value={line.itemName}
                                        onChange={(e) => {
                                           const item = inventory.find(i => i.name === e.target.value);
                                           updateGrnLine(index, 'itemName', e.target.value);
                                           if (item) updateGrnLine(index, 'unit', item.quantityUom);
                                         }}
                                        className="w-full bg-transparent font-bold text-sm outline-none"
                                      >
                                         <option value="">Select Item from Catalog...</option>
                                         {inventory.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                                      </select>
                                   </div>
                                   <div className="w-32">
                                      <p className="text-[10px] font-bold text-secondary uppercase mb-1">Stock Unit / Receipt Qty</p>
                                      <div className="flex items-center gap-1">
                                         <span className="text-[10px] font-bold text-accent-cyan bg-accent-cyan/5 px-2 py-0.5 rounded border border-accent-cyan/10 italic leading-none h-[28px] flex items-center">{line.unit || 'Unit'}</span>
                                         <input 
                                           type="number" 
                                           value={line.qty || ''}
                                           onChange={(e) => updateGrnLine(index, 'qty', Number(e.target.value))}
                                           className="w-full bg-transparent font-black text-sm outline-none border-b border-gray-100" 
                                           placeholder="0" 
                                         />
                                      </div>
                                   </div>
                                   <button 
                                      onClick={() => removeGrnLine(index)} 
                                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                   >
                                      <X size={16} />
                                   </button>
                                </div>
                              ))}
                              <button 
                                onClick={addGrnLine}
                                className="text-[10px] font-black uppercase text-accent-cyan tracking-widest flex items-center gap-2 py-2 px-1 hover:underline"
                              >
                                 <Plus size={14} /> Add Another Item
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-8 bg-primary rounded-[30px] text-white shadow-2xl relative overflow-hidden">
                           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">Summary</h4>
                           <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-center text-xs">
                                 <span className="font-bold opacity-60">Total Items</span>
                                 <span className="font-black">{grnLines.length}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                 <span className="font-bold opacity-60">Batch Auto-Gen</span>
                                 <span className="font-black">ENABLED</span>
                              </div>
                              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase tracking-widest">Inward Units</span>
                                 <span className="text-2xl font-black">{grnLines.reduce((sum, line) => sum + line.qty, 0)}</span>
                              </div>
                           </div>
                           <TrendingDown size={140} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                        </div>
                        <div className="p-6 bg-accent-amber/10 border border-accent-amber/20 rounded-3xl space-y-3">
                           <div className="flex items-center gap-2 text-accent-amber font-black text-[10px] uppercase">
                              <Info size={14} /> QC Verification
                           </div>
                           <p className="text-[10px] text-primary/70 font-medium leading-relaxed italic">By confirming this GRN, stock levels will be incremented automatically and a batch code will be generated for tracking.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-gray-100 bg-white flex justify-end gap-4">
                  <button type="button" onClick={() => setShowGRN(false)} className="px-8 py-4 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary hover:bg-gray-50">Cancel Entry</button>
                  <button 
                    type="submit"
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 hover:bg-accent-cyan transition-all"
                  >
                     Process Material Inward <ArrowUpCircle size={18} />
                  </button>
               </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* Field Manager Modal */}
      <AnimatePresence>
        {isFieldManagerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFieldManagerOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-2xl w-full border border-gray-100 font-sans">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-primary uppercase italic flex items-center gap-3"><Settings className="text-accent-cyan" /> Category Field Manager</h3>
                 <button onClick={() => setIsFieldManagerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                 {(Object.entries(categoryFields) as [string, string[]][]).map(([category, fields]) => (
                   <div key={category} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center">
                         <h4 className="text-sm font-black text-primary uppercase tracking-widest">{category}</h4>
                         <button 
                           onClick={() => {
                             const newField = prompt(`Add new field for ${category}:`);
                             if (newField) {
                               setCategoryFields(prev => ({
                                 ...prev,
                                 [category]: [...(prev[category] || []), newField]
                               }));
                             }
                           }}
                           className="text-[10px] font-black text-accent-cyan uppercase bg-white px-3 py-1.5 rounded-xl border border-accent-cyan/20 hover:bg-accent-cyan hover:text-white transition-all shadow-sm"
                         >
                           + Add Field
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {fields.map((field, idx) => (
                           <div key={idx} className="bg-white border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-2 group">
                              <span className="text-xs font-bold text-primary">{field}</span>
                              <button 
                                onClick={() => {
                                  setCategoryFields(prev => ({
                                    ...prev,
                                    [category]: prev[category].filter(f => f !== field)
                                  }));
                                }}
                                className="text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <X size={12} />
                              </button>
                           </div>
                         ))}
                         {fields.length === 0 && <p className="text-[10px] text-secondary/40 font-bold italic">No custom fields defined.</p>}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-10 flex gap-4">
                 <button 
                   onClick={() => setIsFieldManagerOpen(false)}
                   className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-cyan transition-colors"
                 >
                    Save & Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isWarehouseManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWarehouseManagerOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden font-sans border-4 border-white flex flex-col">
               <div className="p-8 bg-primary text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-white/10 rounded-3xl"><Layers size={32} /></div>
                     <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Central Store Control</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Multi-Warehouse & Rack Management</p>
                     </div>
                  </div>
                  <button onClick={() => setIsWarehouseManagerOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-gray-50/30">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Inventory Distribution Center</h4>
                        <div className="flex gap-2">
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-success"><div className="w-1.5 h-1.5 bg-success rounded-full" /> Optimized</span>
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-danger"><div className="w-1.5 h-1.5 bg-danger rounded-full" /> Low Stock</span>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-4">
                        {inventory.map(item => (
                          <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <p className="text-xs font-black text-primary uppercase italic">{item.name}</p>
                                   <p className="text-[9px] text-secondary font-bold">SKU: {item.id}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-lg font-black text-primary">{item.currentStock} <span className="text-[10px] opacity-40 font-bold">{item.quantityUom}</span></p>
                                   <p className="text-[9px] text-secondary font-bold uppercase tracking-widest italic">Total Consolidated</p>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {warehouses.map(w => {
                                   const isThisWarehouse = item.warehouse === w.name;
                                   return (
                                      <div key={w.id} className={`p-3 rounded-2xl border transition-all ${isThisWarehouse ? 'bg-accent-cyan/5 border-accent-cyan/20' : 'bg-gray-50 border-transparent opacity-60'}`}>
                                         <p className="text-[8px] font-black uppercase text-secondary mb-1 truncate">{w.name}</p>
                                         <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-primary">{isThisWarehouse ? item.currentStock : 0}</span>
                                            {isThisWarehouse && (
                                              <div className={`w-1.5 h-1.5 rounded-full ${item.currentStock <= item.reorderLevel ? 'bg-danger' : 'bg-success'}`} />
                                            )}
                                         </div>
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">
                           {editingWarehouse ? 'Edit Warehouse' : 'Provision New Warehouse'}
                        </h4>
                        <form onSubmit={handleSaveWarehouse} className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-primary uppercase">Warehouse Name</label>
                              <input name="name" required defaultValue={editingWarehouse?.name} placeholder="e.g. Export Unit-3" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-primary uppercase">Category/Type</label>
                                 <select name="type" defaultValue={editingWarehouse?.type} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold">
                                    <option value="Standard">Standard</option>
                                    <option value="Cold">Cold Storage</option>
                                    <option value="Restricted">Restricted</option>
                                    <option value="Floor">Press Floor</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-primary uppercase">Contact Person</label>
                                 <input name="manager" required defaultValue={editingWarehouse?.manager} placeholder="Manager Name" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-primary uppercase">Physical Location</label>
                              <input name="location" required defaultValue={editingWarehouse?.location} placeholder="Address or Section details..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                           </div>
                           <div className="flex gap-3">
                              {editingWarehouse && (
                                <button type="button" onClick={() => setEditingWarehouse(null)} className="flex-1 py-4 border border-gray-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-secondary">Cancel</button>
                              )}
                              <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all">
                                 {editingWarehouse ? 'Update Warehouse' : 'Submit Asset Registration'}
                              </button>
                           </div>
                        </form>
                     </div>

                     <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">Active Warehouses</h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                           {warehouses.map(w => (
                              <div key={w.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                 <div>
                                    <p className="text-xs font-black text-primary uppercase">{w.name}</p>
                                    <p className="text-[8px] text-secondary font-bold uppercase tracking-widest">{w.manager}</p>
                                 </div>
                                 <button 
                                   onClick={() => setEditingWarehouse(w)}
                                   className="p-2 text-secondary hover:text-accent-cyan hover:bg-white rounded-xl transition-all shadow-sm"
                                 >
                                    <Settings size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Wastage Modal */}
      <AnimatePresence>
        {isIssueModalOpen && itemToIssue && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsIssueModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full border border-gray-100 font-sans">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-primary uppercase italic flex items-center gap-3">
                    <ArrowUpCircle className="text-accent-cyan" /> Material Issuance
                  </h3>
                  <button onClick={() => setIsIssueModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
               </div>

               <div className="mb-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-60">Issuing Material:</p>
                  <p className="text-lg font-black text-primary italic uppercase tracking-tighter">{itemToIssue.name}</p>
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-200/50">
                    <div>
                      <p className="text-[9px] font-black text-secondary uppercase">Availability</p>
                      <p className="text-sm font-black text-primary">{itemToIssue.currentStock} {itemToIssue.quantityUom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-secondary uppercase">Category</p>
                      <p className="text-sm font-black text-primary">{itemToIssue.category}</p>
                    </div>
                  </div>
               </div>

               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const qty = Number(formData.get('issueQty'));
                 
                 const targetId = (issueTargetType === 'JOB-CARD' ? formData.get('targetIdJob') : formData.get('targetIdMachine')) as string;

                 if (qty > itemToIssue.currentStock) {
                   alert('Insufficient stock available!');
                   return;
                 }
                 if (!targetId) {
                   alert(`Please select a valid ${issueTargetType === 'JOB-CARD' ? 'Job' : 'Machine'}`);
                   return;
                 }

                 setInventory(prev => prev.map(inv => 
                   inv.id === itemToIssue.id 
                     ? { ...inv, currentStock: inv.currentStock - qty, lastUpdated: new Date().toISOString().split('T')[0] } 
                     : inv
                 ));

                 alert(`Successfully issued ${qty} ${itemToIssue.quantityUom} to ${issueTargetType}: ${targetId}`);
                 setIsIssueModalOpen(false);
               }} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-primary uppercase ml-1">Destination Target</label>
                       <select 
                         name="targetType" 
                         className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" 
                         required
                         value={issueTargetType}
                         onChange={(e) => setIssueTargetType(e.target.value as any)}
                       >
                          <option value="JOB-CARD">Job Card Order</option>
                          <option value="MACHINE">Machine (Spare Parts)</option>
                       </select>
                    </div>
                      <div className="space-y-2 flex-1 text-left">
                        {issueTargetType === 'JOB-CARD' ? (
                          <div>
                            <label className="text-[10px] font-black text-primary uppercase ml-1">Select Job Card</label>
                            <select name="targetIdJob" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary">
                               <option value="">Choose Job Reference...</option>
                               {jobs.map((j: any) => <option key={j.id} value={j.jcNo}>{j.jcNo} - {j.bookTitle || j.customerName}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] font-black text-primary uppercase ml-1">Select Machine</label>
                            <select name="targetIdMachine" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary">
                               <option value="">Choose Machine Asset...</option>
                               {machines.length > 0 ? (
                                 machines.map(m => (
                                   <option key={m.id} value={m.name}>{m.name} ({m.model})</option>
                                 ))
                               ) : (
                                 ['Heidelberg SM 74', 'Komori Lithrone G40', 'Polar 115 Paper Cutter', 'Folding Machine'].map(m => (
                                   <option key={m} value={m}>{m}</option>
                                 ))
                               )}
                            </select>
                          </div>
                        )}
                      </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase ml-1">Quantity to Issue ({itemToIssue.quantityUom})</label>
                    <input name="issueQty" type="number" required max={itemToIssue.currentStock} placeholder={`Max: ${itemToIssue.currentStock}`} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-xl italic text-accent-cyan" />
                 </div>

                 <div className="p-4 bg-accent-cyan/5 rounded-2xl border border-accent-cyan/20">
                    <p className="text-[10px] text-primary/70 font-medium leading-relaxed italic">Stock will be deducted from {itemToIssue.warehouse} instantly.</p>
                 </div>

                 <div className="flex gap-4">
                    <button type="button" onClick={() => setIsIssueModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px]">Close</button>
                    <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all">Authorize Issue</button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.95, y: 20 }} 
               className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden font-sans flex flex-col border-4 border-white"
             >
                <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/20">
                         <Box size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter">{selectedItem.name}</h3>
                         <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60">Inventory ID: {selectedItem.id}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsViewModalOpen(false)} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all text-secondary">
                      <X size={24} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-8">
                         <div className="grid grid-cols-2 gap-6 p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                            <div>
                               <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-40 mb-1">Current Stock</p>
                               <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-black text-primary italic">{selectedItem.currentStock.toLocaleString()}</span>
                                  <span className="text-xs font-black text-secondary uppercase">{selectedItem.quantityUom}</span>
                               </div>
                               {selectedItem.alternateUnit && (
                                 <p className="text-[10px] font-bold text-accent-cyan mt-2 italic">
                                    Equivalent to {(selectedItem.currentStock / selectedItem.alternateUnit.conversionFactor).toFixed(2)} {selectedItem.alternateUnit.unit}(s)
                                 </p>
                               )}
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-40 mb-1">Stock Status</p>
                               <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                 selectedItem.currentStock <= selectedItem.reorderLevel ? 'bg-danger text-white' : 'bg-success text-white'
                               }`}>
                                 {selectedItem.currentStock <= selectedItem.reorderLevel ? 'Reorder Urgent' : 'Good Standing'}
                               </span>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Material Specification</h4>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40">HSN Code</p>
                                  <p className="text-sm font-black text-primary">{selectedItem.hsnCode || 'N/A'}</p>
                               </div>
                               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40">GST Rate</p>
                                  <p className="text-sm font-black text-primary">{selectedItem.gstRate}%</p>
                               </div>
                               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40">Purchase Price</p>
                                  <p className="text-sm font-black text-primary">₹{selectedItem.purchasePrice.toLocaleString()} / {selectedItem.quantityUom}</p>
                               </div>
                               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40">Reorder Level</p>
                                  <p className="text-sm font-black text-primary">{selectedItem.reorderLevel.toLocaleString()} {selectedItem.quantityUom}</p>
                               </div>
                            </div>
                         </div>

                         {selectedItem.additionalFields.length > 0 && (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Category Details</h4>
                              <div className="grid grid-cols-1 gap-3">
                                 {selectedItem.additionalFields.map(f => (
                                   <div key={f.key} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                      <span className="text-[10px] font-black text-secondary uppercase">{f.key}</span>
                                      <span className="text-xs font-black text-primary italic uppercase tracking-tight">{f.value || '---'}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         )}
                      </div>

                      <div className="space-y-8">
                         <div className="p-6 bg-accent-amber/5 rounded-[32px] border border-accent-amber/20 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-amber flex items-center gap-2">
                               <Truck size={14} /> Logistics Trace
                            </h4>
                            <div className="space-y-4">
                               <div>
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40">Storage Zone</p>
                                  <p className="text-xs font-black text-primary uppercase italic">{selectedItem.warehouse}</p>
                               </div>
                               <div className="pt-4 border-t border-accent-amber/10">
                                  <p className="text-[9px] font-black text-secondary uppercase opacity-40 mb-2">Ownership & Party</p>
                                  <div className="bg-white p-3 rounded-xl border border-accent-amber/10">
                                     <p className="text-[10px] font-black text-primary uppercase tracking-tight">{selectedItem.providedBy || selectedItem.supplierName}</p>
                                     <p className="text-[8px] font-black text-secondary uppercase mt-1 italic">{selectedItem.source}</p>
                                  </div>
                                </div>
                            </div>
                         </div>

                         <button className="w-full flex items-center justify-center gap-3 p-5 bg-gray-50 rounded-[32px] border border-gray-100 text-secondary hover:text-accent-cyan hover:bg-white transiton-all group">
                            <History size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                            <span className="text-xs font-black uppercase tracking-widest">Movement History</span>
                         </button>

                         <button 
                           onClick={() => {
                             if(confirm('Are you sure you want to retire this material catalog? This will not delete historical logs.')) {
                               setInventory(inventory.filter(i => i.id !== selectedItem.id));
                               setIsViewModalOpen(false);
                               alert('Material retired successfully.');
                             }
                           }}
                           className="w-full flex items-center justify-center gap-3 p-5 bg-danger/5 rounded-[32px] border border-danger/10 text-danger hover:bg-danger hover:text-white transition-all shadow-sm"
                         >
                            <Trash2 size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Retire Asset</span>
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                   <button 
                     onClick={() => {
                       setItemToIssue(selectedItem);
                       setIsViewModalOpen(false);
                       setIsIssueModalOpen(true);
                     }}
                     className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:bg-accent-cyan transition-all"
                   >
                     Issue Material Outward
                   </button>
                   <button 
                     onClick={() => setIsViewModalOpen(false)} 
                     className="px-10 py-4 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary hover:bg-white"
                   >
                     Close Panel
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wastage Modal */}
      <AnimatePresence>
        {isWastageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWastageModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 font-sans">
               <h3 className="text-xl font-black text-accent-magenta uppercase italic mb-6 flex items-center gap-2">
                 <TrendingDown size={24} /> Log Material Wastage
               </h3>
               <form onSubmit={handleAddWastage} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary">Material / Item</label>
                    <select name="itemName" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-magenta">
                       <option value="">Select Item...</option>
                       {inventory.map(item => <option key={item.id} value={item.name}>{item.name} ({item.currentStock} {item.quantityUom})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary">Wastage Quantity</label>
                    <input name="qty" type="number" required placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-magenta" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary">Reason for Wastage</label>
                    <textarea name="reason" rows={3} placeholder="e.g. Plate scratching during setup, Ink contamination, etc." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-magenta text-sm" />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsWastageModalOpen(false)} className="flex-1 py-3 font-bold text-secondary">Discard</button>
                    <button type="submit" className="flex-1 py-3 bg-accent-magenta text-white rounded-xl font-bold shadow-lg shadow-accent-magenta/20">Reduce Stock</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
