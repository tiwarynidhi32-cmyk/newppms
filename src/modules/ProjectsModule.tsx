import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Plus, Search, Filter, Calendar, Clock, 
  CheckCircle2, AlertCircle, ChevronRight, MoreHorizontal,
  Target, BarChart, Users, ArrowUpRight, X
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: 'Planning' | 'Active' | 'On Hold' | 'Finalizing' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  budget: string;
  manager: string;
  tasks: { name: string; completed: boolean }[];
}

const mockProjects: Project[] = [
  { 
    id: 'PRJ-001', 
    name: 'NCERT Textbook Series (2024-25)', 
    client: 'Govt. of India (NCERT)', 
    startDate: '2024-03-01', 
    deadline: '2024-06-15', 
    progress: 45, 
    status: 'Active', 
    priority: 'Critical',
    budget: '₹45,00,000',
    manager: 'Deepak Sharma',
    tasks: [
      { name: 'Paper Procurement', completed: true },
      { name: 'Plate Making (Batch A)', completed: true },
      { name: 'Printing (Core Subjects)', completed: false },
      { name: 'Binding & Finishing', completed: false },
    ]
  },
  { 
    id: 'PRJ-002', 
    name: 'Luxury Packaging Overhaul', 
    client: 'Organic Wellness Pvt Ltd', 
    startDate: '2024-03-20', 
    deadline: '2024-04-30', 
    progress: 15, 
    status: 'Planning', 
    priority: 'High',
    budget: '₹8,50,000',
    manager: 'Sonia Verma',
    tasks: [
      { name: 'Structure Designing', completed: true },
      { name: 'Sample Prototyping', completed: false },
      { name: 'Drip UV Testing', completed: false },
    ]
  },
];

export default function ProjectsModule() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('printing_pms_projects');
    return saved ? JSON.parse(saved) : mockProjects;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_projects', JSON.stringify(projects));
  }, [projects]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newProject: Project = {
      id: `PRJ-00${projects.length + 1}`,
      name: formData.get('name') as string,
      client: formData.get('client') as string,
      startDate: new Date().toISOString().split('T')[0],
      deadline: formData.get('deadline') as string,
      progress: 0,
      status: 'Planning',
      priority: formData.get('priority') as any,
      budget: `₹${Number(formData.get('budget')).toLocaleString()}`,
      manager: formData.get('manager') as string,
      tasks: [],
    };
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  const getStatusStyle = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'bg-success/10 text-success border-success/20';
      case 'Planning': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
      case 'On Hold': return 'bg-danger/10 text-danger border-danger/20';
      case 'Finalizing': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      default: return 'bg-gray-100 text-secondary border-gray-200';
    }
  };

  const getPriorityStyle = (priority: Project['priority']) => {
    switch (priority) {
      case 'Critical': return 'text-danger';
      case 'High': return 'text-accent-magenta';
      case 'Medium': return 'text-accent-amber';
      default: return 'text-secondary';
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-2xl w-full border border-gray-100 font-sans">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent-magenta/10 text-accent-magenta rounded-2xl"><Plus size={24} /></div>
                    <div>
                       <h3 className="text-2xl font-black text-primary uppercase italic">New Project Intake</h3>
                       <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Commence New Enterprise Assignment</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateProject} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Project Name</label>
                  <input name="name" required placeholder="e.g. Annual Report 2024" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Client Name</label>
                  <input name="client" required placeholder="Client Entity Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Project Manager</label>
                  <input name="manager" required placeholder="Manager Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Completion Deadline</label>
                  <input name="deadline" type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">EST. Budget (INR)</label>
                  <input name="budget" type="number" required placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Priority Tier</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                      <label key={p} className="cursor-pointer">
                        <input type="radio" name="priority" value={p} defaultChecked={p === 'Medium'} className="hidden peer" />
                        <div className="py-2 text-center bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase peer-checked:bg-primary peer-checked:text-white transition-all">
                          {p}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 bg-accent-magenta text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent-magenta/20 hover:bg-primary transition-all">
                    Register Project & Initiate Planning
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Project Management Board</h2>
          <p className="text-secondary text-sm font-medium italic">Requirement #27: Multi-stage tracking for large enterprise projects.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input 
                type="text" 
                placeholder="Search Projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-accent-magenta transition-all"
              />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-primary hover:bg-accent-magenta text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-all"
           >
             <Plus size={20} /> Create New Project
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', value: filteredProjects.length, icon: Layers, color: 'text-primary' },
          { label: 'Active Pipeline', value: '₹53.5L', icon: Target, color: 'text-accent-cyan' },
          { label: 'Avg. Completion', value: '30%', icon: BarChart, color: 'text-success' },
          { label: 'Team Load', value: 'High', icon: Users, color: 'text-danger' },
        ].map((stat, i) => ( stat &&
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
             <div className={`p-3 bg-gray-50 rounded-2xl ${stat.color}`}><stat.icon size={20} /></div>
             <div>
                <p className="text-[10px] font-black text-secondary uppercase opacity-40">{stat.label}</p>
                <p className="text-lg font-black text-primary italic">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProjects.map(project => (
          <motion.div 
            key={project.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
          >
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${getPriorityStyle(project.priority)}`}>
                        {project.priority} Priority
                      </span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[10px] font-black text-secondary uppercase tracking-tighter opacity-40">{project.id}</span>
                   </div>
                   <button className="p-2 hover:bg-gray-100 rounded-xl transition-all"><MoreHorizontal size={18} /></button>
                </div>

                <h3 className="text-xl font-black text-primary uppercase italic mb-2 tracking-tight group-hover:text-accent-cyan transition-colors">{project.name}</h3>
                <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-6">{project.client}</p>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-secondary uppercase tracking-widest">
                         <span>Project Progress</span>
                         <span className="text-primary">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                         <div 
                           className="h-full bg-primary rounded-full transition-all duration-1000" 
                           style={{ width: `${project.progress}%` }} 
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[8px] font-black text-secondary uppercase opacity-50 mb-1">Project Manager</p>
                         <p className="text-xs font-black text-primary italic uppercase tracking-tighter">{project.manager}</p>
                      </div>
                      <div className={`p-4 rounded-2xl border ${getStatusStyle(project.status)}`}>
                         <p className="text-[8px] font-black opacity-50 mb-1">Current Phase</p>
                         <p className="text-xs font-black italic uppercase tracking-tighter">{project.status}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Core Milestones</p>
                      <div className="grid grid-cols-2 gap-2">
                         {project.tasks.map((task, i) => (
                           <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl">
                              {task.completed ? <CheckCircle2 size={12} className="text-success" /> : <Clock size={12} className="text-secondary" />}
                              <span className={`text-[10px] font-bold ${task.completed ? 'text-primary' : 'text-secondary opacity-60'}`}>{task.name}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-secondary">
                         <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
                            <Calendar size={12} />
                            <span>Due: {project.deadline}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => alert(`Redirecting to full Gantt chart & Milestone tracker for ${project.name}...`)}
                        className="flex items-center gap-2 text-primary hover:text-accent-cyan transition-colors"
                      >
                         <span className="text-[10px] font-black uppercase tracking-widest">Detailed Tracking</span>
                         <ArrowUpRight size={14} />
                      </button>
                   </div>
                </div>
             </div>
             
             <Layers size={220} className="absolute -right-20 -bottom-20 text-gray-50/10 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
