import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, MapPin, Package, Clock, CheckCircle, Search, Filter, X, 
  User, Map as MapIcon, FileText, ChevronRight, Phone, Bike, Car,
  MoreVertical, Calendar, CheckSquare, Fingerprint, ShieldCheck, ExternalLink, Printer
} from 'lucide-react';

interface Delivery {
  id: string;
  jobIds: string[]; // Requirement #21: Multiple jobs in one DC
  jobTitles: string[];
  customer: string;
  address: string;
  date: string;
  mode: 'In-house Rider' | 'Courier' | 'Self Pickup' | 'Lorry';
  status: 'Pending' | 'Scheduled' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Returned';
  assignedTo?: string;
  challanNo?: string;
  podReceived: boolean;
  notes?: string;
  isEwayBill?: boolean; // Requirement #23
}

const mockDeliveries: Delivery[] = [
  { 
    id: 'DSP-001', 
    jobIds: ['JC-013', 'JC-014'], 
    jobTitles: ['GANITH Textbook Cover', 'Booklet Printing'], 
    customer: 'Malhotra Publishing', 
    address: 'Sector 62, Noida, UP - 201301', 
    date: '2024-03-25',
    mode: 'In-house Rider',
    status: 'In Transit',
    assignedTo: 'Rajesh Kumar',
    challanNo: 'DC/24/102',
    podReceived: false,
    isEwayBill: true
  },
  { 
    id: 'DSP-002', 
    jobIds: ['JC-014'], 
    jobTitles: ['Corporate Brochure'], 
    customer: 'Sharma Creative', 
    address: 'DLF Phase 3, Gurgaon, HR - 122002', 
    date: '2024-03-26',
    mode: 'Courier',
    status: 'Scheduled',
    assignedTo: 'BlueDart (Tracking: 1283921)',
    challanNo: 'DC/24/103',
    podReceived: false
  },
  { 
    id: 'DSP-003', 
    jobIds: ['JC-010'], 
    jobTitles: ['Company Annual Report'], 
    customer: 'Reliable Corp', 
    address: 'Connaught Place, New Delhi - 110001', 
    date: '2024-03-22',
    mode: 'Lorry',
    status: 'Delivered',
    assignedTo: 'Sunil Transport',
    challanNo: 'DC/24/098',
    podReceived: true
  },
];

export default function DeliveryModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('printing_pms_deliveries');
    return saved ? JSON.parse(saved) : mockDeliveries;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Delivered'>('All');
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '' });

  const customersData = [
    { name: 'Malhotra Publishing', address: 'Sector 62, Noida, UP - 201301' },
    { name: 'Sharma Creative', address: 'DLF Phase 3, Gurgaon, HR - 122002' },
    { name: 'Reliable Corp', address: 'Connaught Place, New Delhi - 110001' },
    { name: 'Global Education', address: 'Okhla Phase 3, New Delhi' },
  ];

  const handleScheduleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newDelivery: Delivery = {
      id: `DSP-00${deliveries.length + 1}`,
      jobIds: ['JC-NEW'],
      jobTitles: [formData.get('jobTitle') as string],
      customer: formData.get('customer') as string,
      address: formData.get('address') as string,
      date: formData.get('date') as string,
      mode: formData.get('mode') as Delivery['mode'],
      status: 'Scheduled',
      assignedTo: formData.get('rider') as string,
      challanNo: `DC/24/1${deliveries.length + 5}`,
      podReceived: false,
      isEwayBill: false
    };
    setDeliveries([newDelivery, ...deliveries]);
    setIsModalOpen(false);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-success/10 text-success border-success/20';
      case 'In Transit': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
      case 'Out for Delivery': return 'bg-accent-magenta/10 text-accent-magenta border-accent-magenta/20';
      case 'Scheduled': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      default: return 'bg-gray-100 text-secondary border-gray-200';
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.jobTitles.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) || d.customer.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || (activeTab === 'Active' && d.status !== 'Delivered') || (activeTab === 'Delivered' && d.status === 'Delivered');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <datalist id="delivery-customer-list">
        {customersData.map(c => <option key={c.name} value={c.name} />)}
      </datalist>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans">Dispatch & Fulfillment</h2>
          <p className="text-secondary text-sm">Coordinate deliveries, generate challans, and track proof of delivery.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-accent-cyan text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all font-sans"
          >
            <Truck size={20} /> New Dispatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
                <div className="flex bg-white p-1 rounded-xl border border-gray-100">
                  {['All', 'Active', 'Delivered'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-secondary hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                   <input 
                     type="text" 
                     placeholder="Search order, customer, or DC..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                   />
                </div>
             </div>

             <div className="divide-y divide-gray-50 font-sans">
                {filteredDeliveries.map(d => (
                  <div key={d.id} className="p-6 hover:bg-gray-50/30 transition-all group">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                           <div className={`p-4 rounded-2xl shadow-inner relative ${d.status === 'Delivered' ? 'bg-success/10 text-success' : 'bg-primary/5 text-primary'}`}>
                              {d.mode === 'In-house Rider' ? <Bike size={24} /> : d.mode === 'Lorry' ? <Truck size={24} /> : <Package size={24} />}
                              {d.isEwayBill && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan rounded-full border-2 border-white shadow-sm" title="e-Way Bill Attached" />
                              )}
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <h4 className="font-bold text-primary group-hover:text-accent-cyan transition-colors">{d.jobTitles.join(' + ')}</h4>
                                 <span className="text-[10px] font-black font-mono text-secondary px-2 py-0.5 bg-gray-100 rounded uppercase tracking-tighter">{d.id}</span>
                              </div>
                              <p className="text-sm font-bold text-secondary italic opacity-80">{d.customer}</p>
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <span className="text-[10px] text-secondary/60 flex items-center gap-1 font-bold">
                                   <MapPin size={12} className="text-danger" /> {d.address}
                                </span>
                                <span className="text-[10px] text-secondary/60 flex items-center gap-1 font-bold border-l pl-4">
                                   <FileText size={12} className="text-accent-cyan" /> {d.challanNo}
                                </span>
                                <span className="text-[10px] text-accent-magenta font-black uppercase tracking-tighter italic border-l pl-4">
                                   [{d.jobIds.join(', ')}]
                                </span>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 lg:gap-12 pl-14 lg:pl-0">
                           <div className="space-y-1 min-w-32">
                              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Transport Mode</p>
                              <p className="text-xs font-bold text-primary flex items-center gap-2">
                                 {d.mode}
                              </p>
                           </div>
                           
                           <div className="space-y-1 min-w-32">
                              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Shipment Status</p>
                              <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border text-center ${getStatusStyle(d.status)}`}>
                                 {d.status}
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="text-left md:text-right">
                                 <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Proof of Delivery</p>
                                 <div className={`flex items-center gap-2 text-[10px] font-black ${d.podReceived ? 'text-success' : 'text-accent-amber animate-pulse'}`}>
                                    {d.podReceived ? (
                                       <><CheckCircle size={14} /> Received</>
                                    ) : (
                                       <><Clock size={14} /> Pending POD</>
                                    )}
                                 </div>
                              </div>
                              <button 
                                onClick={() => window.print()}
                                className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm bg-gray-50 group-hover:bg-primary group-hover:text-white"
                                title="Print Delivery Challan"
                              >
                                 <Printer size={20} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (d.status !== 'Delivered' && confirm(`Change status of ${d.id} to next stage?`)) {
                                    const nextStatus: Record<string, Delivery['status']> = {
                                      'Scheduled': 'In Transit',
                                      'In Transit': 'Out for Delivery',
                                      'Out for Delivery': 'Delivered'
                                    };
                                    setDeliveries(prev => prev.map(item => item.id === d.id ? { ...item, status: nextStatus[item.status] || item.status, podReceived: (nextStatus[item.status] === 'Delivered') } : item));
                                  } else {
                                    alert(`Challan: ${d.challanNo}\nItems: ${d.jobTitles.join(', ')}\nAddress: ${d.address}`);
                                  }
                                }}
                                className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm bg-gray-50 group-hover:bg-primary group-hover:text-white"
                              >
                                 <ChevronRight size={20} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-black text-primary mb-6 font-sans flex items-center gap-2">
                   <ShieldCheck size={20} className="text-success" /> Fulfillment Health
                </h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-secondary">
                         <span>On-Time Dispatch</span>
                         <span className="text-success">98.2%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                         <div className="h-full bg-success w-[98%] shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-secondary">
                         <span>POD Accuracy</span>
                         <span className="text-accent-cyan">94.5%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                         <div className="h-full bg-accent-cyan w-[94%] shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => alert(`Fulfillment Health Report:\n- 98% On-Time Delivery Rate\n- 2% Average Delay\n- POD digitizing in progress. All sets verified.`)}
                  className="w-full mt-8 py-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-secondary rounded-xl hover:bg-primary hover:text-white transition-all border border-gray-100 flex items-center justify-center gap-2"
                >
                   View Analytics <ExternalLink size={14} />
                </button>
              </div>
              <Truck size={120} className="absolute -right-5 -bottom-5 text-gray-50/30 rotate-12 group-hover:scale-110 transition-transform duration-700" />
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4 flex items-center gap-2">
                 <Calendar size={14} className="text-accent-cyan" /> Upcoming Dispatches
              </h4>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                    <p className="text-xs font-bold text-primary">Luxury Wedding Bag - 200 Pcs</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-secondary">
                       <span className="flex items-center gap-1"><Clock size={12} /> Today, 4:00 PM</span>
                       <span className="text-accent-cyan">Scheduled</span>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 opacity-60">
                    <p className="text-xs font-bold text-primary">A4 Flyers - 5000 Qty</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-secondary">
                       <span className="flex items-center gap-1"><Clock size={12} /> Tomorrow, 10:00 AM</span>
                       <span className="text-secondary">Queued</span>
                    </div>
                 </div>
              </div>
           </div>

            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
               <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4 flex items-center gap-2">
                  <Package size={14} className="text-accent-cyan" /> Delivery Summary
               </h4>
               <div className="space-y-3 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase">
                     <span>Active Shipments</span>
                     <span className="text-sm font-black text-primary">04</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase">
                     <span>Pending POD</span>
                     <span className="text-sm font-black text-accent-amber">02</span>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Schedule Dispatch Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden font-sans border-4 border-white"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/10 rounded-2xl">
                      <Truck size={28} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black">Plan New Delivery</h3>
                     <p className="text-white/60 text-xs uppercase tracking-widest font-bold mt-1">Schedule Dispatch & Mode</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form id="dispatch-form" onSubmit={handleScheduleDispatch} className="p-10 space-y-8 bg-gray-50/20 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <CheckSquare size={14} className="text-accent-cyan" /> Select Job / Order
                     </label>
                     <select name="jobTitle" required className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold shadow-sm">
                       <option>Corporate Brochure - 5000 Qty</option>
                       <option>Luxury Wedding Cards - 200 Nos</option>
                       <option>Yearly Magazine 2024</option>
                       <option>Annual Report - 1000 Nos</option>
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest">Customer</label>
                     <div className="relative">
                       <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/30" size={18} />
                       <input 
                        name="customer" 
                        required 
                        list="delivery-customer-list"
                        placeholder="Type Customer Name" 
                        value={customerInfo.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = customersData.find(c => c.name === val);
                          setCustomerInfo({ name: val, address: found ? found.address : customerInfo.address });
                        }}
                        className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan shadow-sm font-bold text-sm" 
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} className="text-accent-magenta" /> Delivery Date
                     </label>
                     <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan shadow-sm font-bold text-sm" />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Bike size={14} className="text-accent-amber" /> Transport Mode
                     </label>
                     <select name="mode" className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan text-sm font-bold shadow-sm">
                       <option value="In-house Rider">In-house Rider</option>
                       <option value="Courier">Courier Service (External)</option>
                       <option value="Lorry">Truck / Lorry</option>
                       <option value="Self Pickup">Client Self-Pickup</option>
                     </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} className="text-danger" /> Complete Delivery Address
                   </label>
                   <textarea 
                     name="address" 
                     required 
                     placeholder="Floor, Building, Area, Pincode" 
                     value={customerInfo.address}
                     onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                     className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan h-28 shadow-sm text-sm font-medium" 
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Phone size={14} className="text-success" /> Assigned Logistics Handler
                     </label>
                     <input name="rider" required placeholder="Rider Name or Tracking ID" className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan shadow-sm font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Fingerprint size={14} className="text-primary" /> POD Authentication
                     </label>
                     <div className="flex gap-4">
                        <label className="flex-1 flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-accent-cyan transition-all">
                           <input type="radio" name="pod" defaultChecked className="accent-accent-cyan" />
                           <span className="text-xs font-bold text-primary italic">Digital Signature</span>
                        </label>
                        <label className="flex-1 flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-accent-cyan transition-all">
                           <input type="radio" name="pod" className="accent-accent-cyan" />
                           <span className="text-xs font-bold text-primary italic">SMS / OTP</span>
                        </label>
                     </div>
                   </div>
                </div>
              </form>

              <div className="p-8 border-t border-gray-100 bg-white flex justify-between items-center">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary hover:bg-gray-50 transition-all">
                    Discard Plan
                 </button>
                 <button form="dispatch-form" type="submit" className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all flex items-center gap-3">
                    Confirm Dispatch <Truck size={20} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
