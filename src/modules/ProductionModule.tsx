import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, Play, CheckCircle, AlertCircle, Clock, 
  Layers, Printer, Scissors, PackageCheck, Box, Monitor, 
  Pause, ChevronRight, User, Cpu, BarChart3, AlertTriangle, X, Activity
} from 'lucide-react';

interface ProductionStage {
  id: string;
  name: 'Design' | 'Plate Making' | 'Printing' | 'Cutting' | 'Finishing' | 'Packing';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  operator: string;
  machineId: string;
  startTime?: string;
  endTime?: string;
  outputQty?: number;
  wastage?: number;
}

interface ActiveJob {
  id: string;
  jcNo: string;
  title: string;
  customer: string;
  totalQty: number;
  deadline: string;
  priority: 'High' | 'Medium' | 'Normal';
  currentStage: string;
  stages: ProductionStage[];
}

const mockActiveJobs: ActiveJob[] = [
  {
    id: '1',
    jcNo: 'SOP/JC/013',
    title: 'GANITH Textbook Cover Cls 4',
    customer: 'Malhotra Publishing',
    totalQty: 9200,
    deadline: '2024-03-30',
    priority: 'High',
    currentStage: 'Printing',
    stages: [
      { id: 's1', name: 'Design', status: 'Completed', operator: 'Amit S.', machineId: 'D-01', startTime: '09:00', endTime: '11:00', outputQty: 1, wastage: 0 },
      { id: 's2', name: 'Plate Making', status: 'Completed', operator: 'Global Team', machineId: 'CTP-02', startTime: '11:30', endTime: '12:30', outputQty: 4, wastage: 1 },
      { id: 's3', name: 'Printing', status: 'In Progress', operator: 'Suresh K.', machineId: 'Heidelberg 102', startTime: '13:00', outputQty: 4500, wastage: 45 },
      { id: 's4', name: 'Cutting', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
      { id: 's5', name: 'Finishing', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
      { id: 's6', name: 'Packing', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
    ]
  },
  {
    id: '2',
    jcNo: 'SOP/JC/014',
    title: 'Corporate Brochure',
    customer: 'Sharma Creative',
    totalQty: 5000,
    deadline: '2024-03-28',
    priority: 'Medium',
    currentStage: 'Plate Making',
    stages: [
      { id: 's1', name: 'Design', status: 'Completed', operator: 'Rahul P.', machineId: 'D-01', startTime: '10:00', endTime: '14:00', outputQty: 1, wastage: 0 },
      { id: 's2', name: 'Plate Making', status: 'Delayed', operator: 'Sunil V.', machineId: 'CTP-01', startTime: '15:00' },
      { id: 's3', name: 'Printing', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
      { id: 's4', name: 'Cutting', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
      { id: 's5', name: 'Finishing', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
      { id: 's6', name: 'Packing', status: 'Pending', operator: 'N/A', machineId: 'N/A' },
    ]
  }
];

export default function ProductionModule() {
  const [jobs, setJobs] = useState<ActiveJob[]>(() => {
    const saved = localStorage.getItem('printing_pms_production_jobs');
    return saved ? JSON.parse(saved) : mockActiveJobs;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_production_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showMachineStatus, setShowMachineStatus] = useState(false);
  const [showOperatorLogs, setShowOperatorLogs] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const updateStageStatus = (jobId: string, stageId: string, newStatus: ProductionStage['status']) => {
    setJobs(jobs.map(job => {
      if (job.id !== jobId) return job;
      const updatedStages = job.stages.map(s => 
        s.id === stageId ? { ...s, status: newStatus, startTime: newStatus === 'In Progress' ? new Date().toLocaleTimeString() : s.startTime } : s
      );
      // Update current stage label
      const current = updatedStages.find(s => s.status === 'In Progress' || s.status === 'Delayed')?.name || 'None';
      return { ...job, stages: updatedStages, currentStage: current };
    }));
  };

  const getStageIcon = (name: string) => {
    switch(name) {
      case 'Design': return <Monitor size={16} />;
      case 'Plate Making': return <Layers size={16} />;
      case 'Printing': return <Printer size={16} />;
      case 'Cutting': return <Scissors size={16} />;
      case 'Finishing': return <PackageCheck size={16} />;
      case 'Packing': return <Box size={16} />;
      default: return <Settings size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'text-success bg-success/10 border-success/20';
      case 'In Progress': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
      case 'Delayed': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-secondary bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 text-primary">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="p-4 bg-danger/10 text-danger rounded-2xl">
              <AlertTriangle size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-secondary opacity-50 tracking-widest leading-none mb-1">Total Wastage (MTD)</p>
              <h4 className="text-2xl font-black">452 Sheets</h4>
              <p className="text-[9px] font-black text-danger uppercase mt-1">5.2% of Total Input</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="p-4 bg-success/10 text-success rounded-2xl">
              <CheckCircle size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-secondary opacity-50 tracking-widest leading-none mb-1">Pass Rate</p>
              <h4 className="text-2xl font-black">94.8%</h4>
              <p className="text-[9px] font-black text-success uppercase mt-1">Within Tolerance</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="p-4 bg-accent-cyan/10 text-accent-cyan rounded-2xl">
              <Activity size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-secondary opacity-50 tracking-widest leading-none mb-1">Avg. Setup Waste</p>
              <h4 className="text-2xl font-black">15 Sheets</h4>
              <p className="text-[9px] font-black text-secondary uppercase mt-1">Per Plate Set</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shop Floor Management</h2>
          <p className="text-secondary text-sm">Real-time production stage tracking and resource allocation.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowMachineStatus(true)}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all text-xs font-bold text-primary group"
          >
             <Cpu size={16} className="text-accent-cyan group-hover:rotate-90 transition-transform" /> Machine Status
          </button>
          <button 
            onClick={() => setShowOperatorLogs(true)}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all text-xs font-bold text-primary group"
          >
             <Users size={16} className="text-accent-magenta" /> Operator Logs
          </button>
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
             <span className="text-xs font-bold text-primary italic">Live Floor Status: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Active Jobs List */}
        <div className="xl:col-span-4 space-y-4">
           <h3 className="text-xs font-black uppercase text-secondary tracking-widest pl-2">Active Work Orders</h3>
           <div className="space-y-3">
              {jobs.map(job => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer group ${
                    selectedJobId === job.id ? 'ring-2 ring-accent-cyan border-transparent shadow-xl' : 'border-gray-100 shadow-sm hover:border-accent-cyan/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-gray-50 rounded italic">{job.jcNo}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                       job.priority === 'High' ? 'bg-danger text-white' : 'bg-accent-amber text-white'
                    }`}>
                      {job.priority} Priority
                    </span>
                  </div>
                  <h4 className="font-bold text-primary group-hover:text-accent-cyan transition-colors mb-1">{job.title}</h4>
                  <p className="text-xs text-secondary mb-4">{job.customer}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-widest">
                       <span>Current: {job.currentStage}</span>
                       <span>Qty: {job.totalQty}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full flex gap-1 overflow-hidden">
                       {job.stages.map((s, idx) => (
                         <div 
                           key={idx} 
                           className={`h-full flex-1 transition-all ${
                             s.status === 'Completed' ? 'bg-success' : 
                             s.status === 'In Progress' ? 'bg-accent-cyan animate-pulse' : 
                             s.status === 'Delayed' ? 'bg-danger' : 'bg-gray-200'
                           }`}
                         ></div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-2">
                       <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                         <Clock size={12} /> Deadline: {job.deadline}
                       </span>
                       {new Date(job.deadline) < new Date() && (
                         <AlertTriangle size={14} className="text-danger animate-bounce" />
                       )}
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Production Stage Detail */}
        <div className="xl:col-span-8">
           <AnimatePresence mode="wait">
             {selectedJobId ? (
               <motion.div
                 key={selectedJobId}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-6"
               >
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                       <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                         {selectedJob?.title} 
                         <span className="text-xs font-medium text-secondary opacity-50 font-mono">[{selectedJob?.jcNo}]</span>
                       </h3>
                       <p className="text-secondary text-sm">Target Quantity: <span className="font-bold text-primary">{selectedJob?.totalQty}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert(`Detailed performance analytics for JC: ${selectedJob?.jcNo}`)}
                        className="p-3 bg-gray-50 text-secondary hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <BarChart3 size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedJobId) {
                            setJobs(jobs.map(j => {
                              if (j.id !== selectedJobId) return j;
                              const updatedStages = j.stages.map(s => 
                                s.status === 'Pending' ? { ...s, status: 'In Progress' as const, startTime: new Date().toLocaleTimeString() } : s
                              );
                              return { ...j, stages: updatedStages, currentStage: updatedStages.find(s => s.status === 'In Progress')?.name || j.currentStage };
                            }));
                            alert(`SUCCESS: Batch output initialized for all pending stages of ${selectedJob?.jcNo}. Check the stage list below.`);
                          }
                        }}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-accent-cyan shadow-lg shadow-primary/20 transition-all font-sans"
                      >
                        <Play size={18} /> Start Batch Output
                      </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedJob?.stages.map((stage, idx) => (
                       <div 
                         key={stage.id} 
                         className={`bg-white rounded-2xl border p-5 transition-all relative overflow-hidden group ${
                           stage.status === 'In Progress' ? 'border-accent-cyan border-2 shadow-lg scale-[1.02]' : 'border-gray-100'
                         }`}
                       >
                          {stage.status === 'Delayed' && (
                            <div className="absolute top-0 right-0 p-1.5 bg-danger text-white rounded-bl-xl z-10 animate-pulse">
                               <AlertCircle size={14} />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl transition-colors ${
                                  stage.status === 'Completed' ? 'bg-success/10 text-success' : 
                                  stage.status === 'In Progress' ? 'bg-accent-cyan text-white' : 'bg-gray-100 text-secondary'
                                }`}>
                                   {getStageIcon(stage.name)}
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Stage {idx + 1}</p>
                                   <h5 className="font-bold text-primary">{stage.name}</h5>
                                </div>
                             </div>
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border min-w-20 text-center ${getStatusColor(stage.status)}`}>
                                {stage.status}
                             </span>
                          </div>

                          <div className="space-y-4 font-sans">
                             <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-secondary tracking-widest opacity-60">Assigned Machine</label>
                                   <div className="flex items-center gap-2 font-bold text-primary">
                                      <Cpu size={12} className="text-accent-cyan" /> {stage.machineId}
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-secondary tracking-widest opacity-60">Operator / Tech</label>
                                   <div className="flex items-center gap-2 font-bold text-primary">
                                      <Users size={12} className="text-accent-magenta" /> {stage.operator}
                                   </div>
                                </div>
                             </div>

                             {stage.status !== 'Pending' && (
                               <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-secondary uppercase">Output</span>
                                        <span className="text-primary">{stage.outputQty || 0}</span>
                                     </div>
                                     <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-success transition-all" 
                                          style={{ width: `${((stage.outputQty || 0) / (selectedJob?.totalQty || 1)) * 100}%` }}
                                        ></div>
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-secondary uppercase text-danger">Wastage</span>
                                        <span className="text-danger">{stage.wastage || 0}</span>
                                     </div>
                                     <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-danger transition-all opacity-50" 
                                          style={{ width: `${((stage.wastage || 0) / (selectedJob?.totalQty || 1)) * 100}%` }}
                                        ></div>
                                     </div>
                                  </div>
                               </div>
                             )}

                             {stage.status === 'In Progress' ? (
                               <div className="space-y-3 mt-4">
                                  <div className="flex gap-2">
                                     <div className="flex-1 space-y-1">
                                        <label className="text-[8px] font-black uppercase text-secondary">Good Output Qty</label>
                                        <input type="number" placeholder="Enter qty" className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-xs font-bold outline-none" />
                                     </div>
                                     <div className="flex-1 space-y-1">
                                        <label className="text-[8px] font-black uppercase text-danger">Wastage Qty</label>
                                        <input type="number" placeholder="Enter waste" className="w-full px-3 py-2 bg-danger/5 border border-danger/10 rounded-lg text-xs font-bold outline-none text-danger" />
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => updateStageStatus(selectedJobId!, stage.id, 'Completed')}
                                    className="w-full py-3 bg-accent-cyan hover:bg-accent-cyan-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-cyan/20 transition-all uppercase tracking-widest text-[10px]"
                                  >
                                     <Pause size={14} /> Pause & Record Production
                                  </button>
                               </div>
                             ) : stage.status === 'Pending' ? (
                               <button 
                                 onClick={() => updateStageStatus(selectedJobId!, stage.id, 'In Progress')}
                                 className="w-full mt-4 py-3 bg-primary hover:bg-accent-cyan text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px]"
                               >
                                  <Play size={14} /> Initialize Stage
                               </button>
                             ) : stage.status === 'Delayed' ? (
                               <button 
                                 onClick={() => updateStageStatus(selectedJobId!, stage.id, 'In Progress')}
                                 className="w-full mt-4 py-3 bg-danger hover:bg-accent-cyan text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px]"
                               >
                                  <Play size={14} /> Resume Stage
                               </button>
                             ) : (
                               <div className="flex items-center gap-2 text-success text-[10px] font-black uppercase mt-4 justify-center bg-success/5 p-2 rounded-lg border border-success/10">
                                  <CheckCircle size={14} /> Stage Finalized
                               </div>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
               </motion.div>
             ) : (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center p-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-secondary mb-6 shadow-inner">
                     <Monitor size={40} className="opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Select a Work Order</h3>
                  <p className="text-secondary text-sm max-w-xs">Please select a job card from the left panel to begin stage-wise production tracking.</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Machine Status Modal */}
      <AnimatePresence>
        {showMachineStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMachineStatus(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-primary uppercase italic">Machine Center Status</h3>
                  <button onClick={() => setShowMachineStatus(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Heidelberg 102', status: 'Running', load: '85%', health: 'Good' },
                    { name: 'CTP-01', status: 'Idle', load: '0%', health: 'Maintenance Due' },
                    { name: 'Polar Cutter 115', status: 'Running', load: '60%', health: 'Excellent' },
                    { name: 'Folding Machine', status: 'Maintenance', load: '0%', health: 'Repairing' },
                  ].map((m, i) => (
                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black text-secondary uppercase mb-1">{m.name}</p>
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${m.status === 'Running' ? 'bg-success' : 'bg-accent-amber'}`}></div>
                             <span className="text-sm font-bold text-primary">{m.status}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-secondary uppercase opacity-50">Load</p>
                          <p className="text-sm font-black text-accent-cyan">{m.load}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Operator Logs Modal */}
      <AnimatePresence>
        {showOperatorLogs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOperatorLogs(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-primary uppercase italic">Operator Production Logs</h3>
                  <button onClick={() => setShowOperatorLogs(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
               </div>
               <div className="space-y-4">
                  {[
                    { operator: 'Suresh K.', task: 'Printing SOP/JC/013', time: '13:00 - Present', status: 'Active' },
                    { operator: 'Sunil V.', task: 'Plate Making SOP/JC/014', time: '15:00 - 15:45', status: 'Idle' },
                    { operator: 'Amit S.', task: 'Design SOP/JC/015', time: '09:00 - 11:00', status: 'Off-duty' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{log.operator[0]}</div>
                          <div>
                             <p className="text-sm font-bold text-primary">{log.operator}</p>
                             <p className="text-[10px] text-secondary font-medium tracking-widest uppercase">{log.task}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-secondary uppercase">{log.time}</p>
                          <p className={`text-[9px] font-black uppercase ${log.status === 'Active' ? 'text-success' : 'text-secondary'}`}>{log.status}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
