import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Printer, Clock, CheckCircle, XCircle, Calculator, X, Calendar, User, FileText, Star, ChevronDown, Box, Check, Settings, ChevronRight, Truck } from 'lucide-react';
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
  date: string;
  isStarred?: boolean;
  // Tech Specs
  paperType?: string;
  gsm?: number;
  colorType?: string;
  printingType?: string;
  finishing?: string[];
  machine?: string;
  contractorName?: string;
  outsourceOnly?: boolean;
  jobType?: string;
  printEdition?: 'NEW' | 'RE-PRINT';
  ups?: string;
  plateType?: string[];
  plateUsed?: number;
  plateMaker?: string;
  plateRequired?: number;
  oldPlate?: string;
  newPlate?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  formsDescription?: { slNo: number; pageFrom: string; pageTo: string; counter: string }[];
  formsRows?: number;
  formsCols?: number;
  remarks?: string;
  noOfForms?: number;
  noOfPages?: number;
  noOfColors?: number;
  reamWt?: number;
  productionStep?: 'Design' | 'Proof Approval' | 'Plate Making' | 'Printing' | 'Cutting' | 'Binding' | 'Lamination' | 'Packing' | 'Dispatch';
  
  // New Specification Fields
  inkConsumption?: string;
  folding?: boolean;
  otherFinishing?: string;
  estimatedCost?: number;
  actualCost?: number;
  proofApproved?: boolean;
  approvedBy?: string;
  lamination?: string;
  binding?: string;
  cutting?: boolean;
  uom?: string;
  batchNo?: string;
}

const PRODUCTION_STAGES = [
  'Design', 'Proof Approval', 'Plate Making', 'Printing', 'Cutting', 'Binding', 'Lamination', 'Packing', 'Dispatch'
];

const PARTIES = [
  'Global Publications',
  'Oxford University Press',
  'Pearson India',
  'Cambridge University Press',
  'S. Chand & Co.',
  'Laxmi Publications',
  'Frank Brothers',
  'Ratna Sagar',
  'Viva Books',
  'Local Client',
  'Internal/Self'
];

const CONTRACTORS = [
  'Bindery Masters',
  'Perfect Color Lab',
  'Precision Cutting & Folding',
  'Quality Finishing House',
  'Super Lamination & Coat',
  'Express Die Cutting',
  'Manual Handwork Team',
  'In-House Team'
];

const MACHINES = [
  'Heidelberg Speedmaster 102 (4-Color)',
  'Heidelberg SM 74 (2-Color)',
  'Komori Lithrone G40',
  'Roland 700 HiPrint',
  'Ryobi 924 LED-UV',
  'Mitsubishi Diamond 3000',
  'KBA Rapida 105',
  'Digital Press (Konica Minolta)',
  'Digital Press (Ricoh Pro)',
  'In-House Offset (Single Color)',
  'External Sheet-fed Offset',
  'Web Offset Press'
];

// Admin Specifications for Ink Consumption Calculation
const INK_SPEC_CONFIG = {
  baseConsRate: 0.000035, // kg per impression per color (A4 equivalent area)
  colorMultipliers: {
    '4 Color (CMYK)': 4,
    '1 Color': 1.1, // Single color often heavier
    '2 Color': 2.1,
    '5 Color (Pantone)': 5.2,
  } as Record<string, number>,
  defaultAreaFactor: 1.0
};

export default function JobDetailsModule() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [jobs, setJobs] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem('printing_pms_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [printingJob, setPrintingJob] = useState<JobCard | null>(null);
  const [editingJob, setEditingJob] = useState<JobCard | null>(null);
  const [gridCols, setGridCols] = useState(3);
  const [gridRows, setGridRows] = useState(10);
  
  // Real-time calculation states
  const [calcQuantity, setCalcQuantity] = useState(0);
  const [calcColorType, setCalcColorType] = useState('4 Color (CMYK)');
  const [calcInk, setCalcInk] = useState('0.00');

  useEffect(() => {
    if (editingJob) {
      setGridCols(editingJob.formsCols || 3);
      setGridRows(editingJob.formsRows || 10);
      setCalcQuantity(editingJob.quantity || 0);
      setCalcColorType(editingJob.colorType || '4 Color (CMYK)');
      setCalcInk(editingJob.inkConsumption || '0.00');
    } else {
      setGridCols(3);
      setGridRows(10);
      setCalcQuantity(0);
      setCalcColorType('4 Color (CMYK)');
      setCalcInk('0.00');
    }
  }, [editingJob]);

  // Ink Calculation Logic
  useEffect(() => {
    const multiplier = INK_SPEC_CONFIG.colorMultipliers[calcColorType] || 1;
    const estimated = (calcQuantity * INK_SPEC_CONFIG.baseConsRate * multiplier).toFixed(3);
    setCalcInk(`${estimated} kg`);
  }, [calcQuantity, calcColorType]);

  const handleAutoFill = (e: React.MouseEvent) => {
    e.preventDefault();
    const totalPages = Number((document.querySelector('input[name="noOfPages"]') as HTMLInputElement)?.value || 0);
    const forms = Number((document.querySelector('input[name="noOfForms"]') as HTMLInputElement)?.value || 0);
    
    if (totalPages <= 0 || forms <= 0) {
      alert("Please enter Total Pages and No. of Forms first.");
      return;
    }

    const pagesPerForm = Math.ceil(totalPages / forms);
    
    for (let i = 0; i < forms; i++) {
      const slNo = i + 1;
      const from = (i * pagesPerForm) + 1;
      const to = Math.min((i + 1) * pagesPerForm, totalPages);
      
      const fromInput = document.querySelector(`input[name="pageFrom_${slNo}"]`) as HTMLInputElement;
      const toInput = document.querySelector(`input[name="pageTo_${slNo}"]`) as HTMLInputElement;
      
      if (fromInput) fromInput.value = from.toString();
      if (toInput) toInput.value = to.toString();
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const jobData: any = {
      jcDate: formData.get('jcDate'),
      party: formData.get('party'),
      productType: formData.get('productType'),
      bookTitle: formData.get('bookTitle'),
      size: formData.get('size'),
      quantity: Number(formData.get('quantity')),
      priority: formData.get('priority'),
      deadline: formData.get('deadline'),
      paperType: formData.get('paperType'),
      gsm: Number(formData.get('gsm')),
      colorType: formData.get('colorType'),
      printingType: formData.get('printingType'),
      machine: formData.get('machine'),
      contractorName: formData.get('contractorName'),
      outsourceOnly: formData.get('outsourceOnly') === 'on',
      jobType: formData.get('jobType'),
      printEdition: formData.get('printEdition'),
      ups: formData.get('ups'),
      plateType: formData.getAll('plateType'),
      plateUsed: Number(formData.get('plateUsed')),
      plateRequired: Number(formData.get('plateRequired')),
      plateMaker: formData.get('plateMaker'),
      oldPlate: formData.get('oldPlate'),
      newPlate: formData.get('newPlate'),
      startDate: formData.get('startDate'),
      startTime: formData.get('startTime'),
      endDate: formData.get('endDate'),
      endTime: formData.get('endTime'),
      remarks: formData.get('remarks'),
      noOfColors: Number(formData.get('noOfColors')),
      noOfForms: Number(formData.get('noOfForms')),
      noOfPages: Number(formData.get('noOfPages')),
      reamWt: Number(formData.get('reamWt')),
      finishing: formData.getAll('finishing'),
      productionStep: formData.get('productionStep') || 'Design',
      status: formData.get('status') || (editingJob ? editingJob.status : 'Pending'),
      
      // New fields mapping
      inkConsumption: formData.get('inkConsumption'),
      folding: formData.get('folding') === 'on',
      otherFinishing: formData.get('otherFinishing'),
      estimatedCost: Number(formData.get('estimatedCost')),
      actualCost: Number(formData.get('actualCost')),
      proofApproved: formData.get('proofApproved') === 'on',
      approvedBy: formData.get('approvedBy'),
      lamination: formData.get('lamination'),
      binding: formData.get('binding'),
      cutting: formData.get('cutting') === 'on',
      uom: formData.get('uom'),
      batchNo: formData.get('batchNo'),
      formsCols: Number(formData.get('formsCols') || 3),
      formsRows: Number(formData.get('formsRows') || 10),
      
      date: editingJob ? editingJob.date : new Date().toISOString().split('T')[0],
      // Forms Description handling
      formsDescription: Array.from({ length: gridCols * gridRows }).map((_, i) => ({
        slNo: i + 1,
        pageFrom: formData.get(`pageFrom_${i + 1}`) as string,
        pageTo: formData.get(`pageTo_${i + 1}`) as string,
        counter: formData.get(`counter_${i + 1}`) as string,
      })).filter(f => f.pageFrom || f.pageTo || f.counter)
    };

    let updatedJobs;
    if (editingJob) {
      updatedJobs = jobs.map(j => j.id === editingJob.id ? { ...j, ...jobData } : j);
    } else {
      const nextId = jobs.length + 1;
      const yearSuffix = new Date().getFullYear().toString().slice(-2);
      const generatedJcNo = `SOP/JC/${yearSuffix}/${String(nextId).padStart(3, '0')}`;
      
      const newJob = {
        id: String(nextId),
        jcNo: generatedJcNo,
        ...jobData
      };
      updatedJobs = [newJob, ...jobs];
    }
    
    setJobs(updatedJobs);
    localStorage.setItem('printing_pms_jobs', JSON.stringify(updatedJobs));
    setView('list');
    setEditingJob(null);
  };

  const handleEdit = (job: JobCard) => {
    setEditingJob(job);
    setView('form');
  };

  const filteredJobs = jobs.filter(j => 
    j.jcNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 pb-20"
      >
        <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setView('list'); setEditingJob(null); }}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-secondary"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                {editingJob ? `Edit Job Order: ${editingJob.jcNo}` : 'Create New Job Order'}
              </h2>
              <p className="text-secondary text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-60">
                Job Configuration & Technical Specifications
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               type="button"
               onClick={() => { setView('list'); setEditingJob(null); }}
               className="px-6 py-3 text-secondary font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
             >
               Discard Changes
             </button>
          </div>
        </div>

        <form id="jobOrderForm" onSubmit={handleSaveJob} className="grid grid-cols-12 gap-8">
            {/* Form content exactly as it was, but without the fixed positioning wrappers */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest opacity-50">System Reference ID</p>
                   <h4 className="text-2xl font-black text-primary font-mono tracking-tighter">{editingJob?.jcNo || 'SOP/JC/2024/AUTO-GEN'}</h4>
                </div>
                <div className="flex gap-6">
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-secondary tracking-widest opacity-50">Order Date</p>
                      <input type="date" name="jcDate" defaultValue={editingJob?.jcDate || new Date().toISOString().split('T')[0]} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black font-mono outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-danger tracking-widest opacity-50">Target Deadline</p>
                      <input type="date" name="deadline" defaultValue={editingJob?.deadline} className="bg-danger/5 border border-danger/10 rounded-xl px-4 py-2.5 text-xs font-black font-mono text-danger outline-none focus:ring-2 focus:ring-danger transition-all" />
                   </div>
                </div>
              </div>

              {/* Customer & Product Info */}
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Identity & Classification</h4>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Customer / Agency Entity</label>
                       <select name="party" required defaultValue={editingJob?.party} className="w-full bg-gray-50 border border-gray-100 rounded-[20px] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all appearance-none cursor-pointer">
                          <option value="">Choose a customer...</option>
                          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Product Category</label>
                       <select name="productType" defaultValue={editingJob?.productType} className="w-full bg-gray-50 border border-gray-100 rounded-[20px] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all appearance-none cursor-pointer">
                         <option value="Booklet">Booklet</option>
                         <option value="Brochure">Brochure</option>
                         <option value="Label">Label</option>
                         <option value="Poster">Poster</option>
                         <option value="Box">Box / Packaging</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Job Title / Publication Name</label>
                    <input name="bookTitle" required defaultValue={editingJob?.bookTitle} placeholder="e.g. Annual Magazine 2024 Vol 2" className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-6 text-2xl font-black text-primary outline-none focus:ring-2 focus:ring-accent-cyan transition-all placeholder:text-gray-200" />
                 </div>
                 <div className="grid grid-cols-3 gap-8 pt-2">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Final Dimension</label>
                       <input name="size" defaultValue={editingJob?.size} placeholder="A4, 11x17, etc." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Print Batch Type</label>
                       <select name="printEdition" defaultValue={editingJob?.printEdition || 'NEW'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all">
                          <option value="NEW">New Print</option>
                          <option value="RE-PRINT">Reprint Order</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Plates UPS Arrangement</label>
                       <input name="ups" defaultValue={editingJob?.ups || '1/4'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                 </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-accent-magenta rounded-full" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Technical Specs</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Mode of Printing</label>
                       <select name="printingType" defaultValue={editingJob?.printingType} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all">
                          <option value="Offset Printing">Offset Printing</option>
                          <option value="Digital Printing">Digital Printing</option>
                          <option value="Screen Printing">Screen Printing</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Primary Material</label>
                       <select name="paperType" defaultValue={editingJob?.paperType} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all">
                          <option value="Art Card">Art Card</option>
                          <option value="Maplitho">Maplitho</option>
                          <option value="Gloss Mirror">Gloss Mirror</option>
                          <option value="Chromo Paper">Chromo Paper</option>
                          <option value="Texture Paper">Texture Paper</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Paper GSM / Weight</label>
                       <input name="gsm" type="number" defaultValue={editingJob?.gsm} placeholder="220" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                    </div>
                 </div>

                 <div className="grid grid-cols-4 gap-8 pt-2">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Order Volume</label>
                       <input name="quantity" type="number" required value={calcQuantity} onChange={(e) => setCalcQuantity(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Unit</label>
                       <select name="uom" defaultValue={editingJob?.uom || 'Sheets'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all">
                          <option value="Sheets">Sheets</option>
                          <option value="Copies">Copies</option>
                          <option value="Book">Book</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Total Page Count</label>
                       <input name="noOfPages" type="number" defaultValue={editingJob?.noOfPages} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Forms Assigned</label>
                       <input name="noOfForms" type="number" defaultValue={editingJob?.noOfForms} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-black text-accent-magenta outline-none focus:ring-2 focus:ring-accent-magenta transition-all text-center" />
                     </div>
                 </div>
              </div>

              {/* Forms Grid */}
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
                 <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-1.5 h-6 bg-accent-cyan rounded-full" />
                       <h4 className="text-sm font-black uppercase tracking-widest text-primary">Production Grid Mapping</h4>
                    </div>
                    <button type="button" onClick={handleAutoFill} className="group flex items-center gap-2 text-[10px] font-black uppercase bg-accent-cyan/10 text-accent-cyan px-6 py-3 rounded-2xl hover:bg-accent-cyan hover:text-white transition-all">
                       <Calculator size={14} className="group-hover:rotate-12 transition-transform" />
                       Intelligent Auto-Map
                    </button>
                 </div>
                 
                 <div className="border border-gray-100 rounded-[32px] overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                       <table className="w-full border-collapse">
                          <thead className="sticky top-0 bg-gray-50 z-10">
                             <tr className="text-secondary text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4 text-left w-16">SL</th>
                                <th className="px-6 py-4 text-left">Start Page</th>
                                <th className="px-6 py-4 text-left">End Page</th>
                                <th className="px-6 py-4 text-left">Back Counter Value</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50 bg-white">
                              {Array.from({ length: 30 }).map((_, i) => {
                                 const sl = i + 1;
                                 const data = editingJob?.formsDescription?.find(fd => fd.slNo === sl);
                                 return (
                                   <tr key={sl} className="hover:bg-accent-cyan/5 transition-colors">
                                      <td className="px-6 py-3.5 text-[10px] font-black text-secondary/30">{String(sl).padStart(2, '0')}</td>
                                      <td className="px-6 py-3.5">
                                         <input name={`pageFrom_${sl}`} defaultValue={data?.pageFrom} placeholder="---" className="w-full bg-transparent border-b border-transparent focus:border-accent-cyan text-sm font-bold py-1 outline-none transition-all placeholder:opacity-20" />
                                      </td>
                                      <td className="px-6 py-3.5">
                                         <input name={`pageTo_${sl}`} defaultValue={data?.pageTo} placeholder="---" className="w-full bg-transparent border-b border-transparent focus:border-accent-cyan text-sm font-bold py-1 outline-none transition-all placeholder:opacity-20" />
                                      </td>
                                      <td className="px-6 py-3.5">
                                         <input name={`counter_${sl}`} defaultValue={data?.counter} placeholder="0.00" className="w-full bg-transparent border-b border-transparent focus:border-accent-magenta text-sm font-black py-1 outline-none transition-all text-accent-magenta placeholder:opacity-20" />
                                      </td>
                                   </tr>
                                 );
                              })}
                           </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            </div>

            {/* Side Operations Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-primary p-10 rounded-[40px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-cyan relative z-10">Production Route</h4>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="space-y-2.5">
                         <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Workflow Urgency</label>
                         <div className="flex gap-3">
                            {['Normal', 'High'].map(p => (
                               <label key={p} className={`flex-1 flex items-center justify-center py-3.5 rounded-[18px] border cursor-pointer transition-all ${
                                  editingJob?.priority === p || (!editingJob && p === 'Normal') ? 'bg-white text-primary border-white shadow-lg shadow-white/10' : 'border-white/10 text-white/30 hover:border-white/30'
                               }`}>
                                  <input type="radio" name="priority" value={p} className="hidden" defaultChecked={editingJob?.priority === p || (!editingJob && p === 'Normal')} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                               </label>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-2.5">
                         <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Current Active Stage</label>
                         <select name="productionStep" defaultValue={editingJob?.productionStep || 'Design'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent-cyan appearance-none cursor-pointer">
                            {PRODUCTION_STAGES.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                         </select>
                      </div>

                      <div className="space-y-2.5">
                         <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Machine Allocation</label>
                         <select name="machine" defaultValue={editingJob?.machine} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent-cyan appearance-none cursor-pointer">
                            <option value="">Select Machine...</option>
                            {MACHINES.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                         </select>
                      </div>

                      <div className="space-y-2.5 border-t border-white/10 pt-6">
                         <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">External Contractor</label>
                         <select name="contractorName" defaultValue={editingJob?.contractorName} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent-cyan appearance-none cursor-pointer">
                            <option value="">Select Contractor...</option>
                            {CONTRACTORS.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                         </select>
                         <label className="flex items-center gap-3 mt-4 group cursor-pointer">
                            <div className="relative">
                               <input type="checkbox" name="outsourceOnly" defaultChecked={editingJob?.outsourceOnly} className="w-5 h-5 rounded-lg border-2 border-white/20 bg-transparent checked:bg-accent-cyan checked:border-accent-cyan transition-all appearance-none cursor-pointer" />
                               <Check size={12} className="absolute inset-0 m-auto text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">Complete Outsourcing</span>
                         </label>
                      </div>
                   </div>
               </div>

               <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Finishing Specs</h4>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-secondary/50 ml-1">Lamination</label>
                          <select name="lamination" defaultValue={editingJob?.lamination} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold appearance-none cursor-pointer">
                             <option value="None">None</option>
                             <option value="Gloss">Gloss</option>
                             <option value="Matte">Matte</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-secondary/50 ml-1">Binding</label>
                          <select name="binding" defaultValue={editingJob?.binding} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold appearance-none cursor-pointer">
                             <option value="None">None</option>
                             <option value="Perfect">Perfect</option>
                             <option value="Spiral">Spiral</option>
                          </select>
                       </div>
                   </div>
                   <div className="flex gap-4 pt-2">
                       <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-5 py-3 rounded-[20px] flex-1 border border-gray-100 hover:bg-primary hover:text-white transition-all group">
                          <input type="checkbox" name="cutting" defaultChecked={editingJob?.cutting} className="hidden" />
                          <div className="w-4 h-4 rounded border-2 border-gray-300 group-has-[:checked]:bg-accent-cyan group-has-[:checked]:border-accent-cyan transition-all" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Cutting</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-5 py-3 rounded-[20px] flex-1 border border-gray-100 hover:bg-primary hover:text-white transition-all group">
                          <input type="checkbox" name="folding" defaultChecked={editingJob?.folding} className="hidden" />
                          <div className="w-4 h-4 rounded border-2 border-gray-300 group-has-[:checked]:bg-accent-cyan group-has-[:checked]:border-accent-cyan transition-all" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Folding</span>
                       </label>
                   </div>
                   <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-black uppercase text-secondary/50 ml-1">Production Notes</label>
                      <textarea name="remarks" defaultValue={editingJob?.remarks} rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-accent-cyan resize-none placeholder:text-gray-300" placeholder="Special handling tags..."></textarea>
                   </div>
               </div>

               <div className="bg-gray-100 p-6 rounded-[40px] space-y-4">
                  <button type="submit" form="jobOrderForm" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-accent-cyan shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 group">
                     <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> 
                     {editingJob ? 'Commit Updates' : 'Launch Job Order'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setView('list'); setEditingJob(null); }} 
                    className="w-full py-4 text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:text-danger hover:bg-danger/5 rounded-2xl transition-all"
                  >
                    Abort Session
                  </button>
               </div>
            </div>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Create Job Order</h2>
          <p className="text-secondary text-sm font-medium">Capture customer orders and tech-specs in one session.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Quick search jobs..."
                className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-accent-cyan transition-all w-64 shadow-sm"
              />
           </div>
           <button 
             onClick={() => { setEditingJob(null); setView('form'); }}
             className="bg-primary hover:bg-accent-cyan text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 transition-all"
           >
             <Plus size={18} /> New Job Order
           </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">JC #</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Party & Book Title</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Specs</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Machine</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Quantity</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Deadline</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-accent-cyan/5 transition-colors group">
                  <td className="px-6 py-4 border-r border-gray-100">
                    <span className="text-secondary font-black text-[10px] block opacity-50 mb-1">{job.jcDate}</span>
                    <span className="text-sm font-black text-primary tracking-tight">{job.jcNo}</span>
                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                      job.priority === 'High' ? 'bg-danger/10 text-danger border border-danger/20' : 
                      job.priority === 'Medium' ? 'bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/20' : 
                      'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    }`}>
                      {job.priority || 'Normal'}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <p className="text-sm font-black text-primary truncate max-w-xs">{job.bookTitle}</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1 italic">{job.party}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-accent-magenta animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-accent-magenta tracking-widest">Stage: {job.productionStep || 'Design'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary/40 uppercase">Paper:</span>
                        <span className="text-[10px] font-bold text-secondary">{job.paperType || 'N/A'} - {job.gsm || 0}GSM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary/40 uppercase">Printing:</span>
                        <span className="text-[10px] font-bold text-secondary">{job.printingType} ({job.colorType})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <span className="text-xs font-bold text-primary">{job.machine || 'Pending'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100 font-mono font-black text-sm text-primary">
                    {job.quantity?.toLocaleString()}/-
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <span className="text-xs font-black text-danger/80">{job.deadline}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all"
                        title="Edit Data"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => setPrintingJob(job)}
                        className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Display Composite Card"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={48} className="text-gray-200" />
                    <p className="text-secondary font-bold text-sm">No unified entries found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {printingJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrintingJob(null)} className="absolute inset-0 bg-primary/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h3 className="font-bold text-primary flex items-center gap-2"><Printer size={20} /> Print Review: Sanjayshree Job Card</h3>
                  <div className="flex gap-3">
                    <button onClick={() => window.print()} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-accent-cyan transition-all flex items-center gap-2">
                       <Printer size={16} /> Print Now
                    </button>
                    <button onClick={() => setPrintingJob(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-all"><X size={20} /></button>
                  </div>
               </div>
               <div className="p-12 bg-gray-50 flex justify-center">
                  <div className="max-w-[750px] w-full bg-white shadow-lg p-0">
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
