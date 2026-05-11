import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, Mail, MoreHorizontal, UserPlus } from 'lucide-react';
import { Lead } from '../types';

export default function LeadModule() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('printing_pms_leads');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        customerName: 'Rohit Sharma',
        companyName: 'MI Publications',
        phone: '9876543210',
        email: 'rohit@mi.com',
        interest: 'Catalogues',
        source: 'Google Search',
        status: 'New',
        createdAt: '2024-05-01'
      },
      {
        id: '2',
        customerName: 'Sarah Jenkins',
        companyName: 'Educational World',
        phone: '9822110033',
        email: 'sarah@eduworld.in',
        interest: 'School Books',
        source: 'Referral',
        status: 'Contacted',
        createdAt: '2024-04-28'
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  React.useEffect(() => {
    localStorage.setItem('printing_pms_leads', JSON.stringify(leads));
  }, [leads]);

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const leadData: Lead = {
      id: editingLead?.id || Math.random().toString(36).substr(2, 9),
      customerName: formData.get('customerName') as string,
      companyName: formData.get('companyName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      interest: formData.get('interest') as string,
      source: formData.get('source') as string,
      status: formData.get('status') as any || 'New',
      createdAt: editingLead?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? leadData : l));
    } else {
      setLeads([leadData, ...leads]);
    }
    setIsModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-primary">Lead Pipeline</h2>
          <p className="text-secondary text-sm font-medium">Capture prospects and convert them to customers.</p>
        </div>
        <button 
          onClick={() => {
            setEditingLead(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-accent-cyan transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <UserPlus size={18} /> Add New Lead
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase text-secondary tracking-widest border-b border-gray-50">
              <th className="px-4 py-4 text-left">Prospect Details</th>
              <th className="px-4 py-4 text-left">Interests</th>
              <th className="px-4 py-4 text-left">Source</th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="italic">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0 group">
                <td className="px-4 py-5">
                  <div className="font-black text-primary text-sm">{lead.customerName}</div>
                  <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">{lead.companyName}</div>
                  <div className="flex gap-3 mt-1">
                    <Phone size={10} className="text-accent-cyan" />
                    <span className="text-[10px] text-secondary font-bold">{lead.phone}</span>
                    <Mail size={10} className="text-accent-magenta" />
                  </div>
                </td>
                <td className="px-4 py-5 font-bold text-xs text-primary">{lead.interest}</td>
                <td className="px-4 py-5 font-bold text-[10px] text-secondary uppercase bg-gray-100 rounded-full inline-block mt-5 px-3 py-1">{lead.source}</td>
                <td className="px-4 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                     lead.status === 'New' ? 'bg-accent-cyan/10 text-accent-cyan' : 
                     lead.status === 'Won' ? 'bg-success/10 text-success' :
                     'bg-accent-magenta/10 text-accent-magenta'
                   }`}>
                     {lead.status}
                   </span>
                </td>
                <td className="px-4 py-5 text-right">
                  <button 
                    onClick={() => {
                      setEditingLead(lead);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-all"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase text-primary">
                {editingLead ? 'Modify Prospect' : 'Capture New Lead'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSaveLead} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Contact Person</label>
                  <input name="customerName" required defaultValue={editingLead?.customerName} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:border-accent-cyan" placeholder="Full Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Company Name</label>
                  <input name="companyName" required defaultValue={editingLead?.companyName} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:border-accent-cyan" placeholder="Organization" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Phone Number</label>
                  <input name="phone" required defaultValue={editingLead?.phone} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:border-accent-cyan" placeholder="+91 ..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Email Address</label>
                  <input name="email" type="email" required defaultValue={editingLead?.email} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:border-accent-cyan" placeholder="email@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Service Interest</label>
                  <input name="interest" defaultValue={editingLead?.interest} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:border-accent-cyan" placeholder="e.g. Catalogues, Books" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Source</label>
                  <select name="source" defaultValue={editingLead?.source} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none">
                    <option>Google Search</option>
                    <option>Referral</option>
                    <option>Social Media</option>
                    <option>Exhibition</option>
                    <option>Cold Call</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary">Current Status</label>
                  <select name="status" defaultValue={editingLead?.status} className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent-cyan transition-all shadow-lg shadow-primary/20">
                {editingLead ? 'Update Prospect Record' : 'Register New Lead'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
