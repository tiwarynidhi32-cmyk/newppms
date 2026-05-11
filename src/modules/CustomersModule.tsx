import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, Mail, Phone, MapPin, MoreVertical, X, User, 
  Building, CreditCard, History, MessageSquare, ChevronRight, CheckCircle, 
  Clock, AlertTriangle, ShieldCheck, Globe, Briefcase, Calculator
} from 'lucide-react';

interface Contact {
  name: string;
  phone: string;
  email: string;
  designation: string;
}

interface Address {
  type: 'Billing' | 'Shipping';
  line1: string;
  city: string;
  state: string;
  zip: string;
}

interface Communication {
  id: string;
  date: string;
  type: 'Call' | 'Email' | 'Meeting' | 'WhatsApp';
  summary: string;
  by: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  gst: string;
  type: 'Corporate' | 'Walk-in' | 'Vendor' | 'Individual';
  phone: string;
  email: string;
  balance: number;
  creditLimit: number;
  paymentTerms: string;
  contacts: Contact[];
  addresses: Address[];
  history: Communication[];
  joinedDate: string;
}

const mockCustomers: Customer[] = [
  { 
    id: 'C-001', 
    name: 'Rajesh Malhotra', 
    company: 'Malhotra Publishing House', 
    gst: '27AABCM1234F1Z5', 
    phone: '+91 98765 43210', 
    email: 'contact@malhotrapub.com',
    balance: 15400, 
    type: 'Corporate',
    creditLimit: 100000,
    paymentTerms: 'NET 30',
    joinedDate: '2023-01-15',
    contacts: [
      { name: 'Rajesh Malhotra', phone: '+91 98765 43210', email: 'rajesh@malhotrapub.com', designation: 'CEO' },
      { name: 'Suman Gupta', phone: '+91 98765 43211', email: 'suman@malhotrapub.com', designation: 'Purchase Manager' }
    ],
    addresses: [
      { type: 'Billing', line1: '123, Nariman Point', city: 'Mumbai', state: 'Maharashtra', zip: '400021' },
      { type: 'Shipping', line1: '45, Industrial Estate', city: 'Bhiwandi', state: 'Maharashtra', zip: '421302' }
    ],
    history: [
      { id: '1', date: '2024-03-10', type: 'Call', summary: 'Inquired about textbook printing prices', by: 'Amit' },
      { id: '2', date: '2024-03-05', type: 'Email', summary: 'Sent catalog for 2024 titles', by: 'Admin' }
    ]
  },
  { 
    id: 'C-002', 
    name: 'Anjali Sharma', 
    company: 'Sharma Creative Solutions', 
    gst: '27AABCS5678G1Z2', 
    phone: '+91 99887 76655', 
    email: 'info@sharmacreative.in',
    balance: 0, 
    type: 'Corporate',
    creditLimit: 50000,
    paymentTerms: 'NET 15',
    joinedDate: '2023-05-10',
    contacts: [
      { name: 'Anjali Sharma', phone: '+91 99887 76655', email: 'anjali@sharmacreative.in', designation: 'Owner' }
    ],
    addresses: [
      { type: 'Billing', line1: 'Tower B, Cyber City', city: 'Pune', state: 'Maharashtra', zip: '411028' }
    ],
    history: []
  }
];

export default function CustomersModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('printing_pms_customers');
    return saved ? JSON.parse(saved) : mockCustomers;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_customers', JSON.stringify(customers));
  }, [customers]);

  const [businessType, setBusinessType] = useState('Corporate');
  const [gstError, setGstError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const type = formData.get('type') as any;
    const gst = formData.get('gst') as string;
    const phone = formData.get('phone') as string;

    // Validate GST for non-individuals
    if (type !== 'Individual') {
      if (gst.length !== 15) {
        setGstError('ALERT: GST Number must be exactly 15 characters (alphanumeric).');
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(gst)) {
        setGstError('ALERT: GST Number must be alphanumeric only.');
        return;
      }
      setGstError('');
    }

    // Validate Phone
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('ALERT: Phone number must have at least 10 digits.');
      return;
    }
    setPhoneError('');

    const newCustomer: Customer = {
      id: `C-00${customers.length + 1}`,
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      gst: type === 'Individual' ? 'N/A' : gst,
      phone: phone,
      email: formData.get('email') as string,
      balance: 0,
      type: type,
      creditLimit: Number(formData.get('creditLimit')) || 0,
      paymentTerms: formData.get('paymentTerms') as string || 'Due on Receipt',
      joinedDate: new Date().toISOString().split('T')[0],
      contacts: [{ name: formData.get('name') as string, phone: phone, email: formData.get('email') as string, designation: 'Primary' }],
      addresses: [],
      history: []
    };
    setCustomers([newCustomer, ...customers]);
    setIsModalOpen(false);
    setBusinessType('Corporate'); // Reset for next time
    alert('SUCCESS: Customer profile registered successfully.');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const contact: Contact = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      designation: formData.get('designation') as string,
    };
    setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, contacts: [...c.contacts, contact] } : c));
    setIsContactModalOpen(false);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const address: Address = {
      type: formData.get('type') as any,
      line1: formData.get('line1') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
    };
    setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, addresses: [...c.addresses, address] } : c));
    setIsAddressModalOpen(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newLog: Communication = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      type: formData.get('type') as any,
      summary: formData.get('summary') as string,
      by: 'Admin'
    };
    setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, history: [newLog, ...c.history] } : c));
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-secondary text-sm">Comprehensive B2B database with GST, Credit & History tracking.</p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setGstError('');
          }}
          className="bg-primary hover:bg-accent-cyan text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={20} /> Register New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main List */}
        <div className={`${selectedCustomerId ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all duration-300`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by company, GST, or contact..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-secondary transition-colors">
                  <Filter size={16} /> Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-secondary text-[10px] uppercase tracking-wider font-extrabold">
                    <th className="px-6 py-4">Business Entity</th>
                    <th className="px-6 py-4">Contact Detail</th>
                    <th className="px-6 py-4">GST / Tax ID</th>
                    <th className="px-6 py-4">Credit Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.gst.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`hover:bg-gray-50 transition-colors group cursor-pointer ${selectedCustomerId === customer.id ? 'bg-accent-cyan/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                            customer.type === 'Corporate' ? 'bg-primary' : 'bg-accent-magenta'
                          }`}>
                            {customer.company[0]}
                          </div>
                          <div>
                            <p className="font-bold text-primary group-hover:text-accent-cyan transition-colors">{customer.company}</p>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">{customer.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">{customer.name}</p>
                        <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                          <Phone size={12} className="opacity-50" /> {customer.phone}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-secondary">{customer.gst}</span>
                          <ShieldCheck size={14} className="text-success" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-bold text-sm ${customer.balance > customer.creditLimit ? 'text-danger' : 'text-primary'}`}>
                          ₹{customer.balance.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-secondary">Limit: ₹{customer.creditLimit.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(customer.id);
                          }}
                          className="p-2 hover:bg-white rounded-full text-secondary transition-colors shadow-sm bg-gray-50"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Sidebar */}
        <AnimatePresence>
          {selectedCustomerId && selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="xl:col-span-4"
            >
              <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden sticky top-6">
                <div className="p-8 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
                  <button 
                    onClick={() => setSelectedCustomerId(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                      {selectedCustomer.company[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedCustomer.company}</h3>
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        <Clock size={12} /> Since {selectedCustomer.joinedDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar p-6 space-y-8">
                  {/* Financial Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Exposure</p>
                      <p className={`text-lg font-black ${selectedCustomer.balance > 0 ? 'text-danger' : 'text-success'}`}>
                        ₹{selectedCustomer.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Credit Limit</p>
                      <p className="text-lg font-black text-primary">₹{selectedCustomer.creditLimit.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Multiple Contacts */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                       <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex flex-wrap items-center gap-2">
                         <User size={14} className="text-accent-cyan" /> Organization Contacts
                       </h4>
                       <button 
                         onClick={() => setIsContactModalOpen(true)}
                         className="flex items-center gap-1 px-2 py-1 bg-accent-cyan/10 text-accent-cyan rounded-md text-[9px] font-black uppercase hover:bg-accent-cyan hover:text-white transition-all shadow-sm shrink-0"
                       >
                         <Plus size={10} /> Add Contact
                       </button>
                    </div>
                    <div className="space-y-3">
                      {selectedCustomer.contacts.map((contact, idx) => (
                        <div key={idx} className="p-3 border border-gray-100 rounded-xl hover:border-accent-cyan/30 transition-all bg-gray-50/30 group">
                           <div className="flex justify-between items-start">
                              <p className="font-bold text-sm text-primary">{contact.name}</p>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded">{contact.designation}</span>
                           </div>
                           <div className="mt-2 space-y-1">
                              <p className="text-xs text-secondary flex items-center gap-2">
                                <button className="hover:text-accent-cyan transition-colors flex items-center gap-2" onClick={() => alert(`Dialing ${contact.phone}...`)}>
                                  <Phone size={10} /> {contact.phone}
                                </button>
                              </p>
                              <p className="text-xs text-secondary flex items-center gap-2">
                                <button className="hover:text-accent-cyan transition-colors flex items-center gap-2" onClick={() => alert(`Mailing ${contact.email}...`)}>
                                  <Mail size={10} /> {contact.email}
                                </button>
                              </p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multiple Addresses */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                       <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex flex-wrap items-center gap-2">
                         <MapPin size={14} className="text-accent-magenta" /> Registered Locations
                       </h4>
                       <button 
                         onClick={() => setIsAddressModalOpen(true)}
                         className="flex items-center gap-1 px-2 py-1 bg-accent-magenta/10 text-accent-magenta rounded-md text-[9px] font-black uppercase hover:bg-accent-magenta hover:text-white transition-all shadow-sm shrink-0"
                       >
                         <Plus size={10} /> Add Address
                       </button>
                    </div>
                    <div className="space-y-3">
                      {selectedCustomer.addresses.map((addr, idx) => (
                        <div key={idx} className="flex gap-3 text-xs group cursor-pointer" onClick={() => alert(`Show ${addr.type} address on map: ${addr.line1}...`)}>
                          <div className={`p-2 rounded-lg h-fit group-hover:scale-110 transition-transform ${addr.type === 'Billing' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-success/10 text-success'}`}>
                             {addr.type === 'Billing' ? <CreditCard size={14} /> : <MapPin size={14} />}
                          </div>
                          <div>
                            <p className="font-bold text-primary group-hover:text-accent-magenta transition-colors">{addr.type} Address</p>
                            <p className="text-secondary leading-relaxed">{addr.line1}, {addr.city}, {addr.state} - {addr.zip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Communication History */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                         <History size={14} className="text-accent-amber" /> Engagement Log
                       </h4>
                       <button 
                         onClick={() => setIsLogModalOpen(true)}
                         className="flex items-center gap-1 px-3 py-1 bg-accent-amber/10 text-accent-amber rounded-full text-[10px] font-black uppercase hover:bg-accent-amber hover:text-white transition-all"
                       >
                         <Plus size={12} /> Log Entry
                       </button>
                    </div>
                    <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                      {selectedCustomer.history.length > 0 ? selectedCustomer.history.map((log) => (
                        <div key={log.id} className="relative pl-8">
                           <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center shadow-sm z-10">
                              {log.type === 'Call' ? <Phone size={10} className="text-blue-500" /> : <Mail size={10} className="text-accent-magenta" />}
                           </div>
                           <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 italic">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black text-secondary">{log.date}</span>
                               <span className="text-[9px] font-bold text-primary opacity-60">By: {log.by}</span>
                             </div>
                             <p className="text-xs text-primary">{log.summary}</p>
                           </div>
                        </div>
                      )) : (
                        <p className="text-xs text-secondary text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No recent communication history found.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => alert('Feature coming soon: Integrated Chat interface.')}
                      className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 group text-primary"
                    >
                       <MessageSquare size={16} className="text-accent-cyan group-hover:scale-110 transition-transform" /> Start Chat
                    </button>
                    <button 
                      onClick={() => alert(`Navigating to Quotation module for ${selectedCustomer.company}...`)}
                      className="flex-[1.5] px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 group"
                    >
                       <Calculator size={16} className="group-hover:rotate-12 transition-transform" /> Generate Quote
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Customer Modal */}
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <div>
                   <h3 className="text-xl font-bold">New Customer Registration</h3>
                   <p className="text-white/60 text-xs mt-1">Complete profile to enable quotes and invoicing.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* section: Business Identity */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-secondary tracking-[0.2em] border-b border-gray-100 pb-2">Business Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} className="text-accent-cyan" /> Company Name
                      </label>
                      <input name="company" required placeholder="e.g., Creative Printers Pvt Ltd" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={14} className={businessType === 'Individual' ? 'text-gray-300' : 'text-success'} /> GST Number
                      </label>
                      <input 
                        name="gst" 
                        required={businessType !== 'Individual'} 
                        disabled={businessType === 'Individual'}
                        onChange={() => setGstError('')}
                        placeholder={businessType === 'Individual' ? "Not Applicable" : "27XXXXX0000X1Z5"} 
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all ${businessType === 'Individual' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50'} ${gstError ? 'border-danger ring-2 ring-danger/10' : 'border-gray-100'}`} 
                      />
                      {gstError && (
                        <p className="text-[10px] font-black text-danger mt-1 italic flex items-center gap-1 bg-danger/5 p-2 rounded">
                          <AlertTriangle size={10} /> {gstError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider">Business Type</label>
                      <select 
                        name="type" 
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan"
                      >
                        <option value="Corporate">Corporate</option>
                        <option value="Individual">Individual</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Vendor">Vendor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* section: Primary Contact */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[10px] font-black uppercase text-secondary tracking-[0.2em] border-b border-gray-100 pb-2">Primary Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <User size={14} className="text-accent-magenta" /> Name
                      </label>
                      <input name="name" required placeholder="Full Name" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Phone size={14} className="text-accent-amber" /> Phone
                      </label>
                      <input 
                        name="phone" 
                        required 
                        placeholder="9876543210" 
                        onChange={() => setPhoneError('')}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all ${phoneError ? 'border-danger ring-2 ring-danger/10' : 'border-gray-100'}`} 
                      />
                      {phoneError && (
                        <p className="text-[10px] font-black text-danger mt-1 italic flex items-center gap-1 bg-danger/5 p-2 rounded">
                          <AlertTriangle size={10} /> {phoneError}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 space-y-2">
                       <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Mail size={14} className="text-indigo-500" /> Professional Email
                      </label>
                      <input name="email" required type="email" placeholder="example@business.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                  </div>
                </div>

                {/* section: Credit & Payment Terms */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[10px] font-black uppercase text-secondary tracking-[0.2em] border-b border-gray-100 pb-2">Financial Provisions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle size={14} className="text-danger" /> Credit Limit (₹)
                      </label>
                      <input name="creditLimit" type="number" defaultValue="50000" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider">Payment Terms</label>
                      <select name="paymentTerms" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan">
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="NET 7">NET 7 Days</option>
                        <option value="NET 15">NET 15 Days</option>
                        <option value="NET 30">NET 30 Days</option>
                        <option value="50% Advance">50% Advance</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-secondary hover:bg-gray-50 transition-all font-sans uppercase tracking-widest text-[10px]">
                    Cancel
                  </button>
                  <button type="submit" className="flex-[2] px-4 py-4 bg-primary text-white rounded-xl font-black hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all font-sans uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group">
                    <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> Register Customer Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Additional Modals */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-black uppercase text-primary mb-4">Add New Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <input name="name" required placeholder="Person Name" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <input name="designation" placeholder="Designation" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <input name="phone" placeholder="Phone Number" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <input name="email" type="email" placeholder="Email Address" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsContactModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg font-bold">Save Contact</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-black uppercase text-primary mb-4">Add Registered Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <select name="type" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none">
                  <option value="Billing">Billing Address</option>
                  <option value="Shipping">Shipping Address</option>
                </select>
                <input name="line1" required placeholder="Address Line 1" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input name="city" placeholder="City" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                  <input name="state" placeholder="State" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                </div>
                <input name="zip" placeholder="Zip Code" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg font-bold">Save Address</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isLogModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-black uppercase text-primary mb-4">Log Engagement</h3>
              <form onSubmit={handleAddLog} className="space-y-4">
                <select name="type" className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none">
                  <option value="Call">Phone Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <textarea name="summary" required placeholder="Interaction summary..." className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none h-32" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg font-bold">Record Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
