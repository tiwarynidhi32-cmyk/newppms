import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Printer, Search, X, ChevronRight, Eye } from 'lucide-react';
import JobCardPrintView from '../components/JobCardPrintView';

interface JobCard {
  id: string;
  jcNo: string;
  jcDate: string;
  party: string;
  productType: string;
  bookTitle: string;
  size: string;
  quantity: number;
  priority: string;
  deadline: string;
  status: string;
  // Tech Specs
  paperType?: string;
  gsm?: number;
  colorType?: string;
  printingType?: string;
  finishing?: string[];
  machine?: string;
  contractorName?: string;
}

export default function JobCardModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [printingJob, setPrintingJob] = useState<JobCard | null>(null);
  const [jobs] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem('printing_pms_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredJobs = jobs.filter(j => 
    j.jcNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Composite Job Management</h2>
          <p className="text-secondary text-sm font-medium italic">Unified Review Portal for Sanjayshree Offset Printers Job Cards.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
           <input 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search by JC#, Customer or Title..."
             className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-accent-cyan w-full md:w-80 shadow-sm transition-all"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-accent-cyan transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1 px-3 bg-primary text-white text-[8px] font-black uppercase tracking-tighter rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  ID: {job.id}
               </div>
               
               <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan italic">{job.jcNo}</span>
                  <h3 className="font-bold text-primary group-hover:text-accent-cyan transition-all leading-tight mt-1">{job.bookTitle}</h3>
                  <p className="text-[10px] font-bold text-secondary uppercase mt-1 opacity-60">{job.party}</p>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                     <span className="text-[8px] font-black uppercase text-secondary block">Material</span>
                     <span className="text-xs font-bold text-primary truncate block">{job.paperType || 'Unassigned'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                     <span className="text-[8px] font-black uppercase text-secondary block">Machine</span>
                     <span className="text-xs font-bold text-primary truncate block">{job.machine || 'Pending'}</span>
                  </div>
               </div>

               <button 
                 onClick={() => setPrintingJob(job)}
                 className="w-full py-4 bg-gray-50 text-secondary font-black uppercase text-[10px] tracking-widest rounded-2xl border border-transparent group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
               >
                  <Eye size={16} /> View Composite Job Card
               </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
             <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-200" />
             </div>
             <p className="text-secondary font-bold text-sm">No active jobs matching your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {printingJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrintingJob(null)} className="absolute inset-0 bg-primary/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl no-scrollbar">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                       <FileText size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-primary">Sanjayshree Composite Form</h3>
                       <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{printingJob.jcNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => window.print()} className="px-6 py-2.5 bg-accent-cyan text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent-cyan/20 transition-all flex items-center gap-2">
                      <Printer size={16} /> Submit & Print
                    </button>
                    <button onClick={() => setPrintingJob(null)} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-secondary"><X size={24} /></button>
                  </div>
               </div>
               <div className="p-12 bg-gray-50/50 flex justify-center pb-24">
                  <div className="max-w-[800px] w-full bg-white shadow-2xl p-0 ring-1 ring-black/5">
                    <JobCardPrintView job={printingJob as any} />
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
