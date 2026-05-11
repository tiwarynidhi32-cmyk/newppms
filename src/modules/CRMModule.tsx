import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, 
  MessageSquare, Calendar, Star, Clock, ArrowRight,
  MoreHorizontal, Tag, CheckCircle, X, Plus,
  MapPin, Send, History, Target, TrendingUp, Info
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Closed';
  lastFollowUp: string;
  score: number;
  isStarred?: boolean;
}

const mockLeads: Lead[] = [
  {
    id: 'LD-101',
    name: 'Anil Kapoor',
    company: 'Everest Agencies',
    phone: '+91 98765 43210',
    email: 'anil@everest.com',
    source: 'Website Form',
    status: 'Qualified',
    lastFollowUp: '2024-03-24',
    score: 85
  },
  {
    id: 'LD-102',
    name: 'Sonia Verma',
    company: 'Bright Horizon Edu',
    phone: '+91 91234 56789',
    email: 'sonia@brighthorizon.in',
    source: 'Reference',
    status: 'Proposal Sent',
    lastFollowUp: '2024-03-25',
    score: 92
  },
  {
    id: 'LD-103',
    name: 'Vikram Singh',
    company: 'Auto Master Parts',
    phone: '+91 99887 76655',
    email: 'vikram@automaster.com',
    source: 'Cold Call',
    status: 'New',
    lastFollowUp: '2024-03-22',
    score: 45
  }
];

export default function CRMModule() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('printing_pms_leads');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : mockLeads;
    } catch (e) {
      console.error('Error loading leads from storage:', e);
      return mockLeads;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('printing_pms_leads', JSON.stringify(leads));
    } catch (e) {
      console.error('Error saving leads to storage:', e);
    }
  }, [leads]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Leads' | 'Contacts'>('Leads');
  const [gstError, setGstError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [calendarEvents, setCalendarEvents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('printing_pms_calendar_events');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [
        { id: '1', date: 'Today', task: 'Follow up with Everest Agencies', time: '11:00 AM', status: 'High Priority' },
        { id: '2', date: 'Tomorrow', task: 'Proposal Review - Sonia Verma', time: '2:30 PM', status: 'In Pipeline' },
        { id: '3', date: '29 Mar', task: 'New Demo for Creative Solutions', time: '10:00 AM', status: 'New Inquiry' },
      ];
    } catch (e) {
      console.error('Error loading calendar from storage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('printing_pms_calendar_events', JSON.stringify(calendarEvents));
    } catch (e) {
      console.error('Error saving calendar to storage:', e);
    }
  }, [calendarEvents]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newEvent = {
      date: formData.get('date') as string,
      task: formData.get('task') as string,
      time: formData.get('time') as string,
      status: 'Custom Scheduled'
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    setIsBookingModalOpen(false);
    alert(`SUCCESS: Custom slot for "${newEvent.task}" has been scheduled for ${newEvent.date}.`);
  };

  const handleActivateAll = () => {
    setLeads(leads.map(l => ({ ...l, status: 'Qualified' })));
    alert('SUCCESS: All leads have been activated and moved to the "Qualified" status stage.');
  };

  const [contacts] = useState([
    { id: 'CON-001', name: 'Alok Gupta', type: 'Service Engineer', expertise: 'Komori Offline', phone: '+91 99999 11111', status: 'Active' },
    { id: 'CON-002', name: 'Ravi Verma', type: 'Service Engineer', expertise: 'Electrical/PLC', phone: '+91 88888 22222', status: 'Active' },
    { id: 'CON-003', name: 'Suresh Kumar', type: 'Past Staff', position: 'Old Press Manager', phone: '+91 77777 33333', status: 'Retired' },
  ]);

  const toggleStar = (id: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, isStarred: !l.isStarred } : l));
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Closed': return 'bg-success/10 text-success border-success/20';
      case 'Proposal Sent': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
      case 'Qualified': return 'bg-accent-magenta/10 text-accent-magenta border-accent-magenta/20';
      case 'Contacted': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      default: return 'bg-gray-100 text-secondary border-gray-200';
    }
  };

  const handleRegisterLead = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const gstNo = formData.get('gstNo') as string;
    const isIndividual = formData.get('isIndividual') === 'on';

    // Validate Phone (at least 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('ALERT: Phone number must have at least 10 digits.');
      return;
    }
    setPhoneError('');

    // Validate GST if not individual (15 alphanumeric)
    if (!isIndividual && gstNo) {
      if (gstNo.length !== 15) {
        setGstError('ALERT: GST Number must be exactly 15 characters (alphanumeric).');
        return;
      }
      setGstError('');
    }

    const name = (formData.get('name') as string) || 'Customer';
    const company = (formData.get('company') as string) || 'Unknown';

    const newLead: Lead = {
      id: `LD-${100 + leads.length + 1}`,
      name: name,
      company: company,
      phone: phone,
      email: name.split(' ')[0].toLowerCase() + '@' + company.toLowerCase().replace(/\s/g, '') + '.com',
      source: 'Direct Entry',
      status: 'New',
      lastFollowUp: new Date().toISOString().split('T')[0],
      score: 50
    };
    setLeads([newLead, ...leads]);
    setIsModalOpen(false);
    alert('Lead registered and added to active pipeline.');
  };

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const handleAction = (type: string, data: any) => {
    setSelectedLead(data);
    if (type === 'Message') {
      setIsMessageModalOpen(true);
    } else if (type === 'Task') {
      setIsTaskModalOpen(true);
    } else if (type === 'Call') {
      alert(`DIALING: Initializing secure line to ${data.name || data}...`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const message = formData.get('message');
    
    // Update last follow up if it's a lead
    if (selectedLead.id?.startsWith('LD')) {
      setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, lastFollowUp: new Date().toISOString().split('T')[0] } : l));
    }
    
    alert(`MESSAGE SENT: WhatsApp / Email dispatched to ${selectedLead.name}. Content: ${message}`);
    setIsMessageModalOpen(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const task = formData.get('task');
    
    const newEvent = {
        date: 'Scheduled',
        task: `${selectedLead.name}: ${task}`,
        time: 'TBD',
        status: 'In Priority'
    };
    
    setCalendarEvents([newEvent, ...calendarEvents]);
    alert(`SUCCESS: Task for ${selectedLead.name} added to calendar.`);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isMessageModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-primary uppercase italic">Send Message</h3>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">To: {selectedLead?.name} {selectedLead?.company ? `(${selectedLead?.company})` : ''}</p>
                 </div>
                 <button onClick={() => setIsMessageModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleSendMessage} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Communication Channel</label>
                    <div className="flex gap-2">
                       <button type="button" className="flex-1 py-3 bg-success/10 text-success border border-success/20 rounded-xl font-black text-[10px] uppercase">WhatsApp</button>
                       <button type="button" className="flex-1 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-black text-[10px] uppercase">Email</button>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Quick Templates</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs">
                       <option>Select a template...</option>
                       <option>Quotation Follow-up</option>
                       <option>Greeting / Introduction</option>
                       <option>Payment Reminder</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Message Content</label>
                    <textarea name="message" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold h-32" placeholder="Type your message here..." defaultValue={`Hi ${selectedLead?.name?.split?.(' ')?.[0] || 'there'}, this is regarding...`}></textarea>
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all"
                 >
                   Send Engagement
                 </button>
              </form>
            </motion.div>
          </div>
        )}

        {isTaskModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-xl font-black text-primary uppercase italic">Create Follow-up Task</h3>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">For: {selectedLead?.name || 'Unknown'}</p>
                 </div>
                 <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Task Description</label>
                    <input name="task" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Follow up for..." />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Priority</label>
                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs uppercase">
                            <option>Medium</option>
                            <option>High</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Due Date</label>
                        <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs" />
                    </div>
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-4 bg-accent-magenta text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent-magenta/20 hover:bg-primary transition-all"
                 >
                   Save Task & Sync Calendar
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-primary uppercase italic">Register New Customer / Lead</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
               </button>
            </div>
            <form onSubmit={handleRegisterLead} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Full Name</label>
                  <input name="name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Customer Name..." />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Company</label>
                  <input name="company" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Brand/Entity..." />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Phone Number (10 Digits)</label>
                  <input 
                    name="phone" 
                    required 
                    maxLength={10} 
                    onChange={() => setPhoneError('')}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold transition-all ${phoneError ? 'border-danger ring-4 ring-danger/10' : 'border-gray-100'}`} 
                    placeholder="9876543210" 
                  />
                  {phoneError && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-danger mt-2 italic flex items-center gap-1 bg-danger/5 p-2 rounded">
                      <Info size={12} /> {phoneError}
                    </motion.p>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                   <input type="checkbox" name="isIndividual" id="isIndividual" className="w-4 h-4 accent-primary" />
                   <label htmlFor="isIndividual" className="text-[10px] font-black uppercase text-secondary cursor-pointer">Individual Contact (GST Not Applicable)</label>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-secondary mb-1 block">GST Number (15 Digits)</label>
                   <input name="gstNo" maxLength={15} onChange={() => setGstError('')} className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold uppercase transition-all ${gstError ? 'border-danger ring-4 ring-danger/10' : 'border-gray-100'}`} placeholder="27XXXXX..." />
                   {gstError && (
                     <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-danger mt-2 bg-danger/10 p-3 rounded-xl border border-danger/20 flex items-center gap-2 italic">
                       <Info size={12} /> {gstError}
                     </motion.p>
                   )}
                </div>
               <button 
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all mt-4 flex items-center justify-center gap-2 group"
               >
                 <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> Confirm & Register Account
               </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">CRM & Professional Network</h2>
          <div className="flex gap-2">
             <button 
               onClick={() => setActiveTab('Leads')}
               className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Leads' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
             >
                Active Pipeline
             </button>
             <button 
               onClick={() => setActiveTab('Contacts')}
               className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Contacts' ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
             >
                Contact Book (Service/Staff)
             </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <Calendar size={18} className="text-accent-cyan group-hover:scale-110 transition-transform" /> Follow-up Calendar
          </button>
          <button 
            onClick={() => {
              setIsModalOpen(true);
              setGstError('');
            }}
            className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all font-sans"
          >
            <UserPlus size={20} /> Customer Register
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCalendarOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-2xl w-full border border-gray-100 font-sans">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-primary uppercase italic flex items-center gap-3"><Calendar className="text-accent-cyan" /> Engagements Calendar</h3>
                 <button onClick={() => setIsCalendarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                 {calendarEvents.map((event, i) => (
                   <div key={i} className="flex items-center gap-6 p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-accent-cyan transition-all group">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center text-primary border border-gray-100">
                         <span className="text-[10px] font-black uppercase tracking-tighter">{event.date}</span>
                         <Clock size={14} className="mt-1 opacity-40" />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-black text-primary uppercase">{event.task}</p>
                         <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{event.time} • {event.status}</p>
                      </div>
                      <button 
                        onClick={() => alert(`Starting engagement session for: ${event.task}`)}
                        className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-cyan transition-colors"
                      >
                        Start Engagement
                      </button>
                   </div>
                 ))}
                 <button 
                   onClick={() => setIsBookingModalOpen(true)}
                   className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-secondary text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all mt-4"
                 >
                   + Book Custom Slot
                 </button>
              </div>

              <AnimatePresence>
                {isBookingModalOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 m-10 bg-white shadow-2xl rounded-[40px] p-8 border border-gray-100 z-50 flex flex-col justify-center"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-black text-primary uppercase italic">Schedule Custom Slot</h4>
                      <X className="cursor-pointer" size={16} onClick={() => setIsBookingModalOpen(false)} />
                    </div>
                    <form onSubmit={handleBookSlot} className="grid grid-cols-2 gap-4">
                      <input name="task" required placeholder="Engagement Topic..." className="col-span-2 w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-xs font-bold" />
                      <input name="date" required placeholder="e.g. 30 Mar" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-xs font-bold" />
                      <input name="time" required placeholder="e.g. 4:00 PM" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-xs font-bold" />
                      <button type="submit" className="col-span-2 py-3 bg-accent-cyan text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-accent-cyan/20">Confirm Slot</button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total active leads', value: '154', icon: <Target className="text-accent-cyan" /> },
          { label: 'Won this month', value: '28', icon: <CheckCircle className="text-success" /> },
          { label: 'Conversion Rate', value: '18.4%', icon: <TrendingUp className="text-accent-magenta" /> },
          { label: 'Pipeline Value', value: '₹12.4L', icon: <Star className="text-accent-amber" /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <div className="p-3 bg-gray-50 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all mb-4">
                {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{stat.label}</p>
              <h4 className="text-2xl font-black text-primary mt-1">{stat.value}</h4>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
               {React.isValidElement(stat.icon) && React.cloneElement(stat.icon as React.ReactElement, { size: 100 } as any)}
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
              placeholder="Search by name, company, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent-cyan bg-white text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => alert('Opening advanced lead filters...')}
               className="px-5 py-2.5 bg-gray-50 text-secondary border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all">Filter</button>
             <button 
               onClick={handleActivateAll}
               className="px-5 py-2.5 bg-primary text-white border border-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-cyan transition-all shadow-lg shadow-primary/20">Activate All</button>
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                <th className="px-8 py-5">{activeTab === 'Leads' ? 'Lead Identification' : 'Professional Contact'}</th>
                <th className="px-8 py-5">Comm. Details</th>
                <th className="px-8 py-5">{activeTab === 'Leads' ? 'Lead Metrics' : 'Expertise / Position'}</th>
                <th className="px-8 py-5">{activeTab === 'Leads' ? 'Current Pipeline' : 'Network Status'}</th>
                <th className="px-8 py-5 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTab === 'Leads' ? (
                leads.filter(l => {
                  const search = (searchTerm || '').toLowerCase();
                  const name = (l?.name || '').toLowerCase();
                  const company = (l?.company || '').toLowerCase();
                  return name.includes(search) || company.includes(search);
                }).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-primary border border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                          {(lead?.name || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <span className="font-black text-sm text-primary tracking-tight">{lead?.name || 'Unnamed Lead'}</span>
                             <button onClick={() => toggleStar(lead.id)} className="transition-all transform active:scale-125">
                                <Star size={14} className={lead.isStarred ? 'text-accent-amber fill-accent-amber' : 'text-gray-200'} />
                             </button>
                          </div>
                          <p className="text-[10px] text-secondary mt-1 font-bold italic uppercase tracking-tighter opacity-60">{lead?.company || 'Unknown Company'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-80 cursor-pointer hover:text-accent-cyan">
                          <Phone size={12} className="text-success" /> {lead.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-80 cursor-pointer hover:text-accent-cyan">
                          <Mail size={12} className="text-secondary" /> {lead.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center w-32">
                           <span className="text-[10px] font-black uppercase text-secondary/40">Score</span>
                           <span className={`text-[10px] font-black ${lead.score > 80 ? 'text-success' : lead.score > 50 ? 'text-accent-amber' : 'text-danger'}`}>{lead.score}</span>
                        </div>
                        <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full ${lead.score > 80 ? 'bg-success' : lead.score > 50 ? 'bg-accent-amber' : 'bg-danger'}`} 
                             style={{ width: `${lead.score}%` }} 
                           />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit ${getStatusStyle(lead.status)}`}>
                           {lead.status}
                         </span>
                         <span className="text-[9px] text-secondary font-bold italic">Source: {lead.source}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleAction('Message', lead)}
                          className="p-3 bg-success/5 border border-success/10 rounded-2xl hover:bg-success hover:text-white transition-all shadow-sm group/btn" title="Message"
                        >
                          <MessageSquare size={20} className="text-success group-hover/btn:text-white transition-colors" />
                        </button>
                        <button 
                          onClick={() => handleAction('Task', lead)}
                          className="p-3 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm group/btn" title="Add Engagement"
                        >
                          <Plus size={20} className="text-primary group-hover/btn:text-white transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                contacts.filter(c => {
                  const search = (searchTerm || '').toLowerCase();
                  const name = (c?.name || '').toLowerCase();
                  const type = (c?.type || '').toLowerCase();
                  return name.includes(search) || type.includes(search);
                }).map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black border border-primary/10 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                          <Users size={18} />
                        </div>
                        <div>
                           <span className="font-black text-sm text-primary tracking-tight">{contact?.name || 'Unnamed Contact'}</span>
                           <p className="text-[10px] text-accent-magenta mt-0.5 font-bold uppercase tracking-tighter">{contact?.type || 'Contact'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-80 cursor-pointer hover:text-accent-cyan">
                          <Phone size={12} className="text-success" /> {contact.phone}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-bold text-secondary uppercase tracking-tight">{('expertise' in contact ? (contact as any).expertise : (contact as any).position)}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest w-fit shadow-sm ${contact.status === 'Active' ? 'bg-success/5 text-success border-success/10' : 'bg-gray-50 text-secondary border-gray-100'}`}>
                          {contact.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction('Call', contact)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-primary transition-all hover:text-accent-cyan active:scale-95"><Phone size={16} /></button>
                          <button onClick={() => handleAction('Message', contact)} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl text-primary transition-all hover:text-accent-cyan active:scale-95"><MessageSquare size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-primary p-12 rounded-[50px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
         <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-black font-sans uppercase tracking-tighter flex items-center gap-3">
               <Send size={32} className="text-accent-cyan" /> Automated Lead Nurturing
            </h3>
            <p className="max-w-lg text-white/60 font-medium italic">Our CRM bots automatically send follow-up reminders via WhatsApp & Email based on lead temperature. <span className="text-success font-black">12 touchpoints pending for today.</span></p>
            <div className="flex gap-4 pt-4">
               <button 
                onClick={() => alert('Executing automated follow-up queue for 12 leads...')}
                className="px-8 py-4 bg-accent-cyan text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-accent-cyan/20"
               >
                 Execute Queue
               </button>
               <button 
                onClick={() => alert('Opening bot configuration settings...')}
                className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
               >
                 Configure Bots
               </button>
            </div>
         </div>
         <Target size={300} className="absolute -right-20 -bottom-20 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </div>
    </div>
  );
}
