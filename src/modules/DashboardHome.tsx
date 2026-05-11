import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, FileText, CheckCircle, Clock, 
  AlertTriangle, ArrowRight, Activity, Zap, Layers,
  ChevronRight, Calendar, UserPlus, ShoppingCart, 
  DollarSign, Package, MoreHorizontal, MousePointerClick, Wrench, Settings, Phone, ShieldCheck, X, Calculator
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const data = [
  { name: 'Mon', jobs: 12, sales: 4000 },
  { name: 'Tue', jobs: 19, sales: 3000 },
  { name: 'Wed', jobs: 15, sales: 5000 },
  { name: 'Thu', jobs: 22, sales: 4500 },
  { name: 'Fri', jobs: 30, sales: 6000 },
  { name: 'Sat', jobs: 18, sales: 3500 },
  { name: 'Sun', jobs: 8, sales: 2000 },
];

const categoryData = [
  { name: 'Offset', value: 400, color: '#1E3A5F' },
  { name: 'Digital', value: 300, color: '#06B6D4' },
  { name: 'Special', value: 300, color: '#D946EF' },
];

export default function DashboardHome() {
  const navigate = useNavigate();

  const [showLedger, setShowLedger] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<{name: string, client: string} | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState([
    { id: 'V-101', date: '2024-03-01', description: 'Initial Advances', type: 'Credit', amount: 50000 },
    { id: 'V-102', date: '2024-03-10', description: 'Binding Charges - Batch A', type: 'Debit', amount: 15200 },
    { id: 'V-103', date: '2024-03-15', description: 'Partial Payment', type: 'Credit', amount: 10000 },
  ]);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newEntry = {
      id: `V-${104 + ledgerEntries.length}`,
      date: new Date().toISOString().split('T')[0],
      description: formData.get('description') as string,
      type: formData.get('type') as 'Credit' | 'Debit',
      amount: Number(formData.get('amount')),
    };
    setLedgerEntries([newEntry, ...ledgerEntries]);
    (e.currentTarget as HTMLFormElement).reset();
  };

  const balance = ledgerEntries.reduce((sum, entry) => entry.type === 'Credit' ? sum + entry.amount : sum - entry.amount, 0);

  const quickActions = [
    { label: 'Lead Registry', icon: UserPlus, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', path: '/leads' },
    { label: 'Automated Quote', icon: Calculator, color: 'text-accent-magenta', bg: 'bg-accent-magenta/10', path: '/estimates' },
    { label: 'Unified Jobs', icon: FileText, color: 'text-accent-amber', bg: 'bg-accent-amber/10', path: '/job-details' },
    { label: 'Pricing Admin', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', path: '/pricing-admin' },
    { label: 'Financials', icon: DollarSign, color: 'text-success', bg: 'bg-success/10', path: '/accounting' },
    { label: 'All Reports', icon: Activity, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', path: '/reports' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50 mr-2">Quick Actions:</h3>
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-2 pr-4 pl-1.5 py-1.5 ${action.bg} ${action.color} rounded-full border border-transparent hover:border-current transition-all group`}
          >
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              <action.icon size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Contractor Ledger Modal */}
      {showLedger && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setShowLedger(false)} />
           <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-primary uppercase italic tracking-tighter">Contractor Ledger</h2>
                    <p className="text-secondary text-xs font-bold uppercase opacity-60">Settlements & Vouchers: {selectedContractor?.name}</p>
                 </div>
                 <button onClick={() => setShowLedger(false)} className="p-4 hover:bg-gray-100 rounded-2xl transition-all"><X size={20} /></button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Transaction Form */}
                 <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-primary rounded-3xl text-white shadow-xl">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-1">Current Balance</p>
                       <h3 className="text-3xl font-black italic">₹{balance.toLocaleString()}</h3>
                       <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                          <ShieldCheck size={14} className="text-success" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Verified Account</span>
                       </div>
                    </div>

                    <form onSubmit={handleCreateVoucher} className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Create New Voucher</h4>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-secondary">Description</label>
                          <input name="description" required placeholder="e.g. Pasting Charges" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase text-secondary">Amount</label>
                             <input name="amount" type="number" required placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold uppercase text-secondary">Type</label>
                             <select name="type" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold">
                                <option value="Debit">Debit (Bill)</option>
                                <option value="Credit">Credit (Pay)</option>
                             </select>
                          </div>
                       </div>
                       <button type="submit" className="w-full py-4 bg-accent-magenta text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all">Add to Ledger</button>
                    </form>
                 </div>

                 {/* Transaction Table */}
                 <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Recent Settlements</h4>
                    <div className="border border-gray-100 rounded-3xl overflow-hidden">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50 text-[10px] uppercase font-black text-secondary">
                                <th className="p-4">ID</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Type</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-sm">
                             {ledgerEntries.map(entry => (
                               <tr key={entry.id} className="hover:bg-gray-50/50">
                                  <td className="p-4 font-mono font-bold text-xs text-secondary">{entry.id}</td>
                                  <td className="p-4">
                                     <p className="font-bold text-primary">{entry.description}</p>
                                     <p className="text-[10px] text-secondary/60">{entry.date}</p>
                                  </td>
                                  <td className="p-4 font-black">₹{entry.amount.toLocaleString()}</td>
                                  <td className="p-4">
                                     <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${entry.type === 'Credit' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        {entry.type}
                                     </span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
      {/* Service & Projects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Machine Service Reminders */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-xl font-black text-primary uppercase tracking-tighter italic">Machine Service Reminders</h3>
                 <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-40">Preventive maintenance schedule</p>
              </div>
              <div className="p-3 bg-danger/10 text-danger rounded-2xl">
                 <Wrench size={20} />
              </div>
           </div>
           <div className="space-y-4 relative z-10">
              {[
                { name: 'Komori Lithrone G40', last: '2024-01-15', due: '2024-04-15', health: 85, urgent: true },
                { name: 'Heidelberg Speedmaster', last: '2024-03-01', due: '2024-06-01', health: 98, urgent: false },
                { name: 'Polar Paper Cutter', last: '2023-12-10', due: '2024-03-10', health: 45, urgent: true },
              ].map((machine, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/machines')}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:translate-x-1 cursor-pointer ${machine.urgent ? 'bg-danger/5 border-danger/20' : 'bg-gray-50 border-gray-100'}`}
                >
                   <div>
                      <p className="text-sm font-black text-primary">{machine.name}</p>
                      <p className="text-[10px] text-secondary font-bold uppercase">Due: {machine.due} {machine.urgent && <span className="text-danger ml-2 animate-pulse">● OVERDUE</span>}</p>
                   </div>
                   <div className="text-right">
                      <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full ${machine.health > 80 ? 'bg-success' : machine.health > 50 ? 'bg-accent-amber' : 'bg-danger'}`} style={{ width: `${machine.health}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-secondary uppercase opacity-40">Health index: {machine.health}%</span>
                   </div>
                </div>
              ))}
           </div>
           <Settings size={280} className="absolute -left-20 -bottom-20 text-gray-50 opacity-20 pointer-events-none group-hover:rotate-45 transition-transform duration-1000" />
        </div>

        {/* Project Management & Contractor Status */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-xl font-black text-primary uppercase tracking-tighter italic">Active Projects & Contractors</h3>
                 <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-40">External job management</p>
              </div>
              <div className="p-3 bg-accent-magenta/10 text-accent-magenta rounded-2xl">
                 <Users size={20} />
              </div>
           </div>
           <div className="space-y-4 relative z-10 font-sans">
              {[
                { project: 'NCERT Textbook series', client: 'Govt. of India', contractor: 'Vikas Binding', progress: 45, value: '₹12.5L' },
                { project: 'Seasonal Lookbook', client: 'Zara India', contractor: 'Fine Prints Ltd', progress: 90, value: '₹3.2L' },
              ].map((proj, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/projects')}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group/item hover:bg-white transition-all shadow-sm cursor-pointer"
                >
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-black text-primary group-hover/item:text-accent-magenta transition-colors">{proj.project}</h4>
                        <p className="text-[10px] text-secondary font-bold uppercase">{proj.client}</p>
                      </div>
                      <span className="text-[10px] font-black text-accent-magenta">{proj.value}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-1 w-full bg-gray-200 rounded-full">
                           <div className="h-full bg-accent-magenta rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-secondary uppercase opacity-50">{proj.progress}%</span>
                   </div>
                   <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-[8px] font-black text-primary">V</div>
                         <span className="text-[9px] font-bold text-secondary italic">Contractor: {proj.contractor}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedContractor({ name: proj.contractor, client: proj.client });
                          setShowLedger(true);
                        }}
                        className="text-[8px] font-black uppercase text-accent-magenta hover:underline"
                      >
                        Manage Voucher
                      </button>
                   </div>
                </div>
              ))}
           </div>
           <Layers size={280} className="absolute -right-20 -bottom-20 text-gray-50 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-primary rounded-[50px] p-12 text-white relative overflow-hidden group shadow-2xl">
        <div className="relative z-10 space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
              <Zap size={14} className="text-accent-cyan" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">System Status: Optimal</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black font-sans leading-none uppercase tracking-tighter italic">
              Empowering your <br /> <span className="text-accent-cyan">Printing Universe.</span>
           </h1>
           <p className="text-white/60 font-medium max-w-lg leading-relaxed italic">
              Unified command center for production, logistics, and financial intelligence. Everything you need to scale your print house in one place.
           </p>
           <div className="pt-4 flex gap-4">
              <button 
                onClick={() => navigate('/production')}
                className="px-8 py-4 bg-accent-cyan text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform flex items-center gap-3 shadow-xl shadow-accent-cyan/20"
              >
                 Browse Shop Floor <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/reports')}
                className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center gap-3"
              >
                 Generate Audit
              </button>
           </div>
        </div>
        <Activity size={400} className="absolute -right-20 -bottom-20 text-white/5 group-hover:scale-110 transition-transform duration-[2000ms]" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
             { label: 'Active Pipeline', value: '48 Jobs', icon: <Layers />, trend: '+12%', sub: 'Queued for today', color: '#06B6D4', path: '/jobs' },
             { label: 'Revenue (MTD)', value: '₹14.2L', icon: <TrendingUp />, trend: '+8.4%', sub: 'Target: ₹20L', color: '#D946EF', path: '/billing' },
             { label: 'Acquisition', value: '254', icon: <UserPlus />, trend: '+15', sub: 'New leads this week', color: '#10B981', path: '/crm' },
             { label: 'Procurement', value: '12 POs', icon: <ShoppingCart />, trend: 'Pending', sub: '₹4.5L Payable', color: '#F59E0B', path: '/procurement' },
           ].map((stat, idx) => (
              <div 
               key={idx} 
               onClick={() => navigate(stat.path)}
               className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative cursor-pointer"
              >
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all text-primary">
                       {stat.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.includes('+') ? 'text-success' : 'text-secondary opacity-50'}`}>
                       {stat.trend}
                    </span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">{stat.label}</p>
                    <h3 className="text-3xl font-black text-primary mt-1 tracking-tighter uppercase italic">{stat.value}</h3>
                    <p className="text-[9px] text-secondary/60 font-bold mt-2 uppercase italic tracking-widest">{stat.sub}</p>
                 </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-1000">
                 {React.cloneElement(stat.icon as React.ReactElement, { size: 150 })}
              </div>
           </div>
        ))}
      </div>

      {/* Main Grid: Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Production Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-primary font-sans uppercase tracking-tighter">Production Velocity</h3>
                 <p className="text-[11px] text-secondary font-black uppercase tracking-widest opacity-40">Job completion dynamics over 7 days</p>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => alert('Opening date range selector...')}
                  className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                 >
                   <Calendar size={20} className="text-primary" />
                 </button>
                 <button 
                  onClick={() => alert('Chart export options...')}
                  className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                 >
                   <MoreHorizontal size={20} className="text-primary" />
                 </button>
              </div>
           </div>

           <div className="h-[400px] w-full relative z-10 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorSalesHome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}} />
                    <Area type="monotone" dataKey="sales" stroke="#1E3A5F" strokeWidth={5} fillOpacity={1} fill="url(#colorSalesHome)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <MousePointerClick size={300} className="absolute -right-20 -bottom-20 text-gray-50 opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
        </div>

        {/* Right Column: Recent Activity & Jobs */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-full">
              <h3 className="text-xl font-black text-primary font-sans uppercase tracking-tighter mb-8 italic">Live production log</h3>
              <div className="space-y-6">
                  {[
                    { title: 'Corporate Brochure', id: 'JOB-452', status: 'Design', color: '#06B6D4' },
                    { title: 'Menu Cards (Pizza Hut)', id: 'JOB-451', status: 'Printing', color: '#F59E0B' },
                    { title: 'Yearbook 2024', id: 'JOB-450', status: 'Binding', color: '#10B981' },
                    { title: 'Flex Banner (Big Bazaar)', id: 'JOB-449', status: 'Packing', color: '#6366F1' },
                    { title: 'Visiting Cards (Self)', id: 'JOB-448', status: 'Plate Making', color: '#D946EF' },
                  ].map((job, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate('/production')}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[10px] border-2 shadow-sm transition-all group-hover:scale-110" style={{ borderColor: job.color, color: job.color }}>
                       {job.id.split('-')[1]}
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-black text-primary group-hover:text-accent-cyan transition-colors">{job.title}</h4>
                       <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-40">{job.status} • 35% Completed</p>
                    </div>
                    <ChevronRight size={16} className="text-secondary opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
               <button 
                  onClick={() => navigate('/production')}
                  className="w-full mt-10 py-5 bg-gray-50 hover:bg-gray-100 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  View All Production Assets
                </button>
           </div>
        </div>
      </div>

       {/* Bottom Info Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
           onClick={() => navigate('/inventory')}
           className="bg-accent-amber/5 border border-accent-amber/20 p-8 rounded-[40px] flex items-center gap-6 group overflow-hidden relative cursor-pointer hover:bg-accent-amber/10 transition-colors"
          >
             <div className="p-4 bg-white rounded-2xl shadow-xl shadow-accent-amber/10 group-hover:rotate-12 transition-transform duration-500">
                <AlertTriangle size={32} className="text-accent-amber" />
             </div>
             <div>
                <h4 className="text-sm font-black text-primary font-sans uppercase tracking-widest">Inventory alert</h4>
                <p className="text-xs text-secondary font-medium italic mt-1 leading-relaxed">Paper usage is exceeding forecasts.</p>
             </div>
          </div>

          <div 
           onClick={() => navigate('/machines')}
           className="bg-danger/5 border border-danger/20 p-8 rounded-[40px] flex items-center gap-6 group overflow-hidden relative cursor-pointer hover:bg-danger/10 transition-colors"
          >
             <div className="p-4 bg-white rounded-2xl shadow-xl shadow-danger/10 group-hover:rotate-12 transition-transform duration-500">
                <Wrench size={32} className="text-danger" />
             </div>
             <div>
                <h4 className="text-sm font-black text-primary font-sans uppercase tracking-widest">Maintenance</h4>
                <p className="text-xs text-secondary font-medium italic mt-1 leading-relaxed">Komori L-G40 requires service in <span className="text-danger font-black">2 days</span>.</p>
             </div>
          </div>

          <div 
           onClick={() => navigate('/production')}
           className="bg-success/5 border border-success/20 p-8 rounded-[40px] flex items-center gap-6 group overflow-hidden relative cursor-pointer hover:bg-success/10 transition-colors"
          >
             <div className="p-4 bg-white rounded-2xl shadow-xl shadow-success/10 group-hover:rotate-12 transition-transform duration-500">
                <CheckCircle size={32} className="text-success" />
             </div>
             <div>
                <h4 className="text-sm font-black text-primary font-sans uppercase tracking-widest">Efficiency</h4>
                <p className="text-xs text-secondary font-medium italic mt-1 leading-relaxed">Shop floor uptime hit a 30-day high of <span className="text-success font-black">98%</span>.</p>
             </div>
          </div>

          <div 
           onClick={() => navigate('/crm')}
           className="bg-primary/5 border border-primary/20 p-8 rounded-[40px] flex items-center gap-6 group overflow-hidden relative cursor-pointer hover:bg-primary/10 transition-colors"
          >
             <div className="p-4 bg-white rounded-2xl shadow-xl shadow-primary/10 group-hover:rotate-12 transition-transform duration-500">
                <Zap size={32} className="text-primary" />
             </div>
             <div>
                <h4 className="text-sm font-black text-primary font-sans uppercase tracking-widest">Growth Engine</h4>
                <p className="text-xs text-secondary font-medium italic mt-1 leading-relaxed">AI has identified <span className="text-primary font-black">3 leads</span> in your pipeline.</p>
             </div>
          </div>

          <div className="bg-gradient-to-br from-accent-cyan to-primary p-8 rounded-[40px] text-white shadow-xl shadow-accent-cyan/20 overflow-hidden relative group cursor-pointer">
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase italic tracking-tighter mb-1">Mobile Companion</h3>
                <p className="text-[10px] font-bold opacity-80 mb-4">Access job cards on the go.</p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => alert('Initiating Android APK package download...') }
                     className="bg-white text-primary px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                   >
                     Android APK
                   </button>
                   <button 
                     onClick={() => alert('Showing iOS configuration steps via TestFlight...') }
                     className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white/30 transition-all"
                   >
                     iOS Setup
                   </button>
                </div>
              </div>
              <Phone size={100} className="absolute -right-5 -bottom-5 opacity-20 -rotate-12 group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
           </div>
       </div>
    </div>
  );
}
