import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Plus, Search, Filter, Truck, CheckCircle, 
  Clock, DollarSign, X, Download, Printer, Send, 
  MoreHorizontal, Users, Package, FileCheck, ArrowUpCircle,
  TrendingUp, Info, ChevronDown, ListOrdered, Factory, Trash2
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNo: string;
  vendorName: string;
  date: string;
  expectedDate: string;
  items: { name: string; qty: number; unit: string; rate: number }[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Partially Received' | 'Cancelled';
}

const mockPOs: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNo: 'SOP-PO-24-102',
    vendorName: 'Toyo Ink India',
    date: '2024-03-24',
    expectedDate: '2024-03-28',
    items: [
      { name: 'Cyan Offset Ink', qty: 10, unit: 'Kg', rate: 850 },
      { name: 'Standard Fountain Solution', qty: 20, unit: 'Liters', rate: 120 }
    ],
    totalAmount: 10900,
    status: 'Sent'
  },
  {
    id: 'PO-002',
    poNo: 'SOP-PO-24-103',
    vendorName: 'Reliable Paper House',
    date: '2024-03-25',
    expectedDate: '2024-03-27',
    items: [
      { name: '220 GSM Art Card', qty: 5000, unit: 'Sheets', rate: 12.50 }
    ],
    totalAmount: 62500,
    status: 'Received'
  }
];

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
}

const mockVendors: Vendor[] = [
  {
    id: 'V-001',
    name: 'Toyo Ink India',
    category: 'Ink & Chemicals',
    contactPerson: 'Mr. Rajesh Kumar',
    phone: '+91 98234 51122',
    email: 'info@toyoindia.com',
    address: 'Plot 45, MIDC, Taloja, Navi Mumbai',
    rating: 4.8
  },
  {
    id: 'V-002',
    name: 'Reliable Paper House',
    category: 'Paper & Boards',
    contactPerson: 'Amit Shah',
    phone: '+91 93222 11000',
    email: 'sales@reliablepaper.in',
    address: 'Gala 12, Swastik Estate, Kurla West',
    rating: 4.5
  },
  {
    id: 'V-003',
    name: 'Super Graphics',
    category: 'Plates & Consumables',
    contactPerson: 'Vikram Singh',
    phone: '+91 99000 88777',
    email: 'vikram@supergraphics.co',
    address: 'Sector 3A, Gandhinagar Industrial Area',
    rating: 4.2
  }
];

export default function PurchaseModule() {
  const [pos, setPos] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('printing_pms_pos');
    return saved ? JSON.parse(saved) : mockPOs;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('printing_pms_vendors');
    return saved ? JSON.parse(saved) : mockVendors;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_pos', JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    localStorage.setItem('printing_pms_vendors', JSON.stringify(vendors));
  }, [vendors]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'Ongoing' | 'History' | 'Vendors'>('Ongoing');

  const [selectedVendorInfo, setSelectedVendorInfo] = useState<Vendor | null>(null);
  const [inventory] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poItems, setPoItems] = useState<{ id: string; name: string; qty: number; unit: string; rate: number }[]>([]);
  const [currentItem, setCurrentItem] = useState({ id: '', name: '', qty: 1, unit: 'Nos', rate: 0 });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Received': return 'bg-success/10 text-success border-success/20';
      case 'Sent': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
      case 'Partially Received': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'Draft': return 'bg-gray-100 text-secondary border-gray-200';
      default: return 'bg-danger/10 text-danger border-danger/20';
    }
  };

  const handleCreatePO = () => {
    setIsModalOpen(true);
  };

  const postToLedger = (particulars: string, amount: number, isExpense: boolean) => {
    const savedLedger = localStorage.getItem('printing_pms_ledger');
    const ledger = savedLedger ? JSON.parse(savedLedger) : [
      { id: 'TXN-001', date: '2024-03-24', particulars: 'Opening Balance', category: 'Asset', debit: 0, credit: 0, balance: 145000 }
    ];

    const lastBalance = ledger.length > 0 ? ledger[0].balance : 0;
    const newBalance = isExpense ? lastBalance - amount : lastBalance + amount;

    const newEntry = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      particulars,
      category: isExpense ? 'Expense' : 'Income',
      debit: isExpense ? amount : 0,
      credit: isExpense ? 0 : amount,
      balance: newBalance
    };

    localStorage.setItem('printing_pms_ledger', JSON.stringify([newEntry, ...ledger]));
  };

  const handleAction = (type: string, po: PurchaseOrder) => {
    if (type === 'Verification') {
      const confirmReceive = window.confirm(`Mark PO ${po.poNo} as Received? This will post the expense to Ledger.`);
      if (confirmReceive) {
        setPos(pos.map(p => p.id === po.id ? { ...p, status: 'Received' } : p));
        postToLedger(`Purchase: ${po.poNo} (${po.vendorName})`, po.totalAmount, true);
        alert(`PO ${po.poNo} marked as received and expense recorded in Ledger.`);
      }
    } else if (type === 'Options') {
      const action = window.prompt(`Choose action for ${po.poNo}:\n1. Cancel\n2. Share via WhatsApp\n3. Download PDF\n4. Send Email`, "1");
      if (action === "1") {
        setPos(pos.map(p => p.id === po.id ? { ...p, status: 'Cancelled' } : p));
        alert('PO Cancelled successfully.');
      } else if (action === "2") {
        alert(`Sharing PO ${po.poNo} to Vendor ${po.vendorName} via WhatsApp...`);
      } else if (action === "3") {
        alert(`Generating PDF document for PO ${po.poNo}...`);
      } else if (action === "4") {
        alert(`Sending official email to ${po.vendorName} with PO attachment...`);
      }
    }
  };

  const createPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Please add at least one item to the PO.');
      return;
    }
    const totalAmount = poItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const newPO: PurchaseOrder = {
      id: `PO-00${pos.length + 1}`,
      poNo: `SOP-PO-24-${110 + pos.length}`,
      vendorName: (e.target as any).vendor.value,
      date: poDate,
      expectedDate: (e.target as any).expectedDate.value,
      items: poItems,
      totalAmount: totalAmount,
      status: 'Sent'
    };
    setPos([newPO, ...pos]);
    setIsModalOpen(false);
    // Reset states
    setPoItems([]);
    setPoDate(new Date().toISOString().split('T')[0]);
    setSelectedVendorInfo(null);
  };

  return (
    <div className="space-y-6">
      <datalist id="vendor-list">
        {vendors.map(v => <option key={v.id} value={v.name} />)}
      </datalist>
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-primary uppercase italic">New Purchase Order</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
               </button>
            </div>
             <form onSubmit={createPO} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-secondary mb-1 block tracking-widest pl-1">P.O. Date</label>
                     <input 
                       value={poDate}
                       onChange={(e) => setPoDate(e.target.value)}
                       type="date" 
                       required 
                       className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-primary focus:ring-4 focus:ring-accent-cyan/10 transition-all" 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-secondary mb-1 block tracking-widest pl-1">Exp. Delivery Date</label>
                     <input name="expectedDate" type="date" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-primary focus:ring-4 focus:ring-accent-cyan/10 transition-all" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block tracking-widest pl-1">Vendor / Supplier</label>
                  <input 
                    name="vendor" 
                    required 
                    list="vendor-list"
                    placeholder="Enter or Select Supplier name..."
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = vendors.find(v => v.name === val);
                      setSelectedVendorInfo(found || null);
                    }}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-primary focus:ring-4 focus:ring-accent-cyan/10 transition-all italic h-[56px]" 
                  />
               </div>

               {selectedVendorInfo && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-primary/5 rounded-[32px] border border-primary/10"
                  >
                    <p className="text-[9px] font-black uppercase text-secondary tracking-widest mb-3 opacity-60">Vendor Direct Information</p>
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div>
                        <span className="text-secondary font-bold uppercase block mb-1">Contact:</span>
                        <p className="font-black text-primary italic text-xs">{selectedVendorInfo.contactPerson}</p>
                      </div>
                      <div>
                        <span className="text-secondary font-bold uppercase block mb-1">Phone:</span>
                        <p className="font-black text-primary italic text-xs">{selectedVendorInfo.phone}</p>
                      </div>
                      <div className="col-span-2 mt-2">
                        <span className="text-secondary font-bold uppercase block mb-1">Office Address:</span>
                        <p className="font-bold text-primary leading-tight opacity-80">{selectedVendorInfo.address}</p>
                      </div>
                    </div>
                  </motion.div>
               )}

               <div className="p-8 bg-gray-50/50 rounded-[40px] border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                     <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Package size={14} className="text-accent-cyan" /> Item Selection & Listing
                     </p>
                     <span className="text-[9px] font-black text-secondary bg-white px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">{poItems.length} Added</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1 opacity-60">Choose Material / Supply</label>
                      <select 
                        value={currentItem.id}
                        onChange={(e) => {
                          const item = inventory.find(i => i.id === e.target.value);
                          if (item) {
                            setCurrentItem({ ...currentItem, id: item.id, name: item.name, unit: item.quantityUom, rate: item.purchasePrice });
                          } else if (e.target.value === 'CUSTOM') {
                            setCurrentItem({ ...currentItem, id: 'CUSTOM', name: 'Custom Item Name' });
                          }
                        }}
                        className="w-full px-5 py-4 text-xs font-black bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-accent-cyan/10 transition-all h-[52px] shadow-sm italic"
                      >
                        <option value="" className="font-sans">-- Select Stock Item --</option>
                        {inventory.map(i => (
                          <option key={i.id} value={i.id} className="font-sans">{i.name} ({i.quantityUom}) - Stock: {i.currentStock}</option>
                        ))}
                        <option value="CUSTOM" className="font-sans font-bold text-accent-cyan">+ Miscellaneous / Custom Item</option>
                      </select>
                    </div>

                    {currentItem.id === 'CUSTOM' && (
                      <input 
                        placeholder="Enter item name..."
                        className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl outline-none text-xs font-bold"
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      />
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Quantity</label>
                        <input 
                          type="number" 
                          value={currentItem.qty}
                          onChange={(e) => setCurrentItem({ ...currentItem, qty: Number(e.target.value) })}
                          className="w-full px-4 py-3 text-sm font-black bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-accent-cyan/10 transition-all h-[48px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Est. Rate (₹)</label>
                        <input 
                          type="number" 
                          value={currentItem.rate}
                          onChange={(e) => setCurrentItem({ ...currentItem, rate: Number(e.target.value) })}
                          className="w-full px-4 py-3 text-sm font-black bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-accent-cyan/10 transition-all h-[48px]"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button"
                          onClick={() => {
                            if (!currentItem.name || currentItem.name === 'Custom Item Name') {
                              alert('Please provide a valid item name');
                              return;
                            }
                            setPoItems([...poItems, { ...currentItem, id: currentItem.id === 'CUSTOM' ? Math.random().toString(36).substr(2, 6) : currentItem.id }]);
                            setCurrentItem({ id: '', name: '', qty: 1, unit: 'Nos', rate: 0 });
                          }}
                          className="w-full h-[48px] bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-accent-cyan transition-all shadow-lg shadow-primary/10"
                        >
                          Add Line
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {poItems.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
                      >
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1 opacity-40">Item Summary List</p>
                        {poItems.map((item, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                          >
                             <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-primary truncate italic uppercase">{item.name}</p>
                                <p className="text-[10px] text-secondary font-bold mt-0.5">{item.qty} {item.unit} x ₹{item.rate.toLocaleString()}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-primary italic">₹{(item.qty * item.rate).toLocaleString()}</span>
                                <button 
                                  onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                                  className="p-2 text-gray-300 hover:text-danger hover:bg-danger/5 rounded-full transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                             </div>
                          </motion.div>
                        ))}
                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">P.O. Valuation:</span>
                          <span className="text-xl font-black text-primary italic tracking-tighter">₹{poItems.reduce((sum, item) => sum + (item.qty * item.rate), 0).toLocaleString()}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
               <button 
                type="submit"
                className="w-full py-6 bg-primary text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:bg-accent-cyan hover:scale-[1.02] active:scale-95 transition-all mt-4"
               >
                 Authorize & Transmit PO
               </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Procurement & Vendors</h2>
          <p className="text-secondary text-sm font-medium">Manage supply chain, purchase orders, and supplier payments.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setViewMode('Vendors')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm ${viewMode === 'Vendors' ? 'bg-accent-cyan text-white border-transparent' : 'bg-white border border-gray-200 text-primary hover:bg-gray-50'}`}
          >
            <Users size={18} /> Vendor Directory
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all"
          >
            <Plus size={20} /> Create Purchase Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active POs', value: '12', icon: <ListOrdered />, subText: '4 Expected today' },
          { label: 'Vendor Payables', value: '₹1,45,200', icon: <Factory />, subText: 'Across 8 Vendors' },
          { label: 'Purchases (MTD)', value: '₹5,12,000', icon: <ShoppingCart />, subText: '+12% from last month' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="p-3 bg-gray-50 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all">
                {stat.icon}
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{stat.label}</p>
                <h4 className="text-2xl font-black text-primary mt-1">{stat.value}</h4>
                <p className="text-[10px] text-secondary/60 font-bold mt-1 italic tracking-widest uppercase">{stat.subText}</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
               {stat.icon && React.cloneElement(stat.icon as React.ReactElement, { size: 100 })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search PO #, vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan bg-white text-sm font-medium"
            />
          </div>
          <div className="flex bg-white rounded-xl border border-gray-100 p-1">
            <button 
              onClick={() => setViewMode('Ongoing')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'Ongoing' ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-50'}`}
            >
              Ongoing POs
            </button>
            <button 
              onClick={() => setViewMode('History')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'History' ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-50'}`}
            >
              History
            </button>
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          {viewMode === 'Vendors' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                  <th className="px-8 py-5">Vendor Detail</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Contact Info</th>
                  <th className="px-8 py-5">Reliability</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendors.filter(v => 
                  v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                          <Factory size={18} />
                        </div>
                        <div>
                          <span className="font-black text-sm text-primary">{vendor.name}</span>
                          <p className="text-[10px] text-secondary mt-1 font-bold">{vendor.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-full border border-gray-200">{vendor.category}</span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-primary">{vendor.contactPerson}</p>
                       <p className="text-[10px] text-secondary font-medium mt-1">{vendor.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-1 text-accent-amber">
                          <TrendingUp size={12} />
                          <span className="font-black text-sm">{vendor.rating}</span>
                          <span className="text-[10px] text-secondary font-bold ml-1 italic">/ 5.0</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => alert(`Direct PO for ${vendor.name} coming soon...`)}
                        className="p-3 bg-gray-50 rounded-2xl hover:bg-primary hover:text-white transition-all group/btn"
                       >
                          <ShoppingCart size={18} className="text-primary group-hover/btn:text-white" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                  <th className="px-8 py-5">PO Identification</th>
                  <th className="px-8 py-5">Vendor / Supplier</th>
                  <th className="px-8 py-5">PO Amount</th>
                  <th className="px-8 py-5">Current Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pos.filter(po => {
                  const matchesSearch = po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        po.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesMode = viewMode === 'History' ? po.status === 'Received' || po.status === 'Cancelled' : po.status !== 'Received' && po.status !== 'Cancelled';
                  return matchesSearch && matchesMode;
                }).map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-amber/5 rounded-2xl group-hover:bg-accent-amber group-hover:text-white transition-all">
                          <ListOrdered size={18} />
                        </div>
                        <div>
                          <span className="font-mono font-black text-sm text-primary tracking-tighter">{po.poNo}</span>
                          <p className="text-[10px] text-secondary mt-1 font-bold italic">Date: {po.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-primary opacity-80">{po.vendorName}</span>
                       <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest mt-1">Expected: {po.expectedDate}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="font-black text-primary text-lg tracking-tighter">₹{po.totalAmount.toLocaleString()}</span>
                       <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-tighter">{po.items.length} Line Items</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit ${getStatusStyle(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {po.status === 'Sent' && (
                          <button 
                            onClick={() => handleAction('Verification', po)}
                            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-success hover:text-white transition-all shadow-sm group/btn"
                            title="Mark as Received"
                          >
                            <FileCheck size={18} className="text-success group-hover/btn:text-white" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction('Options', po)}
                          className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-accent-amber/5 border border-accent-amber/20 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 group">
         <div className="p-6 bg-white rounded-3xl shadow-xl shadow-accent-amber/10 group-hover:scale-110 transition-transform duration-700">
            <Factory size={40} className="text-accent-amber" />
         </div>
         <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black text-primary font-sans uppercase tracking-widest">Smart Stock replenishment</h3>
            <p className="text-secondary text-sm font-medium leading-relaxed italic">AI is recommending POs for 3 materials (BILT Art Card, Offset Ink, Packaging Wrap) as they are reaching reorder levels based on upcoming queue.</p>
         </div>
         <button 
          onClick={() => alert('Generating 3 Automated Purchase Orders for low-stock items...')}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-cyan transition-all shadow-xl shadow-primary/20"
         >
           Generate Auto-POs
         </button>
      </div>
    </div>
  );
}
