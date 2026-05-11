import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Search, Phone, Mail, MapPin, 
  Clock, CheckCircle2, AlertCircle, X, 
  Briefcase, DollarSign, ExternalLink, FileText, ClipboardList, Send, Printer
} from 'lucide-react';

import { Contractor as GlobalContractor } from '../types';

interface Contractor extends GlobalContractor {
  specialty: string;
  location: string;
  rating: number;
  status: 'Active' | 'On Break' | 'Blacklisted';
  currentJobs: number;
  totalPayout: string;
}

interface Challan {
  id: string;
  contractorId: string;
  contractorName: string;
  jcRef: string;
  material: string;
  quantity: number;
  date: string;
  status: 'Outward' | 'Received Back';
}

const mockContractors: Contractor[] = [
  { id: 'CON-001', name: 'Vikas Binding Solutions', specialty: 'Perfect Binding', phone: '+91 98221 00442', email: 'vikas@binding.com', location: 'Industrial Area Phase 2', rating: 4.8, status: 'Active', currentJobs: 3, totalPayout: '₹4.2L', type: 'Jobwork', panNo: 'ABCDE1234F', tdsApplicable: true, tdsPercentage: 2 },
  { id: 'CON-002', name: 'Global Plate-Makers', specialty: 'CTP Plates', phone: '+91 98772 11003', email: 'plates@global.com', location: 'Okhla Ind. Area', rating: 4.5, status: 'Active', currentJobs: 1, totalPayout: '₹1.8L', type: 'Service', panNo: 'FGHIJ5678K', tdsApplicable: false, tdsPercentage: 0 },
  { id: 'CON-003', name: 'Fine Prints Ltd', specialty: 'Lamination & UV', phone: '+91 99110 55432', email: 'service@fineprints.in', location: 'Naraina Complex', rating: 4.2, status: 'On Break', currentJobs: 0, totalPayout: '₹85K', type: 'Jobwork', panNo: 'LMNOP9012Q', tdsApplicable: true, tdsPercentage: 1 },
];

const mockChallans: Challan[] = [
  { id: 'CH-24-001', contractorId: 'CON-001', contractorName: 'Vikas Binding Solutions', jcRef: 'SOP/JC/013', material: 'Printed Sheets (400 GSM)', quantity: 5000, date: '2024-03-28', status: 'Outward' },
  { id: 'CH-24-002', contractorId: 'CON-002', contractorName: 'Global Plate-Makers', jcRef: 'SOP/JC/015', material: 'Raw Aluminum Plates', quantity: 15, date: '2024-03-27', status: 'Outward' },
];

export default function ContractorsModule() {
  const [contractors, setContractors] = useState<Contractor[]>(() => {
    const saved = localStorage.getItem('printing_pms_contractors');
    return saved ? JSON.parse(saved) : mockContractors;
  });

  const [challans, setChallans] = useState<Challan[]>(() => {
    const saved = localStorage.getItem('printing_pms_challans');
    return saved ? JSON.parse(saved) : mockChallans;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_contractors', JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem('printing_pms_challans', JSON.stringify(challans));
  }, [challans]);

  const [activeTab, setActiveTab] = useState<'Vendors' | 'Challans'>('Vendors');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [targetVendorId, setTargetVendorId] = useState<string>('');
  const [validationError, setValidationError] = useState('');

  const handleAddContractor = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const phone = formData.get('contact') as string;
    
    // Validate Phone (at least 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setValidationError('ALERT: Contact number must have at least 10 digits.');
      return;
    }
    setValidationError('');

    if (editingContractor) {
      setContractors(contractors.map(c => c.id === editingContractor.id ? {
        ...c,
        name: formData.get('name') as string,
        specialty: formData.get('specialty') as string,
        phone: phone,
        location: formData.get('location') as string,
        type: formData.get('type') as any || 'Jobwork',
        panNo: formData.get('panNo') as string || '',
        tdsApplicable: formData.get('tdsApplicable') === 'on',
        tdsPercentage: Number(formData.get('tdsPercentage')) || 0,
      } : c));
      setEditingContractor(null);
    } else {
      const newCon: Contractor = {
        id: `CON-00${contractors.length + 1}`,
        name: formData.get('name') as string,
        specialty: formData.get('specialty') as string,
        phone: phone,
        email: formData.get('email') as string,
        location: formData.get('location') as string,
        rating: 5.0,
        status: 'Active',
        currentJobs: 0,
        totalPayout: '₹0',
        type: formData.get('type') as any || 'Jobwork',
        panNo: formData.get('panNo') as string || '',
        tdsApplicable: formData.get('tdsApplicable') === 'on',
        tdsPercentage: Number(formData.get('tdsPercentage')) || 0,
      };
      setContractors([newCon, ...contractors]);
    }
    setIsModalOpen(false);
  };

  const handleCreateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const vendorId = formData.get('vendorId') as string;
    const vendor = contractors.find(c => c.id === vendorId);
    
    const newChallan: Challan = {
      id: `CH-24-0${challans.length + 1}`,
      contractorId: vendorId,
      contractorName: vendor?.name || 'Unknown',
      jcRef: formData.get('jcRef') as string,
      material: formData.get('material') as string,
      quantity: Number(formData.get('quantity')),
      date: new Date().toISOString().split('T')[0],
      status: 'Outward',
    };
    
    setChallans([newChallan, ...challans]);
    setIsChallanModalOpen(false);
    alert('SUCCESS: Outward Challan generated and logged for the vendor.');
    window.print();
  };

  const filtered = contractors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-xl w-full border border-gray-100 font-sans">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-primary uppercase italic">{editingContractor ? 'Edit' : 'Register'} Contractor</h3>
                <button onClick={() => { setIsModalOpen(false); setEditingContractor(null); setValidationError(''); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddContractor} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Entity Name</label>
                  <input name="name" required defaultValue={editingContractor?.name} placeholder="Organization Name" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Specialty</label>
                    <input name="specialty" required defaultValue={editingContractor?.specialty} placeholder="e.g. Binding" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Contact Number</label>
                    <input 
                      name="contact" 
                      required 
                      defaultValue={editingContractor?.contact} 
                      placeholder="+91..." 
                      className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none font-bold transition-all ${validationError ? 'border-danger ring-4 ring-danger/10' : 'border-gray-100'}`} 
                      onChange={() => setValidationError('')}
                    />
                  </div>
                </div>
                {validationError && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-danger italic flex items-center gap-2 bg-danger/5 p-3 rounded-xl border border-danger/20">
                    <AlertCircle size={12} /> {validationError}
                  </motion.p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">PAN Number</label>
                    <input name="panNo" defaultValue={editingContractor?.panNo} placeholder="ABCDE1234F" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold uppercase" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">TDS (%)</label>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                       <input type="checkbox" name="tdsApplicable" defaultChecked={editingContractor?.tdsApplicable} className="w-4 h-4 accent-primary" />
                       <input name="tdsPercentage" type="number" defaultValue={editingContractor?.tdsPercentage} placeholder="%" className="w-full bg-transparent outline-none font-bold" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Physical Address</label>
                  <input name="location" required defaultValue={editingContractor?.location} placeholder="Workshop Location" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-accent-cyan transition-all">
                  {editingContractor ? 'Update Records' : 'Onboard Vendor'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isChallanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChallanModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-xl w-full border border-gray-100 font-sans">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-primary uppercase italic">Outward Challan</h3>
                <button onClick={() => setIsChallanModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateChallan} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Select Vendor</label>
                  <select 
                    name="vendorId" 
                    defaultValue={targetVendorId}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                  >
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Job Card Ref</label>
                    <input name="jcRef" required placeholder="SOP/JC/..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Quantity</label>
                    <input name="quantity" type="number" required placeholder="0" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Material Description</label>
                  <input name="material" required placeholder="e.g. Printed Inner Sheets" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <button type="submit" className="w-full py-5 bg-accent-cyan text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3">
                  <Send size={16} /> Generate & Print
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary italic">Contractor Ecosystem</h2>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('Vendors')}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${activeTab === 'Vendors' ? 'bg-primary text-white border-primary' : 'text-secondary border-gray-100 hover:bg-gray-50'}`}
            >
              Vendor Directory
            </button>
            <button 
              onClick={() => setActiveTab('Challans')}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${activeTab === 'Challans' ? 'bg-primary text-white border-primary' : 'text-secondary border-gray-100 hover:bg-gray-50'}`}
            >
              Challan Repository
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'Vendors' ? 'vendors' : 'challans'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-xs" 
            />
          </div>
          {activeTab === 'Vendors' ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl"
            >
              <Plus size={18} /> New Partner
            </button>
          ) : (
            <button 
              onClick={() => setIsChallanModalOpen(true)}
              className="bg-accent-cyan hover:bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl"
            >
              <FileText size={18} /> Outward Challan
            </button>
          )}
        </div>
      </div>

      {activeTab === 'Vendors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(con => (
            <motion.div layout key={con.id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-accent-cyan group-hover:text-white transition-all">
                     <Briefcase size={28} />
                  </div>
                  <div className="text-right">
                     <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${con.status === 'Active' ? 'text-success border-success/20 bg-success/10' : 'text-secondary border-gray-200 bg-gray-50'}`}>
                        {con.status}
                     </span>
                     <p className="text-xs font-black text-primary mt-2">{con.totalPayout}</p>
                     <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Total Earned</p>
                  </div>
               </div>
               
               <div className="mb-6">
                  <h4 className="text-lg font-black text-primary uppercase italic">{con.name}</h4>
                  <p className="text-xs text-accent-cyan font-bold uppercase tracking-widest">{con.specialty}</p>
               </div>
  
               <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-secondary text-xs font-medium">
                     <Phone size={14} className="text-gray-300" /> {con.phone}
                  </div>
                  <div className="flex items-center gap-3 text-secondary text-xs font-medium">
                     <MapPin size={14} className="text-gray-300" /> {con.location}
                  </div>
                  <div className="flex items-center gap-3 text-secondary text-xs font-medium">
                     <FileText size={14} className="text-gray-300" /> 
                     <span className="uppercase">{con.panNo || 'PAN Pending'}</span>
                     {con.tdsApplicable && <span className="text-[10px] font-black text-danger ml-auto">TDS: {con.tdsPercentage}%</span>}
                  </div>
                  <div className="flex items-center gap-3 text-secondary text-xs font-medium">
                     <Clock size={14} className="text-gray-300" /> {con.currentJobs} Active Jobs
                  </div>
               </div>
  
               <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setTargetVendorId(con.id);
                      setIsChallanModalOpen(true);
                    }}
                    className="flex-1 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all border border-primary/10"
                  >
                    Assign Job
                  </button>
                  <button 
                    onClick={() => {
                      setEditingContractor(con);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-3 bg-gray-50 rounded-xl text-secondary hover:bg-gray-100 transition-all font-sans border border-gray-100 group-hover:border-accent-cyan transition-colors"
                    title="Edit Partner Info"
                  >
                    <ExternalLink size={16} />
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-secondary border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">Challan Ref / Date</th>
                <th className="px-8 py-5">Contractor</th>
                <th className="px-8 py-5">Job Card</th>
                <th className="px-8 py-5">Material Details</th>
                <th className="px-8 py-5 text-right">Status / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {challans.filter(c => 
                c.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.jcRef.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(ch => (
                <tr key={ch.id} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary italic uppercase">{ch.id}</span>
                      <span className="text-[10px] font-bold text-secondary">{ch.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-primary uppercase">{ch.contractorName}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase">{ch.jcRef}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-secondary uppercase">{ch.material}</span>
                      <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">{ch.quantity} Units Issued</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => {
                          setChallans(challans.map(c => c.id === ch.id ? { ...c, status: c.status === 'Outward' ? 'Received Back' : 'Outward' } : c));
                          alert(`Status for ${ch.id} toggled to ${ch.status === 'Outward' ? 'Received Back' : 'Outward'}.`);
                        }}
                        className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${ch.status === 'Received Back' ? 'bg-success/10 text-success border-success/20' : 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'}`}
                       >
                         {ch.status}
                       </button>
                       <button onClick={() => window.print()} className="p-3 bg-gray-50 rounded-xl hover:bg-primary hover:text-white transition-all"><Printer size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
