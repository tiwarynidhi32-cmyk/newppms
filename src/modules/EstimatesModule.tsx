import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, FileText, ArrowRight, X, Calculator, 
  User, Clock, CheckCircle, MoreVertical, DollarSign, 
  Percent, Settings, Save, Trash2, List, ChevronDown, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CostBreakdown {
  paper: number;
  ink: number;
  plates: number;
  machine: number;
  labor: number;
  finishing: number;
  overheads: number;
  profitMargin: number; // percentage
}

interface PricingTier {
  quantity: number;
  unitCost: number; // Calculated
  fixedPrice: number; // Admin override
  total: number;
  isFixed: boolean;
}

interface Estimate {
  id: string;
  estimateNo: string;
  date: string;
  customer: string;
  bookTitle: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  validUntil: string;
  costs?: CostBreakdown;
  tiers: PricingTier[];
}

interface Template {
  id: string;
  name: string;
  costs: CostBreakdown;
}

const mockEstimates: Estimate[] = [
  { 
    id: '1', 
    estimateNo: 'EST/2024/001', 
    date: '2024-03-20', 
    customer: 'Malhotra Publishing', 
    bookTitle: 'GANITH Textbook Cover Cls 4', 
    amount: 45000, 
    status: 'Approved', 
    validUntil: '2024-04-20',
    costs: {
      paper: 12000,
      ink: 3000,
      plates: 2000,
      machine: 5000,
      labor: 4000,
      finishing: 3000,
      overheads: 2500,
      profitMargin: 25
    },
    tiers: [
      { quantity: 1000, unitCost: 36, fixedPrice: 45, total: 45000, isFixed: true }
    ]
  },
  { 
    id: '2', 
    estimateNo: 'EST/2024/002', 
    date: '2024-03-21', 
    customer: 'Sharma Creative', 
    bookTitle: 'Corporate Brochure - 5000 Qty', 
    amount: 15500, 
    status: 'Draft', 
    validUntil: '2024-04-21',
    costs: {
      paper: 5000,
      ink: 1000,
      plates: 1000,
      machine: 2000,
      labor: 2000,
      finishing: 1500,
      overheads: 1000,
      profitMargin: 20
    },
    tiers: [
      { quantity: 5000, unitCost: 2.7, fixedPrice: 3.1, total: 15500, isFixed: true }
    ]
  },
];

const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Standard 4-Color Booklet',
    costs: {
      paper: 5000,
      ink: 1500,
      plates: 800,
      machine: 2500,
      labor: 1500,
      finishing: 1000,
      overheads: 1000,
      profitMargin: 20
    }
  },
  {
    id: 't2',
    name: 'Single Color Manual',
    costs: {
      paper: 3000,
      ink: 500,
      plates: 400,
      machine: 1500,
      labor: 1000,
      finishing: 800,
      overheads: 500,
      profitMargin: 15
    }
  }
];

export default function EstimatesModule() {
  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    const saved = localStorage.getItem('printing_pms_estimates');
    return saved ? JSON.parse(saved) : mockEstimates;
  });

  const [templates] = useState<Template[]>(mockTemplates);

  useEffect(() => {
    localStorage.setItem('printing_pms_estimates', JSON.stringify(estimates));
  }, [estimates]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const navigate = useNavigate();

  // State for the Estimator Form
  const [currentEstimate, setCurrentEstimate] = useState<Partial<Estimate>>({
    costs: {
      paper: 0,
      ink: 0,
      plates: 0,
      machine: 0,
      labor: 0,
      finishing: 0,
      overheads: 0,
      profitMargin: 20
    }
  });

  const [totalCost, setTotalCost] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { quantity: 1000, unitCost: 0, fixedPrice: 0, total: 0, isFixed: false }
  ]);

  useEffect(() => {
    if (currentEstimate.costs) {
      const { paper, ink, plates, machine, labor, finishing, overheads, profitMargin } = currentEstimate.costs;
      const subtotal = Number(paper) + Number(ink) + Number(plates) + Number(machine) + Number(labor) + Number(finishing) + Number(overheads);
      setTotalCost(subtotal);

      // Distribute costs to tiers
      const updatedTiers = pricingTiers.map(tier => {
        const estimatedUnitCost = subtotal / tier.quantity;
        const marginMultiplier = (1 + Number(profitMargin) / 100);
        const suggestedPrice = estimatedUnitCost * marginMultiplier;
        
        const effectivePrice = tier.isFixed ? tier.fixedPrice : suggestedPrice;
        
        return {
          ...tier,
          unitCost: estimatedUnitCost,
          total: effectivePrice * tier.quantity
        };
      });
      
      setPricingTiers(updatedTiers);
      
      // Amount is usually the first or selected tier total
      if (updatedTiers.length > 0) {
        setFinalPrice(updatedTiers[0].total);
      }
    }
  }, [currentEstimate.costs, pricingTiers.length]); // Note: pricingTiers dependency for structural changes

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    const updated = [...pricingTiers];
    updated[index] = { ...updated[index], [field]: value };
    
    // If fixing price, set isFixed to true
    if (field === 'fixedPrice') {
       updated[index].isFixed = true;
    }
    
    // Recalculate total for this tier based on fixed vs unit cost
    if (currentEstimate.costs) {
      const subtotal = totalCost;
      const profitMargin = currentEstimate.costs.profitMargin;
      const estimatedUnitCost = subtotal / updated[index].quantity;
      const suggestedPrice = estimatedUnitCost * (1 + Number(profitMargin) / 100);
      
      updated[index].unitCost = estimatedUnitCost;
      updated[index].total = (updated[index].isFixed ? updated[index].fixedPrice : suggestedPrice) * updated[index].quantity;
    }

    setPricingTiers(updated);
  };

  const addTier = () => {
    setPricingTiers([...pricingTiers, { quantity: 5000, unitCost: 0, fixedPrice: 0, total: 0, isFixed: false }]);
  };

  const removeTier = (index: number) => {
    if (pricingTiers.length > 1) {
      setPricingTiers(pricingTiers.filter((_, i) => i !== index));
    }
  };

  const handleConvertToJob = (estimate: Estimate) => {
    const confirmed = window.confirm(`Convert ${estimate.estimateNo} to Work Order?`);
    if (confirmed) {
      setEstimates(estimates.map(e => e.id === estimate.id ? { ...e, status: 'Converted' } : e));
      alert("Quotation successfully converted to Work Order!");
      navigate('/jobs');
    }
  };

  const handleCostChange = (field: keyof CostBreakdown, value: string) => {
    setCurrentEstimate(prev => ({
      ...prev,
      costs: {
        ...prev.costs!,
        [field]: Number(value)
      }
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentEstimate(prev => ({
        ...prev,
        costs: template.costs
      }));
    }
  };

  const handleSaveEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const newEst: Estimate = {
      id: String(estimates.length + 1),
      estimateNo: `EST/2024/00${estimates.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      customer: (form.elements.namedItem('customer') as HTMLInputElement).value,
      bookTitle: (form.elements.namedItem('title') as HTMLInputElement).value,
      amount: finalPrice,
      status: 'Draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      costs: currentEstimate.costs as CostBreakdown,
      tiers: pricingTiers
    };
    setEstimates([newEst, ...estimates]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans">Quotations & Estimations</h2>
          <p className="text-secondary text-sm">Create and manage cost-accurate estimates with detailed component tracking.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentEstimate({
              costs: { paper: 0, ink: 0, plates: 0, machine: 0, labor: 0, finishing: 0, overheads: 0, profitMargin: 20 }
            });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-accent-cyan text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={20} /> Create New Estimate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search quotes, customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white text-secondary transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-secondary text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Quote No.</th>
                <th className="px-6 py-4">Title / Project</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-sans">
              {estimates.filter(e => 
                e.estimateNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                e.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm text-primary">{estimate.estimateNo}</span>
                    <p className="text-[10px] text-secondary mt-1 font-bold">{estimate.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary group-hover:text-accent-cyan transition-colors">{estimate.bookTitle}</p>
                    <p className="text-[10px] text-secondary font-bold">Expires: {estimate.validUntil}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-primary opacity-80">{estimate.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-primary">₹{estimate.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 w-fit border shadow-sm ${
                      estimate.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                      estimate.status === 'Converted' ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' :
                      estimate.status === 'Draft' ? 'bg-gray-100 text-secondary border-gray-200' :
                      'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
                    }`}>
                      {estimate.status === 'Converted' && <CheckCircle size={10} />}
                      {estimate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {estimate.status === 'Approved' && (
                         <button 
                           onClick={() => handleConvertToJob(estimate)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan text-white text-[10px] font-black uppercase rounded shadow-md shadow-accent-cyan/20 hover:scale-105 transition-transform"
                         >
                           Convert <ArrowRight size={12} />
                         </button>
                       )}
                       <button 
                         onClick={() => {
                           setSelectedEstimate(estimate);
                           setIsViewModalOpen(true);
                         }}
                         className="p-2 hover:bg-white rounded-full text-secondary transition-colors shadow-sm bg-gray-50"
                       >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Estimation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/10 rounded-2xl rotate-3 shadow-inner">
                     <Calculator size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold">Smart Cost Estimator</h3>
                     <p className="text-white/60 text-xs mt-1">Breakdown costs and auto-calculate final pricing.</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 font-sans">
                <form id="est-form" onSubmit={handleSaveEstimate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Job Details & Templates */}
                  <div className="space-y-6">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                        <FileText size={14} className="text-accent-cyan" /> Project Context
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-primary tracking-wider">Project Title</label>
                          <input name="title" required placeholder="e.g., Annual Report 2024" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-primary tracking-wider">Customer</label>
                          <input name="customer" required placeholder="Search or Type Customer Name" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                        <Save size={14} className="text-success" /> Templates
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                         {templates.map(t => (
                           <button 
                             key={t.id}
                             type="button"
                             onClick={() => applyTemplate(t.id)}
                             className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all text-xs text-left group"
                           >
                             <span className="font-bold text-primary">{t.name}</span>
                             <ChevronDown size={14} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Costs & Multi-Qty Tiers */}
                  <div className="space-y-6">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xl space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary flex items-center justify-between">
                         <span>Cost Components (INR)</span>
                         <Settings size={14} className="opacity-20" />
                      </h4>
                      
                      <div className="space-y-3">
                        {[
                          { field: 'paper', label: 'Paper Cost', icon: <FileText size={14} /> },
                          { field: 'ink', label: 'Ink Cost', icon: <DollarSign size={14} /> },
                          { field: 'plates', label: 'Plate Cost', icon: <List size={14} /> },
                          { field: 'machine', label: 'Machine Cost (Hourly/Total)', icon: <Printer size={14} /> },
                          { field: 'labor', label: 'Labor Cost', icon: <User size={14} /> },
                          { field: 'finishing', label: 'Finishing Cost', icon: <CheckCircle size={14} /> },
                          { field: 'overheads', label: 'Overheads & Misc', icon: <Settings size={14} /> },
                        ].map((cost) => (
                          <div key={cost.field} className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl group hover:bg-gray-100 transition-all">
                             <div className="p-2 bg-white rounded-lg shadow-sm text-secondary group-hover:text-primary transition-colors">
                              {cost.icon}
                             </div>
                             <label className="text-xs font-bold text-primary flex-1">{cost.label}</label>
                             <div className="relative">
                               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary font-bold text-[10px]">₹</span>
                               <input 
                                  type="number" 
                                  value={currentEstimate.costs?.[cost.field as keyof CostBreakdown] || ''}
                                  onChange={(e) => handleCostChange(cost.field as keyof CostBreakdown, e.target.value)}
                                  className="w-24 text-right pr-2 pl-6 py-1.5 bg-white border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-accent-cyan font-mono font-bold text-sm" 
                               />
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                         <div className="flex items-center justify-between bg-accent-amber/5 p-4 rounded-2xl border border-accent-amber/10">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-accent-amber text-white rounded-lg">
                                <Percent size={14} />
                              </div>
                              <span className="text-xs font-black text-primary uppercase">Profit Margin</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <input 
                                  type="number" 
                                  value={currentEstimate.costs?.profitMargin || 0}
                                  onChange={(e) => handleCostChange('profitMargin', e.target.value)}
                                  className="w-16 text-right px-2 py-1 bg-white border border-gray-100 rounded-lg outline-none font-bold text-sm" 
                               />
                               <span className="text-xs font-bold text-secondary">%</span>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Quantity & Fixed Pricing Logic */}
                    <div className="p-6 bg-white rounded-2xl border-2 border-primary shadow-xl space-y-4">
                       <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Quantity Pricing Grid</h4>
                          <button 
                            type="button" 
                            onClick={addTier}
                            className="p-2 bg-primary text-white rounded-lg hover:bg-accent-cyan transition-all shadow-md"
                          >
                             <Plus size={16} />
                          </button>
                       </div>

                       <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                          {pricingTiers.map((tier, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 relative group">
                               <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                     <label className="text-[9px] font-black uppercase text-secondary mb-1 block">Quantity</label>
                                     <input 
                                        type="number"
                                        value={tier.quantity}
                                        onChange={(e) => handleTierChange(idx, 'quantity', Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-bold text-sm outline-none focus:border-primary"
                                     />
                                  </div>
                                  <div className="flex-1">
                                     <label className="text-[9px] font-black uppercase text-secondary mb-1 block">Est. Unit Cost</label>
                                     <p className="font-mono text-sm font-bold text-secondary">₹{tier.unitCost.toFixed(2)}</p>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => removeTier(idx)}
                                    className="p-1 text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                     <X size={14} />
                                  </button>
                               </div>

                               <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                        <label className="text-[9px] font-black uppercase text-primary">Admin Fixed Price (Unit)</label>
                                        <input 
                                          type="checkbox"
                                          checked={tier.isFixed}
                                          onChange={(e) => handleTierChange(idx, 'isFixed', e.target.checked)}
                                          className="w-3 h-3 accent-primary"
                                        />
                                     </div>
                                     <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary font-bold text-[10px]">₹</span>
                                        <input 
                                          type="number"
                                          disabled={!tier.isFixed}
                                          value={tier.fixedPrice}
                                          onChange={(e) => handleTierChange(idx, 'fixedPrice', Number(e.target.value))}
                                          step="0.01"
                                          className={`w-full pl-6 pr-2 py-1.5 rounded-lg border font-mono font-black text-sm outline-none transition-all ${tier.isFixed ? 'bg-white border-primary text-primary ring-2 ring-primary/10' : 'bg-gray-100 border-gray-200 text-secondary cursor-not-allowed'}`}
                                          placeholder={((tier.unitCost * (1 + (currentEstimate.costs?.profitMargin || 0)/100))).toFixed(2)}
                                        />
                                     </div>
                                  </div>
                                  <div className="flex-1 text-right">
                                     <label className="text-[9px] font-black uppercase text-secondary mb-1 block">Total Value</label>
                                     <p className="text-lg font-black text-primary">₹{tier.total.toLocaleString()}</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>

                       {/* Summary Area */}
                       <div className="bg-primary p-6 rounded-3xl text-white shadow-2xl space-y-4 relative overflow-hidden mt-4">
                          <div className="flex justify-between items-center relative z-10 transition-all">
                             <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Base Components Cost</span>
                             <span className="font-mono font-bold">₹{totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-4">
                             <span className="text-sm font-black uppercase tracking-[0.2em]">Estimate Value (Tier 1)</span>
                             <div className="text-right">
                               <span className="text-[10px] block opacity-40 font-bold mb-1">Based on {pricingTiers[0]?.quantity} Quantity</span>
                               <span className="text-3xl font-black text-accent-cyan">₹{pricingTiers[0]?.total.toLocaleString()}</span>
                             </div>
                          </div>
                          <Calculator size={100} className="absolute -right-5 -bottom-5 text-white/5 rotate-12" />
                       </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Action Bar */}
              <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                 <button type="button" className="text-xs font-black text-secondary uppercase hover:text-danger tracking-widest flex items-center gap-2 transition-colors">
                    <Trash2 size={16} /> Discard
                 </button>
                 <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-secondary hover:bg-gray-50 transition-all">
                      <Save size={18} /> Save Template
                   </button>
                   <button 
                      form="est-form"
                      type="submit" 
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                   >
                      Generate Quota <ArrowRight size={18} />
                   </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main UI conversion rate banner */}
      {/* Main UI conversion rate banner */}
      <AnimatePresence>
        {isViewModalOpen && selectedEstimate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-10 font-sans">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Quotation Details</h3>
                  <p className="text-secondary font-bold text-sm">{selectedEstimate.estimateNo} • Issued on {selectedEstimate.date}</p>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-secondary mb-2 tracking-widest">Customer Information</p>
                  <p className="text-lg font-black text-primary">{selectedEstimate.customer}</p>
                  <p className="text-xs text-secondary mt-1 font-bold">Project: <span className="text-primary">{selectedEstimate.bookTitle}</span></p>
                </div>
                <div className="p-6 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20">
                  <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Quote Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedEstimate.status === 'Approved' ? 'bg-success' : 'bg-accent-amber'}`} />
                    <p className="text-lg font-black uppercase italic tracking-tighter">{selectedEstimate.status}</p>
                  </div>
                  <p className="text-xs opacity-60 mt-2 font-bold italic">Valid until: {selectedEstimate.validUntil}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest border-b border-gray-100 pb-2">Quantity Based Pricing (Quotations)</h4>
                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                   <table className="w-full text-left bg-gray-50/50">
                      <thead>
                         <tr className="text-[9px] font-black uppercase text-secondary bg-gray-100/50">
                            <th className="px-4 py-3">Quantity</th>
                            <th className="px-4 py-3 text-right">Unit Price</th>
                            <th className="px-4 py-3 text-right">Estimated Total</th>
                            <th className="px-4 py-3 text-center">Admin Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 italic">
                         {selectedEstimate.tiers && selectedEstimate.tiers.map((tier, idx) => (
                           <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 font-black text-primary">{tier.quantity.toLocaleString()}</td>
                              <td className="px-4 py-4 text-right font-mono font-bold text-primary">₹{(tier.total / tier.quantity).toFixed(2)}</td>
                              <td className="px-4 py-4 text-right font-black text-primary text-base">₹{tier.total.toLocaleString()}</td>
                              <td className="px-4 py-4 text-center">
                                 {tier.isFixed ? (
                                   <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success text-white text-[8px] font-black uppercase rounded shadow-sm shadow-success/20">
                                      <CheckCircle size={8} /> Fixed
                                   </span>
                                 ) : (
                                   <span className="text-[8px] font-black uppercase text-secondary opacity-30">Auto</span>
                                 )}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest border-b border-gray-100 pb-2">Internal Cost Analysis (Draft)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEstimate.costs && Object.entries(selectedEstimate.costs).map(([key, value]) => (
                    key !== 'profitMargin' && (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                        <span className="text-xs font-bold text-secondary capitalize">{key}</span>
                        <span className="text-sm font-black text-primary font-mono">₹{value.toLocaleString()}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="p-8 bg-gray-900 rounded-[30px] flex justify-between items-center text-white">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-40 mb-1">Grand Total Quoted</p>
                   <p className="text-4xl font-black text-accent-cyan italic leading-none">₹{selectedEstimate.amount.toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => window.print()} className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-white"><Printer size={20} /></button>
                   <button className="px-8 py-4 bg-accent-cyan text-primary rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg shadow-accent-cyan/20">Send via Email</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-dark p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 font-sans">Profitability Dashboard</h3>
              <p className="text-white/60 text-sm mb-6">Real-time overhead analysis covering Labor, Ink, and Plate consumption.</p>
              <div className="flex gap-4">
                 <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">Avg. Component Margin</p>
                    <p className="text-xl font-black">24.8%</p>
                 </div>
                 <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">System Load</p>
                    <p className="text-xl font-black">Optimal</p>
                 </div>
                 <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">Active Estimates</p>
                    <p className="text-xl font-black">{estimates.length}</p>
                 </div>
              </div>
           </div>
           <Calculator size={150} className="absolute -right-10 -bottom-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <div>
             <h4 className="font-bold text-primary mb-1">Conversion Ratio</h4>
             <p className="text-secondary text-xs">Based on successful conversions from Estimate to Production Job Card.</p>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-50">
             <div className="flex items-center justify-between font-bold text-xs">
               <span className="text-secondary">Conversion Rate</span>
               <span className="text-accent-cyan">72%</span>
             </div>
             <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent-cyan w-[72%]"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
