import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Bell, Database, Globe, Lock, Mail, Trash2, Users, Settings, Search, Plus, X } from 'lucide-react';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [financialYears, setFinancialYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('printing_pms_fy_list');
    return saved ? JSON.parse(saved) : ['FY 2022-23', 'FY 2023-24', 'FY 2024-25'];
  });
  const [activeFY, setActiveFY] = useState(() => {
    return localStorage.getItem('printing_pms_active_fy') || 'FY 2024-25';
  });
  const [isFYModalOpen, setIsFYModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('printing_pms_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Admin User', role: 'Super Admin', email: 'admin@ppms.com', status: 'Active' },
      { id: 2, name: 'Rajesh K.', role: 'Machine Operator', email: 'rajesh@ppms.com', status: 'Active' },
      { id: 3, name: 'Sunil V.', role: 'Production In-charge', email: 'sunil@ppms.com', status: 'Blocked' },
      { id: 4, name: 'Amit S.', role: 'Designer', email: 'amit@ppms.com', status: 'Active' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_fy_list', JSON.stringify(financialYears));
  }, [financialYears]);

  useEffect(() => {
    localStorage.setItem('printing_pms_active_fy', activeFY);
  }, [activeFY]);

  useEffect(() => {
    localStorage.setItem('printing_pms_users', JSON.stringify(users));
  }, [users]);

  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Users', icon: Shield },
    { id: 'Notifications', icon: Bell },
    { id: 'System', icon: Database },
  ];

  const handleAddFY = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newFY = formData.get('fy') as string;
    if (newFY && !financialYears.includes(newFY)) {
      setFinancialYears([...financialYears, newFY]);
      setIsFYModalOpen(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary italic">System Settings</h2>
          <p className="text-secondary text-sm font-medium">Configure your production environment and staff access permissions.</p>
        </div>
        <button className="bg-primary hover:bg-accent-magenta text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all">
          Sync Configurations
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all border ${
                activeTab === tab.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white text-secondary border-gray-100 hover:border-accent-cyan'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-accent-cyan' : 'text-gray-300'} />
              {tab.id}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
             {activeTab === 'Profile' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <div className="flex items-center gap-8 pb-10 border-b border-gray-100">
                     <div className="relative group">
                        <div className="w-28 h-28 rounded-[32px] bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl uppercase italic">A</div>
                        <button className="absolute inset-0 bg-black/40 text-white text-[9px] font-black rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center uppercase tracking-widest">Update Avatar</button>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-primary uppercase italic tracking-tight">System Architect</h3>
                        <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-1 opacity-50">Enterprise Admin • Access Level 9</p>
                        <div className="flex gap-2 mt-4">
                           <span className="px-3 py-1 bg-success/10 text-success text-[8px] font-black uppercase rounded-lg border border-success/20">Verified</span>
                           <span className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan text-[8px] font-black uppercase rounded-lg border border-accent-cyan/20">2FA Active</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Primary Identity</label>
                        <input type="text" defaultValue="Admin User" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-accent-magenta transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Contact Node</label>
                        <input type="email" defaultValue="admin@ppms.com" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-accent-magenta transition-all" />
                     </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100 space-y-8">
                     <h4 className="text-sm font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                        <Globe size={18} className="text-accent-cyan" /> Business Profile
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Organization Name</label>
                           <input type="text" defaultValue="Sanjayshree Offset Printers" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-accent-cyan transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Primary GST Number</label>
                           <input type="text" defaultValue="27AAAAA0000A1Z5" maxLength={15} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-mono font-bold text-sm focus:ring-2 focus:ring-accent-cyan transition-all" />
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'Users' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                        <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Personnel Control Center</h3>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">Manage staff access and module permissions</p>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                           <input 
                             type="text" 
                             placeholder="Search Personnel..." 
                             value={userSearchTerm}
                             onChange={(e) => setUserSearchTerm(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                           />
                        </div>
                        <button className="bg-primary text-white p-2.5 rounded-xl hover:bg-accent-magenta transition-colors shadow-lg">
                           <Plus size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {filteredUsers.map((user) => (
                        <div key={user.id} className={`flex items-center justify-between p-6 bg-gray-50 rounded-[28px] border transition-all group ${user.status === 'Blocked' ? 'opacity-40 grayscale' : 'border-gray-100 hover:border-accent-cyan hover:bg-white'}`}>
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 text-primary flex items-center justify-center font-black italic shadow-sm text-xl">{user.name[0]}</div>
                              <div>
                                 <p className="font-black text-primary uppercase italic text-sm">{user.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">{user.role} • {user.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${user.status === 'Active' ? 'text-success border-success/20 bg-success/5' : 'text-danger border-danger/20 bg-danger/5'}`}>
                                 {user.status}
                              </span>
                              <div className="flex items-center gap-1">
                                 <button className="p-3 text-secondary hover:text-accent-cyan hover:bg-gray-100 rounded-xl transition-all"><Settings size={18} /></button>
                                 <button className="p-3 text-secondary hover:text-danger hover:bg-danger/5 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </div>
                           </div>
                        </div>
                     ))}
                     {filteredUsers.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                           <Users size={48} className="mx-auto text-gray-200 mb-4" />
                           <p className="text-sm font-black text-secondary uppercase tracking-widest">No personnel matching search</p>
                        </div>
                     )}
                  </div>
               </motion.div>
             )}

             {activeTab === 'System' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">Financial Segments</h3>
                           <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">Global period settings for billing and records</p>
                        </div>
                        <button 
                          onClick={() => setIsFYModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-accent-cyan/10 text-accent-cyan rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-cyan hover:text-white transition-all shadow-sm"
                        >
                           <Plus size={16} /> ADD YEAR
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {financialYears.map(fy => (
                          <button 
                            key={fy}
                            onClick={() => setActiveFY(fy)}
                            className={`p-6 rounded-[32px] text-left transition-all border group relative overflow-hidden ${fy === activeFY ? 'bg-primary border-primary shadow-2xl shadow-primary/30' : 'bg-gray-50 border-gray-100 hover:border-accent-cyan'}`}
                          >
                             <div className="relative z-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${fy === activeFY ? 'text-accent-cyan' : 'text-gray-400'}`}>Fiscal Period</p>
                                <p className={`text-xl font-black italic uppercase ${fy === activeFY ? 'text-white' : 'text-primary'}`}>{fy}</p>
                                {fy === activeFY && (
                                   <div className="mt-4 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Current Primary</span>
                                   </div>
                                )}
                             </div>
                             <Globe size={80} className={`absolute -right-5 -bottom-5 transition-all group-hover:scale-110 opacity-[0.03] ${fy === activeFY ? 'text-white' : 'text-primary'}`} />
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-accent-magenta"><Database size={24} /></div>
                        <div>
                           <p className="font-black text-primary uppercase italic text-sm">System Database Health</p>
                           <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Last backup: Today at 04:20 AM • Status: Optimized</p>
                        </div>
                     </div>
                     <button className="px-8 py-3 bg-white border border-gray-200 text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-sm">Recalculate Indices</button>
                  </div>
               </motion.div>
             )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFYModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFYModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full border border-gray-100 font-sans">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent-cyan/10 text-accent-cyan rounded-2xl"><Plus size={24} /></div>
                    <h3 className="text-xl font-black text-primary uppercase italic">Add Fiscal Period</h3>
                 </div>
                 <button onClick={() => setIsFYModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddFY} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">New Financial Year</label>
                  <input name="fy" required defaultValue={`FY 20${financialYears.length + 25}-${financialYears.length + 26}`} placeholder="e.g. FY 2026-27" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <button type="submit" className="w-full py-5 bg-accent-cyan text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent-cyan/20 hover:bg-primary transition-all">
                  Onboard Financial Block
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
