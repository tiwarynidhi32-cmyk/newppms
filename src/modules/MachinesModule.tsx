import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Wrench, History, Calendar, AlertCircle, CheckCircle2, 
  Settings2, Activity, Clock, Plus, PenTool as Tool, X, Search
} from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  model: string;
  purchaseDate: string;
  lastService: string;
  nextService: string;
  status: 'Operating' | 'Idle' | 'Repair' | 'Service Needed';
  totalImpressions: number;
}

interface MaintenanceLog {
  date: string;
  machine: string;
  action: string;
  cost: string;
  tech: string;
}

const mockMachines: Machine[] = [
  { id: 'M-1', name: 'Heidelberg SM 74', model: '2018 Offset', purchaseDate: '2018-05-12', lastService: '2024-01-10', nextService: '2024-04-10', status: 'Operating', totalImpressions: 4500000 },
  { id: 'M-2', name: 'Komori Lithrone', model: 'G40', purchaseDate: '2019-11-20', lastService: '2023-12-05', nextService: '2024-03-25', status: 'Service Needed', totalImpressions: 3200000 },
];

const mockMaintenanceHistory: MaintenanceLog[] = [
  { date: '2024-03-24', machine: 'Heidelberg', action: 'Roller Deglazing & Alignment', cost: '₹5,400', tech: 'Amit Kumar' },
  { date: '2024-03-10', machine: 'Komori', action: 'Sensor Cleaning', cost: '₹1,200', tech: 'Amit Kumar' },
];

export default function MachinesModule() {
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('printing_pms_machines');
    return saved ? JSON.parse(saved) : mockMachines;
  });

  const [history, setHistory] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem('printing_pms_machine_history');
    return saved ? JSON.parse(saved) : mockMaintenanceHistory;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('printing_pms_machine_history', JSON.stringify(history));
  }, [history]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [filterMachine, setFilterMachine] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRegisterMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newMachine: Machine = {
      id: `M-${machines.length + 1}`,
      name: formData.get('name') as string,
      model: formData.get('model') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      lastService: 'Never',
      nextService: formData.get('nextService') as string || 'Set Schedule',
      status: 'Idle',
      totalImpressions: 0
    };
    setMachines([...machines, newMachine]);
    setIsRegisterModalOpen(false);
  };

  const toggleMaintenance = (machineId: string) => {
    setMachines(machines.map(m => {
      if (m.id === machineId) {
        return { ...m, status: m.status === 'Repair' ? 'Operating' : 'Repair' };
      }
      return m;
    }));
  };

  const handleLogMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const nextServiceDate = formData.get('nextServiceDate') as string;
    
    const newLog: MaintenanceLog = {
      date: new Date().toISOString().split('T')[0],
      machine: selectedMachine?.name || 'Unknown',
      action: formData.get('action') as string,
      cost: `₹${Number(formData.get('cost')).toLocaleString()}`,
      tech: formData.get('tech') as string
    };
    setHistory([newLog, ...history]);
    setIsMaintenanceModalOpen(false);
    
    if (selectedMachine) {
       setMachines(machines.map(m => m.id === selectedMachine.id ? { 
         ...m, 
         lastService: newLog.date, 
         nextService: nextServiceDate || m.nextService,
         status: 'Operating' 
       } : m));
    }
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = filterMachine 
    ? history.filter(h => h.machine.toLowerCase().includes(filterMachine.toLowerCase())) 
    : history;

  return (
    <div className="space-y-6">
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsRegisterModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-xl w-full border border-gray-100 font-sans">
            <h3 className="text-2xl font-black text-primary uppercase italic mb-8">Register Factory Asset</h3>
            <form onSubmit={handleRegisterMachine} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Machine Name</label>
                <input name="name" required placeholder="e.g. Heidelberg Offset" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Model / Type</label>
                <input name="model" required placeholder="e.g. Speedmaster 2022" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Purchase Date</label>
                <input name="purchaseDate" type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Initial Service Plan (Due Date)</label>
                <input name="nextService" type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all">Register Asset</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isMaintenanceModalOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsMaintenanceModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-xl w-full border border-gray-100 font-sans">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent-cyan/10 text-accent-cyan rounded-2xl"><Wrench size={24} /></div>
                  <div>
                     <h3 className="text-2xl font-black text-primary uppercase italic">Log Maintenance</h3>
                     <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Servicing: {selectedMachine.name}</p>
                  </div>
               </div>
               <button 
                 type="button"
                 onClick={() => {
                   toggleMaintenance(selectedMachine.id);
                   setIsMaintenanceModalOpen(false);
                 }}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                   selectedMachine.status === 'Repair' ? 'bg-success/10 text-success hover:bg-success hover:text-white' : 'bg-danger/10 text-danger hover:bg-danger hover:text-white'
                 }`}
               >
                  {selectedMachine.status === 'Repair' ? 'Restore to Operating' : 'Mark as Under Repair'}
               </button>
            </div>
            <form onSubmit={handleLogMaintenance} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Service Action / Description</label>
                <textarea name="action" required placeholder="Detailed notes about the service..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold h-24" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Next Due Date (Schedule)</label>
                <input name="nextServiceDate" type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Total Service Cost</label>
                <input name="cost" type="number" required placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Lead Engineer / Tech</label>
                <input name="tech" required placeholder="Name of Engineer" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
              </div>
              <div className="col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-accent-cyan text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent-cyan/20 hover:bg-primary transition-all">Complete Log & Restore Status</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Machine Assets & Maintenance</h2>
          <p className="text-secondary text-sm font-medium">Monitor equipment health and schedule preventive maintenance.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
             <input 
               type="text" 
               placeholder="Search assets..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 focus:ring-accent-cyan" 
             />
          </div>
          {filterMachine && (
             <button 
               onClick={() => setFilterMachine(null)}
               className="bg-gray-100 text-secondary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] font-sans"
             >
               Show All History
             </button>
          )}
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all font-sans"
          >
            <Plus size={20} /> Register Machine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredMachines.map(machine => (
          <div key={machine.id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${
                        machine.status === 'Operating' ? 'bg-success/10 text-success' : 
                        machine.status === 'Service Needed' ? 'bg-danger/10 text-danger' : 
                        machine.status === 'Repair' ? 'bg-accent-magenta/10 text-accent-magenta' : 'bg-gray-100 text-secondary'
                     }`}>
                        <Settings2 className={machine.status === 'Operating' ? 'animate-spin-slow' : ''} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-primary uppercase italic">{machine.name}</h3>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{machine.model} • SN-{machine.id}</p>
                     </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    machine.status === 'Operating' ? 'border-success/20 text-success bg-success/5' : 
                    machine.status === 'Service Needed' ? 'border-danger/20 text-danger bg-danger/5' : 
                    machine.status === 'Repair' ? 'border-accent-magenta/20 text-accent-magenta bg-accent-magenta/5' : 'border-gray-200 text-secondary'
                  }`}>
                    {machine.status}
                  </span>
               </div>

               <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-secondary opacity-50 mb-1">Total Impressions</p>
                     <p className="text-sm font-black text-primary">{(machine.totalImpressions / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-secondary opacity-50 mb-1">Last Service</p>
                     <p className="text-sm font-black text-primary">{machine.lastService}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                     <p className="text-[8px] font-black uppercase text-primary opacity-60 mb-1">Service Due Date</p>
                     <p className="text-sm font-black text-primary italic">{machine.nextService}</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        setSelectedMachine(machine);
                        setIsMaintenanceModalOpen(true);
                    }}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:bg-accent-cyan transition-all"
                  >
                     Configure & Service
                  </button>
                  <button 
                    onClick={() => {
                       setFilterMachine(machine.name.split(' ')[0]);
                       const el = document.getElementById('global-history');
                       el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-4 bg-gray-50 text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                  >
                     History
                  </button>
               </div>
            </div>
            
            <Activity size={200} className="absolute -right-20 -bottom-20 text-gray-50/5 opacity-40 -rotate-12 group-hover:scale-110 transition-transform duration-[10s]" />
          </div>
        ))}
      </div>

      <div id="global-history" className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <History className={filterMachine ? 'text-accent-magenta' : 'text-accent-cyan'} />
               <h3 className="text-xl font-black text-primary uppercase italic">
                 {filterMachine ? `${filterMachine} Maintenance Logs` : 'Global Maintenance History'}
               </h3>
            </div>
            {filterMachine && (
               <span className="text-[10px] font-black uppercase bg-accent-magenta/10 text-accent-magenta px-3 py-1 rounded-full">Filtering Active</span>
            )}
         </div>
         <div className="space-y-4">
            {filteredHistory.length > 0 ? filteredHistory.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all rounded-xl group">
                 <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-secondary uppercase">{log.date}</span>
                    <div>
                       <p className="text-sm font-black text-primary uppercase">{log.machine} — {log.action}</p>
                       <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Engineer: {log.tech}</p>
                    </div>
                 </div>
                 <span className="font-black text-primary opacity-60">{log.cost}</span>
              </div>
            )) : (
               <div className="p-10 text-center text-secondary opacity-40 font-bold uppercase tracking-widest text-xs">No records found for this machine.</div>
            )}
         </div>
      </div>
    </div>
  );
}
