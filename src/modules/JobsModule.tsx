import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Printer, Clock, CheckCircle, XCircle, Calculator, X, Calendar, User, FileText, Settings, Box, Package, ChevronDown, Check, Star, ArrowUpRight, MessageSquare } from 'lucide-react';

interface JobLog {
  action: 'Start' | 'Stop' | 'Pause' | 'Resume' | 'Cancel';
  timestamp: string;
  remarks?: string;
}

interface JobCard {
  id: string;
  jcNo: string;
  jcDate: string;
  customerID: string; 
  party: string;
  productType: 'Brochure' | 'Visiting Card' | 'Booklet' | 'Banner' | 'Label' | 'Other';
  bookTitle: string;
  size: string;
  quantity: number;
  colorType: 'B/W' | '2 Color' | '4 Color';
  paperType: string;
  gsm: number;
  printingType: 'Offset' | 'Digital' | 'Screen' | 'Flex' | 'Packaging';
  finishing: string[];
  status: 'Pending' | 'In Progress' | 'Paused' | 'Completed' | 'Delivered' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Normal';
  deadline: string;
  date: string;
  machine?: string;
  contractorName?: string;
  isOutsourced: boolean;
  paperSource?: 'Self Owned' | 'Party Provided';
  logs: JobLog[];
  isStarred?: boolean;
  // Production specific
  noOfForms?: number;
  noOfPages?: number;
  noOfColors?: number;
  reamWt?: number;
  // Imaging fields from reference
  currentStage?: string;
  uom?: string;
  totalPages?: number;
  forms?: number;
  inkConsumption?: string;
  bindingType?: string;
  cutting?: boolean;
  folding?: boolean;
  ups?: string;
  plateMaker?: string;
  otherFinishing?: string;
  printEdition?: 'New' | 'Re-print';
}

const mockJobs: JobCard[] = [
  { 
    id: '1',
    jcNo: 'SOP/JC/013',
    jcDate: '2024-03-24',
    customerID: 'C-001',
    party: 'Malhotra Publishing',
    productType: 'Booklet',
    bookTitle: 'GANITH Textbook Cover Cls 4',
    size: 'A4',
    quantity: 9200,
    colorType: '4 Color',
    paperType: 'BILT Art Card',
    gsm: 220,
    printingType: 'Offset',
    finishing: ['Lamination', 'Perfect Binding'],
    status: 'In Progress',
    priority: 'High',
    deadline: '2024-03-30',
    date: '2024-03-24',
    machine: 'Heidelberg 102 4Clr',
    isOutsourced: false,
    logs: []
  }
];

export default function JobsModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'Identity' | 'Specs' | 'Process'>('Identity');
  const [newJobData, setNewJobData] = useState<Partial<JobCard>>({
    jcDate: new Date().toISOString().split('T')[0],
    deadline: '',
    priority: 'Normal',
    productType: 'Booklet',
    colorType: '4 Color',
    printingType: 'Offset',
    quantity: 0,
    paperType: 'Art Card',
    gsm: 220,
    finishing: [],
    machine: '',
    contractorName: '',
    party: '',
    bookTitle: '',
    size: '',
    isOutsourced: false,
    paperSource: 'Self Owned',
    noOfForms: 1,
    noOfPages: 64,
    noOfColors: 4,
    reamWt: 10.5,
    currentStage: 'Design',
    uom: 'Sheets',
    totalPages: 64,
    forms: 8,
    inkConsumption: '0.000 kg',
    bindingType: 'None',
    cutting: false,
    folding: false,
    ups: '1/4',
    plateMaker: 'Global',
    otherFinishing: '',
    printEdition: 'New'
  });
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [numColumns, setNumColumns] = useState(3);
  const [numRows, setNumRows] = useState(10);
  const [jobs, setJobs] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem('printing_pms_jobs');
    return saved ? JSON.parse(saved) : mockJobs;
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('All Parties');
  const tabs = ['All', 'Pending', 'In Progress', 'Paused', 'Completed', 'Delivered', 'Cancelled'];

  const parties = ['All Parties', ...Array.from(new Set(jobs.map(j => j.party)))];

  const toggleStar = (id: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, isStarred: !j.isStarred } : j));
  };

  const [estimationData, setEstimationData] = useState({
    qty: 1000,
    forms: 1,
    wastage: 5,
    reamWt: 10.5,
    colors: 4,
    pricePerUnit: 0, // Requirement: Admin can fix price
    paperPricePerKg: 0,
    platePrice: 0
  });

  const calculateEstimation = () => {
    const { qty, forms, wastage, reamWt, colors, pricePerUnit, paperPricePerKg, platePrice } = estimationData;
    const reamsBase = (qty * forms) / 500;
    const totalReams = reamsBase + (reamsBase * (wastage / 100));
    const totalKg = totalReams * reamWt;
    let plates = Math.ceil(forms * colors * 2);
    if (plates % 2 !== 0) plates += 1;
    
    const paperCost = totalKg * paperPricePerKg;
    const plateCost = plates * platePrice;
    const processingCost = qty * pricePerUnit;
    const totalCost = paperCost + plateCost + processingCost;

    return { 
      totalReams: totalReams.toFixed(2), 
      totalKg: totalKg.toFixed(2), 
      plates,
      totalCost: totalCost.toFixed(2),
      breakdown: { paperCost, plateCost, processingCost }
    };
  };

  const est = calculateEstimation();

  const handleWhatsAppShare = (job: Partial<JobCard>) => {
    const text = `*NEW JOB ORDER: ${job.jcNo || 'PENDING'}*
--------------------------------
*Party:* ${job.party}
*Title:* ${job.bookTitle}
*Product:* ${job.productType}
*Qty:* ${job.quantity?.toLocaleString()}
*Machine:* ${job.machine}
*Deadline:* ${job.deadline}
--------------------------------
_Generated via SOP Cloud PMS_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAuthorizeEstimate = () => {
    alert(`Estimate for ₹${Number(est.totalCost).toLocaleString()} has been AUTHORIZED.\nSending to party for approval via Email/WhatsApp.`);
    setIsEstimateModalOpen(false);
  };

  const handleDownloadQuote = () => {
    const quoteData = `
SANJAYSHREE OFFSET PRINTERS - ESTIMATE
Party: ${estimationData.party || 'Valued Customer'}
Date: ${new Date().toLocaleDateString()}

ESTIMATION DETAILS:
- Print Quantity: ${estimationData.qty}
- Forms: ${estimationData.forms}
- Total Weight: ${est.totalKg} Kg
- Plates: ${est.plates} Nos

COMMERCIALS:
- Paper Cost: ₹${est.breakdown.paperCost.toLocaleString()}
- Plate Cost: ₹${est.breakdown.plateCost.toLocaleString()}
- Processing: ₹${est.breakdown.processingCost.toLocaleString()}
------------------------------------------
TOTAL ESTIMATED COST: ₹${Number(est.totalCost).toLocaleString()}
------------------------------------------
* This is a computer generated estimate.
    `;
    const blob = new Blob([quoteData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Estimate_${Date.now()}.txt`;
    link.click();
    alert('Quote Downloaded successfully as Text/PDF preview.');
  };

  const handleJobAction = (jobId: string, action: JobLog['action']) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newStatusMap: Record<string, JobCard['status']> = {
          'Start': 'In Progress',
          'Stop': 'Completed',
          'Pause': 'Paused',
          'Resume': 'In Progress',
          'Cancel': 'Cancelled'
        };
        return {
          ...job,
          status: newStatusMap[action] || job.status,
          logs: [...job.logs, { action, timestamp: new Date().toISOString() }]
        };
      }
      return job;
    }));
  };

  const [isAddingNewParty, setIsAddingNewParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'party' && value === 'NEW_PARTY') {
      setIsAddingNewParty(true);
      return;
    }

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'finishing') {
        const currentFinishing = newJobData.finishing || [];
        if (checkbox.checked) {
          setNewJobData(prev => ({ ...prev, finishing: [...currentFinishing, value] }));
        } else {
          setNewJobData(prev => ({ ...prev, finishing: currentFinishing.filter(f => f !== value) }));
        }
      } else {
        setNewJobData(prev => ({ ...prev, [name]: checkbox.checked }));
      }
    } else {
      setNewJobData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate Job Card Number
    const nextId = jobs.length + 1;
    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const generatedJcNo = `SOP/JC/${yearSuffix}/${String(nextId).padStart(3, '0')}`;

    const paperName = newJobData.paperType;
    const qty = Number(newJobData.quantity) || 0;
    const gsm = Number(newJobData.gsm) || 0;

    // --- REQUIREMENT: Auto Check Inventory ---
    const inventory: any[] = JSON.parse(localStorage.getItem('printing_pms_inventory') || '[]');
    const paperInStock = inventory.find(i => 
      i.category === 'Paper' && 
      (i.name?.toLowerCase() || '').includes(paperName?.toLowerCase() || '') && 
      i.paperDetails?.gsm === gsm
    );
    
    if (paperInStock) {
      const neededSheets = qty * 1.05; // 5% wastage
      if (paperInStock.currentStock < neededSheets) {
        if (!confirm(`ALERT: Insufficient Paper Stock!\nSelected: ${paperInStock.name}\nRequired: ~${neededSheets.toFixed(0)} Sheets\nAvailable: ${paperInStock.currentStock} Sheets\n\nDo you want to proceed with a STAINED / PENDING status?`)) {
          return;
        }
      } else {
        alert(`SUCCESS: Inventory Verified. Sufficient stock for ${paperInStock.name} is available.`);
      }
    }

    const newJob: JobCard = {
      ...newJobData as JobCard,
      id: String(nextId),
      jcNo: generatedJcNo,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      logs: []
    };
    
    setJobs([newJob, ...jobs]);
    setIsModalOpen(false);
    // Reset form
    setNewJobData({
      jcDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Normal',
      productType: 'Booklet',
      colorType: '4 Color',
      printingType: 'Offset',
      quantity: 1000,
      paperType: 'BILT Art Card',
      gsm: 220,
      finishing: [],
      machine: 'Heidelberg 102 4Clr',
      contractorName: 'In-House',
      party: '',
      bookTitle: '',
      size: 'A4',
      isOutsourced: false,
      paperSource: 'Self Owned',
      noOfForms: 1,
      noOfPages: 16,
      noOfColors: 4,
      reamWt: 10.5
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={14} className="text-success" />;
      case 'Delivered': return <Box size={14} className="text-accent-magenta" />;
      case 'Pending': return <Clock size={14} className="text-warning" />;
      case 'In Progress': return <Printer size={14} className="text-accent-cyan" />;
      case 'Cancelled': return <XCircle size={14} className="text-danger" />;
      default: return null;
    }
  };

  const partiesData = Array.from(new Set(jobs.map(j => j.party)));
  const machinesData = Array.from(new Set(jobs.map(j => j.machine).filter(Boolean)));
  const contractorsData = Array.from(new Set(jobs.map(j => j.contractorName).filter(Boolean)));
  const titlesData = Array.from(new Set(jobs.map(j => j.bookTitle)));

  return (
    <div className="space-y-6 pb-20">
      <datalist id="customer-list">
        {partiesData.map(p => <option key={p} value={p} />)}
      </datalist>
      <datalist id="machine-list">
        {machinesData.map(m => <option key={m} value={m} />)}
      </datalist>
      <datalist id="contractor-list">
        {contractorsData.map(c => <option key={c} value={c} />)}
      </datalist>
      <datalist id="title-list">
        {titlesData.map(t => <option key={t} value={t} />)}
      </datalist>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Production Control</h2>
          <p className="text-secondary text-sm">Manage shop-floor work orders, machine schedules, and job status.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEstimateModalOpen(true)}
            className="bg-white border border-gray-200 text-slate-600 px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Calculator size={18} /> Estimation Engine
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[12px] tracking-[0.1em] flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
          >
            <Plus size={20} /> Create New Job Order
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-secondary hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search JC No, Title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
             <select 
               value={selectedParty}
               onChange={(e) => setSelectedParty(e.target.value)}
               className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary appearance-none outline-none focus:border-primary transition-all cursor-pointer"
             >
                {parties.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.filter(j => {
          const matchesTab = activeTab === 'All' || j.status === activeTab;
          const matchesSearch = (j.bookTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                               (j.jcNo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
          const matchesParty = selectedParty === 'All Parties' || j.party === selectedParty;
          return matchesTab && matchesSearch && matchesParty;
        }).map((job) => (
          <motion.div
            layout
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-accent-cyan/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleStar(job.id); }} className="transition-all transform active:scale-125">
                     <Star size={14} className={job.isStarred ? 'text-accent-amber fill-accent-amber' : 'text-gray-200'} />
                  </button>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{job.jcNo}</p>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    job.priority === 'High' ? 'bg-danger text-white shadow-sm' : 
                    job.priority === 'Medium' ? 'bg-accent-amber text-white' : 'bg-gray-200 text-secondary'
                  }`}>
                    {job.priority}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-accent-cyan transition-colors">{job.bookTitle}</h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-accent-cyan/10 transition-colors">
                {getStatusIcon(job.status)}
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Customer:</span>
                <span className="font-bold text-primary">{job.party}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Product:</span>
                <span className="font-bold text-primary">{job.productType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Quantity:</span>
                <span className="font-bold text-primary">{job.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Contractor:</span>
                <span className="font-bold text-accent-magenta">{job.contractorName || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Deadline:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  new Date(job.deadline) < new Date() ? 'text-danger' : 'text-primary'
                }`}>
                  <Clock size={12} /> {job.deadline}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <button 
                onClick={() => handleJobAction(job.id, 'Start')}
                disabled={job.status === 'In Progress'}
                className="p-2 bg-success/10 text-success rounded shadow-sm hover:bg-success hover:text-white transition-all disabled:opacity-30 flex flex-col items-center gap-1"
              >
                <div className="text-[8px] font-black uppercase">Start</div>
              </button>
              <button 
                onClick={() => handleJobAction(job.id, 'Pause')}
                disabled={job.status === 'Paused' || job.status === 'Pending'}
                className="p-2 bg-accent-amber/10 text-accent-amber rounded shadow-sm hover:bg-accent-amber hover:text-white transition-all disabled:opacity-30 flex flex-col items-center gap-1"
              >
                <div className="text-[8px] font-black uppercase">Pause</div>
              </button>
              <button 
                onClick={() => handleJobAction(job.id, 'Stop')}
                disabled={job.status === 'Completed' || job.status === 'Delivered'}
                className="p-2 bg-primary/10 text-primary rounded shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-30 flex flex-col items-center gap-1"
              >
                <div className="text-[8px] font-black uppercase">Stop</div>
              </button>
              <button 
                onClick={() => handleJobAction(job.id, 'Cancel')}
                disabled={job.status === 'Cancelled'}
                className="p-2 bg-danger/10 text-danger rounded shadow-sm hover:bg-danger hover:text-white transition-all disabled:opacity-30 flex flex-col items-center gap-1"
              >
                <div className="text-[8px] font-black uppercase">Cancel</div>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold px-2 py-1 bg-gray-50 text-secondary rounded">{job.printingType}</span>
                <span className="text-xs font-bold px-2 py-1 bg-accent-cyan/10 text-accent-cyan rounded">{job.colorType}</span>
              </div>
              <p className="text-xs text-secondary font-medium">{job.date}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Job Card Modal - REDESIGNED SPLIT VIEW */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-gray-100 font-sans"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-10 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-primary">Create Job Order</h2>
                    <p className="text-secondary text-xs mt-1">Fill in the details below to generate a new Job Card</p>
                  </div>
                  
                  {/* Stepper Header */}
                  <div className="flex items-center gap-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 -translate-y-1/2 z-0"></div>
                    {[
                      { id: 'Identity', label: 'Job Details', step: 1 },
                      { id: 'Specs', label: 'Specifications', step: 2 },
                      { id: 'Process', label: 'Review & Confirm', step: 3 }
                    ].map((s) => (
                      <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            modalTab === s.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-gray-100 text-secondary'
                          }`}
                        >
                          {s.step}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${modalTab === s.id ? 'text-primary' : 'text-secondary/40'}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right border-l border-gray-100 pl-8">
                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">J.C. NO.</p>
                    <p className="text-[12px] font-black text-accent-cyan uppercase">AUTO-GEN</p>
                    <div className="mt-2 space-y-1 text-[10px] font-bold">
                       <div className="flex justify-between gap-4">
                         <span className="text-secondary/40 uppercase">Date</span>
                         <span className="text-primary italic">10-05-2026 <Calendar size={10} className="inline ml-1 opacity-40" /></span>
                       </div>
                       <div className="flex justify-between gap-4">
                         <span className="text-danger uppercase">Deadline</span>
                         <span className="text-danger italic">dd-mm-yyyy <Calendar size={10} className="inline ml-1 opacity-40" /></span>
                       </div>
                    </div>
                  </div>
                </div>

                <form id="job-card-form" onSubmit={handleCreateJob} className="space-y-8">
                  {modalTab === 'Identity' ? (
                    <>
                      <section className="space-y-6">
                        <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-xl mb-4">
                           <div className="flex items-center gap-4">
                             <div className="bg-primary text-white px-3 py-1 rounded-md text-[10px] font-black uppercase">Step 1</div>
                             <h4 className="text-[12px] font-black uppercase tracking-widest text-primary">Job Details</h4>
                           </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6 items-end">
                          {/* Priority */}
                          <div className="col-span-6 space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Priority</label>
                            <div className="flex gap-6">
                              {['Normal', 'Medium', 'High'].map(p => (
                                <label key={p} className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="radio" 
                                    name="priority" 
                                    value={p} 
                                    checked={newJobData.priority === p}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 accent-primary" 
                                  />
                                  <span className="text-[11px] font-bold text-primary group-hover:text-accent-cyan">{p}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          {/* Current Stage */}
                          <div className="col-span-6 space-y-2">
                             <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-accent-cyan tracking-widest">Current Stage:</label>
                               <div className="relative flex-1 ml-4">
                                  <select 
                                    name="currentStage" 
                                    value={newJobData.currentStage}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-100 px-4 py-2 rounded-lg font-bold text-xs outline-none focus:border-accent-cyan appearance-none"
                                  >
                                    {['Design', 'Platemaking', 'Printing', 'Finishing', 'Ready'].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                           {/* Contractor */}
                           <div className="col-span-5 space-y-2 text-danger">
                              <label className="text-[10px] font-black uppercase tracking-widest">Contractor</label>
                              <div className="relative">
                                <select 
                                  name="contractorName" 
                                  value={newJobData.contractorName}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg font-bold text-xs outline-none appearance-none"
                                >
                                  <option value="">Select Contractor...</option>
                                  {contractorsData.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                              </div>
                           </div>

                           {/* Outsource Checkbox */}
                           <div className="col-span-7 flex items-center justify-end">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  name="isOutsourced" 
                                  checked={newJobData.isOutsourced}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 accent-primary" 
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Outsource Whole Order?</span>
                              </label>
                           </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                           {/* Machine */}
                           <div className="col-span-5 space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Machine</label>
                             <div className="relative">
                                <select 
                                  name="machine" 
                                  value={newJobData.machine}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg font-bold text-xs outline-none appearance-none"
                                >
                                  <option value="">Select Machine...</option>
                                  {machinesData.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                             </div>
                           </div>
                           
                           {/* Party */}
                           <div className="col-span-7 space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Party</label>
                             <div className="relative text-accent-cyan">
                                <select 
                                  name="party" 
                                  value={newJobData.party}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg font-bold text-xs outline-none appearance-none"
                                >
                                  <option value="">Select Party / Customer...</option>
                                  {partiesData.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                           <div className="col-span-8 space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest text-primary">Book / Title</label>
                             <input 
                               name="bookTitle" 
                               value={newJobData.bookTitle}
                               onChange={handleInputChange}
                               className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg font-bold text-xs outline-none focus:border-accent-cyan"
                               placeholder="Enter Book Title or Product Name"
                             />
                           </div>
                           <div className="col-span-4 space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Product</label>
                             <div className="relative">
                                <select 
                                  name="productType" 
                                  value={newJobData.productType}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg font-bold text-xs outline-none appearance-none"
                                >
                                  {['Booklet', 'Brochure', 'V.Card', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-10 gap-4">
                           <div className="col-span-2 space-y-2 text-danger">
                             <label className="text-[10px] font-black uppercase tracking-widest">Quantity</label>
                             <div className="flex flex-col items-center">
                               <input type="number" name="quantity" value={newJobData.quantity} onChange={handleInputChange} className="w-full bg-white border-none text-2xl font-black text-center focus:outline-none" />
                               <div className="w-full h-px bg-gray-100"></div>
                             </div>
                           </div>
                           <div className="col-span-2 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest">UOM</label>
                             <div className="relative">
                               <select name="uom" value={newJobData.uom} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-lg py-2 pl-3 pr-8 text-xs font-black appearance-none">
                                 <option>Sheets</option>
                                 <option>Copies</option>
                               </select>
                               <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                             </div>
                           </div>
                           <div className="col-span-2 space-y-2 text-accent-cyan">
                             <label className="text-[10px] font-black uppercase tracking-widest">Total Pages</label>
                             <div className="flex flex-col items-center">
                               <input type="number" name="totalPages" value={newJobData.totalPages} onChange={handleInputChange} className="w-full bg-white border-none text-2xl font-black text-center focus:outline-none" />
                               <div className="w-full h-px bg-gray-100"></div>
                             </div>
                           </div>
                           <div className="col-span-2 space-y-2 text-accent-magenta">
                             <label className="text-[10px] font-black uppercase tracking-widest">Forms</label>
                             <div className="flex flex-col items-center">
                               <input type="number" name="forms" value={newJobData.forms} onChange={handleInputChange} className="w-full bg-white border-none text-2xl font-black text-center focus:outline-none" />
                               <div className="w-full h-px bg-gray-100"></div>
                             </div>
                           </div>
                           <div className="col-span-2 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest">Color Type</label>
                             <div className="relative">
                               <select name="colorType" value={newJobData.colorType} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-lg py-2 pl-3 pr-8 text-xs font-black appearance-none">
                                 <option>4 Color (CMYK)</option>
                                 <option>2 Color</option>
                                 <option>B/W</option>
                               </select>
                               <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Start Date:</label>
                             <input type="date" className="w-full bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Time:</label>
                             <input type="time" className="w-full bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold" />
                           </div>
                           <div className="space-y-2 border-l border-gray-100 pl-4">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">End Date:</label>
                             <input type="date" className="w-full bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Time:</label>
                             <input type="time" className="w-full bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold" />
                           </div>
                        </div>

                        <div className="pt-4">
                          <button 
                            type="button"
                            onClick={() => setModalTab('Specs')}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            Next: Specifications
                          </button>
                        </div>
                      </section>
                    </>
                  ) : modalTab === 'Specs' ? (
                    <>
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex bg-blue-50/50 p-2 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary text-white px-3 py-1 rounded-md text-[10px] font-black uppercase">Step 2</div>
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-primary">Specifications</h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         {/* Material Specifications */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                               <Box size={14} className="text-secondary" />
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Material Specifications</h5>
                            </div>
                            <div className="bg-gray-50/30 p-4 rounded-xl border border-gray-100 space-y-4">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Paper Type</label>
                                     <div className="relative">
                                       <select name="paperType" value={newJobData.paperType} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg font-bold text-[10px] appearance-none">
                                         <option>Art Card</option>
                                         <option>Art Paper</option>
                                         <option>Maplitho</option>
                                       </select>
                                       <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black uppercase text-secondary tracking-widest">GSM</label>
                                     <input type="number" name="gsm" value={newJobData.gsm} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg font-bold text-[10px]" />
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black uppercase text-accent-magenta tracking-widest">Plate Required:</label>
                                     <input type="number" name="noOfColors" value={newJobData.noOfColors} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg font-black text-xs text-accent-magenta" />
                                  </div>
                                  <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                       <label className="text-[8px] font-black uppercase text-accent-cyan tracking-widest">Ink Consumption</label>
                                       <button type="button" className="text-[8px] font-black text-accent-cyan uppercase underline">Admin Calc</button>
                                     </div>
                                     <div className="flex items-center bg-white border border-gray-100 px-3 py-2 rounded-lg">
                                       <input type="text" name="inkConsumption" value={newJobData.inkConsumption} onChange={handleInputChange} className="w-full font-black text-xs text-primary outline-none" />
                                       <Calculator size={12} className="text-secondary/40" />
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Finishing Details */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                               <Star size={14} className="text-secondary" />
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Finishing Details</h5>
                            </div>
                            <div className="bg-gray-50/30 p-4 rounded-xl border border-gray-100 space-y-4">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Lamination</label>
                                     <div className="relative">
                                       <select name="otherFinishing" value={newJobData.otherFinishing} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg font-bold text-[10px] appearance-none">
                                         <option>None</option>
                                         <option>Gloss</option>
                                         <option>Matt</option>
                                       </select>
                                       <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Binding Type</label>
                                     <div className="relative">
                                       <select name="bindingType" value={newJobData.bindingType} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg font-bold text-[10px] appearance-none">
                                         <option>None</option>
                                         <option>Perfect</option>
                                         <option>Center Stitch</option>
                                       </select>
                                       <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                                     </div>
                                  </div>
                               </div>
                               <div className="flex gap-6 items-center">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="cutting" checked={newJobData.cutting} onChange={handleInputChange} className="w-3 h-3 accent-primary" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary">Cutting</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="folding" checked={newJobData.folding} onChange={handleInputChange} className="w-3 h-3 accent-primary" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary">Folding</span>
                                  </label>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Other Finishing <span className="text-[7px] text-secondary/40 font-normal tracking-normal lowercase">(e.g. Creasing, Perforation)</span></label>
                                  <input type="text" name="finishing_other" className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg text-[10px] placeholder:text-gray-300" placeholder="Enter other finishing details..." />
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-12 gap-8">
                         {/* Print Edition */}
                         <div className="col-span-3 space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                               <Printer size={14} className="text-secondary" />
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Print Edition</h5>
                            </div>
                            <div className="flex gap-6 pt-2">
                              {['NEW', 'RE-PRINT'].map(e => (
                                <label key={e} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="printEdition" 
                                    value={e === 'NEW' ? 'New' : 'Re-print'} 
                                    checked={newJobData.printEdition === (e === 'NEW' ? 'New' : 'Re-print')}
                                    onChange={handleInputChange}
                                    className="w-3 h-3 accent-primary" 
                                  />
                                  <span className="text-[9px] font-black uppercase text-secondary">{e}</span>
                                </label>
                              ))}
                            </div>
                         </div>

                         {/* UPS */}
                         <div className="col-span-1 space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">UPS</h5>
                            </div>
                            <input type="text" name="ups" value={newJobData.ups} onChange={handleInputChange} className="w-full bg-white border border-gray-100 px-2 py-3 rounded-lg text-center font-black text-xs outline-none" />
                         </div>

                         {/* Plate Details */}
                         <div className="col-span-8 space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                               <Settings size={14} className="text-secondary" />
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Plate Details</h5>
                            </div>
                            <div className="grid grid-cols-5 gap-4">
                               <div className="col-span-2 space-y-2">
                                  <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Plate Type</label>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                     {['CTP', 'P/S', 'D/E', 'BAKED'].map(t => (
                                       <label key={t} className="flex items-center gap-2 cursor-pointer">
                                         <input type="checkbox" defaultChecked={t === 'CTP'} className="w-3 h-3 accent-primary" />
                                         <span className="text-[8px] font-black uppercase text-secondary">{t}</span>
                                       </label>
                                     ))}
                                  </div>
                               </div>
                               <div className="col-span-1 space-y-1">
                                  <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Plate Required</label>
                                  <div className="flex flex-col gap-1">
                                    <input type="number" defaultValue={4} className="bg-white border rounded-lg p-1 text-[10px] font-black text-center" />
                                    <div className="flex justify-between px-1">
                                      <div className="text-[7px] text-secondary/40 font-black">OLD:<br/>-</div>
                                      <div className="text-[7px] text-secondary/40 font-black text-right">NEW:<br/>4</div>
                                    </div>
                                  </div>
                               </div>
                               <div className="col-span-1 space-y-1">
                                  <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Plate Used:</label>
                                  <input type="text" disabled className="w-full bg-gray-50 border rounded-lg p-3" />
                               </div>
                               <div className="col-span-1 space-y-1">
                                  <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Plate Maker:</label>
                                  <span className="text-[10px] font-black text-primary block py-2">{newJobData.plateMaker}</span>
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Box size={14} className="text-accent-cyan" />
                              <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Job Status</label>
                            </div>
                            <div className="relative">
                               <select className="w-full bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg font-bold text-[10px] appearance-none text-accent-cyan">
                                 <option>Pending</option>
                                 <option>In Progress</option>
                               </select>
                               <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Star size={14} className="text-secondary" />
                              <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Approved By</label>
                            </div>
                            <input type="text" placeholder="Admin/Customer" className="w-full bg-white border border-gray-100 px-3 py-2 rounded-lg text-[10px] placeholder:text-gray-200" />
                         </div>
                         <div className="flex items-center pt-6 gap-2">
                            <input type="checkbox" className="w-3 h-3 accent-primary" />
                            <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Proof Approved?</label>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Est. Cost</label>
                            <p className="text-[10px] font-black text-secondary flex items-center gap-1">₹ <span className="text-gray-300">Auto/Manual</span></p>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase text-secondary tracking-widest">Actual Cost</label>
                            <p className="text-[10px] font-black text-secondary flex items-center gap-1">₹ <span className="text-gray-300">Post completion</span></p>
                         </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setModalTab('Identity')}
                          className="bg-gray-100 text-secondary px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >
                          Previous
                        </button>
                        <button 
                          type="button"
                          onClick={() => setModalTab('Process')}
                          className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                        >
                          Next: Review & Confirm
                        </button>
                      </div>
                    </div>
                  </>
                  ) : (
                    <>
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex bg-blue-50/50 p-2 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary text-white px-3 py-1 rounded-md text-[10px] font-black uppercase">Step 3</div>
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-primary">Review & Confirm - Forms Grid</h4>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <Box size={14} className="text-accent-cyan" />
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Forms Specification Grid</h5>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-4 text-[9px] font-bold">
                                  <span className="text-secondary/40">Total Slots: 30</span>
                                  <div className="flex items-center gap-2">
                                     <span className="uppercase">Cols:</span>
                                     <input type="number" defaultValue={3} className="w-10 bg-gray-50 border rounded-md p-1 text-center font-black" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="uppercase">Rows:</span>
                                     <input type="number" defaultValue={10} className="w-12 bg-gray-50 border rounded-md p-1 text-center font-black" />
                                  </div>
                               </div>
                               <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                                  <Printer size={10} /> Auto-Fill
                               </button>
                            </div>
                         </div>

                         <div className="grid grid-cols-3 gap-0 border border-gray-100 rounded-xl overflow-hidden divide-x divide-gray-100">
                           {[0, 10, 20].map(colIdx => (
                             <div key={colIdx} className="flex flex-col">
                               <div className="grid grid-cols-12 bg-gray-50/80 p-2 border-b border-gray-100">
                                 <div className="col-span-2 text-[8px] font-black uppercase text-secondary">SL.</div>
                                 <div className="col-span-6 text-[8px] font-black uppercase text-secondary text-center">Page To-From</div>
                                 <div className="col-span-4 text-[8px] font-black uppercase text-secondary text-right">Counter (Back)</div>
                               </div>
                               <div className="divide-y divide-gray-50">
                                 {Array.from({ length: 10 }).map((_, i) => (
                                   <div key={i} className="grid grid-cols-12 p-2 items-center text-[10px] font-bold">
                                     <div className="col-span-2 text-primary">{colIdx + i + 1}.</div>
                                     <div className="col-span-6 flex items-center justify-center gap-2">
                                        <span className="text-secondary/40 font-medium">From</span>
                                        <div className="w-8 border-b-2 border-gray-100"></div>
                                        <span className="text-secondary/40 font-medium">To</span>
                                        <div className="w-8 border-b-2 border-gray-100"></div>
                                     </div>
                                     <div className="col-span-4 text-right text-accent-magenta italic font-black">Rev/Bk</div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Star size={14} className="text-accent-cyan" />
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Remarks</h5>
                         </div>
                         <textarea 
                           className="w-full h-32 bg-white border border-gray-100 rounded-2xl p-6 text-xs font-bold outline-none focus:border-accent-cyan transition-all resize-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
                           placeholder="Enter special handling instructions here..."
                         />
                      </div>

                      <div className="flex gap-4 pt-8 border-t border-gray-100 items-stretch">
                        <button 
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-10 py-4 bg-white border border-gray-200 text-secondary rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          <XCircle size={18} /> Discard
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-[14px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                        >
                          <CheckCircle size={22} /> Confirm & Generate Job Card
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary/30 text-center font-bold uppercase tracking-[0.2em] mt-4">Authorized Personnel Only • Audit Log Active</p>
                    </div>
                  </>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEstimateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEstimateModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-100 font-sans flex flex-col"
            >
               <div className="p-8 border-b border-gray-100 flex justify-between items-start shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-primary uppercase italic">Paper & Plate Estimator</h3>
                    <p className="text-secondary text-[10px] font-bold tracking-widest uppercase mt-1">Automatic Web Offset Calculation Engine</p>
                  </div>
                  <button onClick={() => setIsEstimateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
               </div>
               
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase">Quantity of Books</label>
                        <input 
                          type="number" 
                          value={estimationData.qty}
                          onChange={(e) => setEstimationData({...estimationData, qty: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase">No. of Forms</label>
                        <input 
                          type="number" 
                          value={estimationData.forms}
                          onChange={(e) => setEstimationData({...estimationData, forms: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase">Fixed Price / Unit</label>
                        <input 
                          type="number" 
                          value={estimationData.pricePerUnit}
                          onChange={(e) => setEstimationData({...estimationData, pricePerUnit: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl font-black outline-none focus:ring-2 focus:ring-accent-cyan transition-all text-accent-cyan placeholder:text-accent-cyan/30" 
                          placeholder="Admin fixed price"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase text-accent-magenta">Paper Price / Kg</label>
                        <input 
                          type="number" 
                          value={estimationData.paperPricePerKg}
                          onChange={(e) => setEstimationData({...estimationData, paperPricePerKg: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-accent-magenta/5 border border-accent-magenta/20 rounded-xl font-black outline-none focus:ring-2 focus:ring-accent-magenta transition-all text-accent-magenta" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase">Plate Price (Each)</label>
                        <input 
                          type="number" 
                          value={estimationData.platePrice}
                          onChange={(e) => setEstimationData({...estimationData, platePrice: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase">Wastage %</label>
                        <input 
                          type="number" 
                          value={estimationData.wastage}
                          onChange={(e) => setEstimationData({...estimationData, wastage: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent-cyan transition-all" 
                        />
                     </div>
                  </div>

                  <div className="p-6 bg-primary rounded-3xl text-white space-y-4 shadow-xl shadow-primary/10">
                     <div className="flex justify-between items-center underline decoration-white/10 underline-offset-4 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Calculated Requirements</span>
                        <Calculator size={14} className="opacity-40" />
                     </div>
                     <div className="grid grid-cols-3 gap-2 py-4 border-b border-white/10">
                        <div className="text-center">
                           <p className="text-[8px] font-bold opacity-40 uppercase">Reams</p>
                           <p className="text-sm font-black text-accent-cyan">{est.totalReams}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] font-bold opacity-40 uppercase">Weight</p>
                           <p className="text-sm font-black">{est.totalKg}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] font-bold opacity-40 uppercase">Plates</p>
                           <p className="text-sm font-black">{est.plates}</p>
                        </div>
                     </div>
                     <div className="pt-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold opacity-60 uppercase">Estimated Total Cost</span>
                           <span className="text-2xl font-black text-accent-cyan italic">₹{Number(est.totalCost).toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-white/30 text-right italic font-medium mt-1">Based on fixed pricing configuration</p>
                     </div>
                     <div className="flex justify-between items-center pt-4 border-t border-white/10 px-1">
                        <span className="text-[10px] font-bold opacity-60">PLATES REQUIRED</span>
                        <div className="text-right">
                           <span className="text-xl font-black text-accent-magenta">{est.plates}</span>
                           <p className="text-[8px] opacity-40 italic">Always Even (Rounded Up)</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-gray-100 bg-white flex gap-4 shrink-0">
                  <button onClick={() => setIsEstimateModalOpen(false)} className="flex-1 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-gray-100 transition-all font-sans">Return to Job Card</button>
                  <button onClick={handleAuthorizeEstimate} className="flex-1 py-4 bg-success text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-success/90 transition-all shadow-lg shadow-success/20">Authorize Estimate</button>
                  <button onClick={handleDownloadQuote} className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-cyan transition-all shadow-lg shadow-primary/20">Download Quote</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <datalist id="contractor-list">
        <option value="Bindwell Solution" />
        <option value="Apex Binding" />
        <option value="City Graphics" />
        <option value="Metro Printers" />
      </datalist>

      <datalist id="machine-list">
        <option value="Heidelberg 102 4Clr" />
        <option value="Komori 432" />
        <option value="Mitsubishi Diamond" />
        <option value="Ryobi 924" />
        <option value="Dominant 725" />
      </datalist>

      <datalist id="customer-list">
        <option value="Malhotra Publishing" />
        <option value="Sharma Creative" />
        <option value="Reliable Corp" />
        <option value="Global Education" />
      </datalist>

      <datalist id="title-list">
        <option value="GANITH Textbook Cover Cls 4" />
        <option value="Science Today Magazine" />
        <option value="Annual Report 2024" />
        <option value="Corporate Brochure" />
      </datalist>
    </div>
  );
}
