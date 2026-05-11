import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, FileText, Download, Printer, Calculator, X, Save, CheckCircle, ChevronRight, User, Hash, Calendar, ArrowUpRight } from 'lucide-react';
import { Quotation, PricingConfig } from '../types';

export default function QuotationModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('printing_pms_quotations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [config] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('printing_pms_pricing_config');
    if (saved) return JSON.parse(saved);
    return {
      id: 'default',
      paperPrices: [{ paperType: 'Art Paper', gsm: 130, pricePerUnit: 2.5 }],
      printingRates: [{ machineType: '4 Color Offset', ratePerHour: 1500, setupCost: 1000 }],
      inkCostPerColor: 50,
      plateCostPerPlate: 250,
      laborCostPerManHour: 200,
      overheadPercentage: 15,
      profitMarginPercentage: 20,
      gstPercentage: 18,
    };
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // FORM STATE for auto-calculation
  const [formData, setFormData] = useState({
    customerName: '',
    product: '',
    size: '',
    quantity: 1000,
    paperType: config.paperPrices[0]?.paperType || '',
    gsm: config.paperPrices[0]?.gsm || 0,
    printingType: config.printingRates[0]?.machineType || '',
    noOfColors: 4,
    noOfPlates: 4,
    laborHours: 5,
    finishingCost: 500,
    details: ''
  });

  const [costs, setCosts] = useState({
    paper: 0,
    printing: 0,
    ink: 0,
    plate: 0,
    labor: 0,
    finishing: 0,
    overheads: 0,
    profit: 0,
    subtotal: 0,
    gst: 0,
    total: 0,
    unitPrice: 0
  });

  // AUTO-CALCULATION LOGIC
  useEffect(() => {
    const paperRate = config.paperPrices.find(p => p.paperType === formData.paperType && p.gsm === formData.gsm)?.pricePerUnit || 1.5;
    const paperCost = (formData.quantity * paperRate);
    
    const machine = config.printingRates.find(r => r.machineType === formData.printingType);
    const printingCost = (machine?.setupCost || 0) + (machine?.ratePerHour || 1000) * (formData.quantity / 2000); // Rough estimate: 2000 impressions per hour
    
    const inkCost = formData.noOfColors * config.inkCostPerColor * (formData.quantity / 1000);
    const plateCost = formData.noOfPlates * config.plateCostPerPlate;
    const laborCost = formData.laborHours * config.laborCostPerManHour;
    const finishingCost = formData.finishingCost;
    
    const baseTotal = paperCost + printingCost + inkCost + plateCost + laborCost + finishingCost;
    const overheads = (baseTotal * config.overheadPercentage) / 100;
    const totalWithOverheads = baseTotal + overheads;
    const profit = (totalWithOverheads * config.profitMarginPercentage) / 100;
    
    const subtotal = totalWithOverheads + profit;
    const gst = (subtotal * config.gstPercentage) / 100;
    const total = subtotal + gst;
    const unitPrice = total / formData.quantity;

    setCosts({
      paper: paperCost,
      printing: printingCost,
      ink: inkCost,
      plate: plateCost,
      labor: laborCost,
      finishing: finishingCost,
      overheads,
      profit,
      subtotal,
      gst,
      total,
      unitPrice
    });
  }, [formData, config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNo = quotations.length + 1;
    const year = new Date().getFullYear().toString().slice(-2);
    const quoteNo = `SOP/QTN/${year}/${String(nextNo).padStart(3, '0')}`;
    
    const newQuote: Quotation = {
      id: String(Date.now()),
      quotationNo: quoteNo,
      date: new Date().toISOString().split('T')[0],
      customerName: formData.customerName,
      product: formData.product,
      size: formData.size,
      details: formData.details,
      quantity: formData.quantity,
      paperType: `${formData.paperType} ${formData.gsm}gsm`,
      printingType: formData.printingType,
      finishing: [],
      paperCost: costs.paper,
      printingCost: costs.printing,
      inkCost: costs.ink,
      plateCost: costs.plate,
      laborCost: costs.labor,
      finishingCost: costs.finishing,
      overheads: costs.overheads,
      profitAmount: costs.profit,
      unitPrice: costs.unitPrice,
      totalAmount: costs.subtotal,
      gstAmount: costs.gst,
      grandTotal: costs.total,
      status: 'Draft'
    };

    const updated = [newQuote, ...quotations];
    setQuotations(updated);
    localStorage.setItem('printing_pms_quotations', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-primary">Quotation & Costing Center</h2>
          <p className="text-secondary text-sm font-medium">Auto-calculated pricing based on admin standard rates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-4 bg-accent-cyan text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-primary transition-all flex items-center gap-2 shadow-lg shadow-accent-cyan/20"
        >
          <Plus size={18} /> Generate New Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['Draft', 'Sent', 'Approved', 'Rejected'].map((status) => (
            <div key={status} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-[9px] font-black uppercase text-secondary tracking-widest mb-1">{status}</div>
                <div className="text-xl font-black text-primary italic">
                  {quotations.filter(q => q.status === status).length}
                </div>
            </div>
          ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5 text-left border-r border-white/10">Ref / Date</th>
                <th className="px-6 py-5 text-left border-r border-white/10">Party & Description</th>
                <th className="px-6 py-5 text-center border-r border-white/10">Quantity</th>
                <th className="px-6 py-5 text-right border-r border-white/10">Unit Price</th>
                <th className="px-6 py-5 text-right border-r border-white/10">Grand Total</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic">
              {quotations.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-primary">{q.quotationNo}</div>
                    <div className="text-[10px] font-bold text-secondary">{q.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-primary">{q.customerName}</div>
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-tight">{q.product} • {q.size}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-black text-sm">{q.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-sm text-accent-cyan">₹{q.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-black text-sm text-primary">₹{q.grandTotal.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <select 
                         value={q.status}
                         onChange={(e) => {
                           const newStatus = e.target.value;
                           const updated = quotations.map(item => item.id === q.id ? {...item, status: newStatus as any} : item);
                           setQuotations(updated);
                           localStorage.setItem('printing_pms_quotations', JSON.stringify(updated));
                         }}
                         className={`text-[9px] font-black uppercase px-2 py-1 rounded border outline-none ${
                           q.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                           q.status === 'Rejected' ? 'bg-danger/10 text-danger border-danger/20' :
                           'bg-gray-100 text-secondary border-gray-200'
                         }`}
                       >
                         <option value="Draft">Draft</option>
                         <option value="Sent">Sent</option>
                         <option value="Approved">Approved</option>
                         <option value="Rejected">Rejected</option>
                       </select>
                       
                       {q.status === 'Approved' && (
                         <button 
                           onClick={() => {
                             const savedInvoices = localStorage.getItem('printing_pms_invoices');
                             const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
                             
                             const newInvoice = {
                               id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                               invoiceNo: `SOP-INV/SYNC/00${invoices.length + 1}`,
                               jobIds: [`JC-Q-${q.quotationNo.split('/').pop()}`],
                               customerName: q.customerName,
                               date: new Date().toISOString().split('T')[0],
                               dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                               items: [{ id: '1', description: q.product, qty: q.quantity, rate: q.unitPrice, amount: q.subTotal }],
                               taxableAmount: q.subTotal,
                               gstRate: 18,
                               totalAmount: q.grandTotal,
                               paidAmount: 0,
                               isGstApplicable: true,
                               status: 'Unpaid'
                             };
                             
                             localStorage.setItem('printing_pms_invoices', JSON.stringify([newInvoice, ...invoices]));
                             alert(`Quotation ${q.quotationNo} synced to Billing as a Pro-forma/Draft Invoice.`);
                           }}
                           className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all"
                           title="Sync to Billing"
                         >
                           <ArrowUpRight size={16} />
                         </button>
                       )}
                       
                       <button className="p-2 text-secondary hover:text-primary transition-all"><Printer size={16} /></button>
                       <button className="p-2 text-secondary hover:text-accent-magenta transition-all"><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row h-[90vh]"
            >
              {/* INPUT FORM SECTION */}
              <div className="flex-1 p-10 overflow-y-auto no-scrollbar border-r border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black italic text-primary">Quote Constructor</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-secondary"><X size={24} /></button>
                  </div>

                  <form className="space-y-8" id="quoteForm" onSubmit={handleSave}>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Party Name</label>
                           <input 
                              required
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                              placeholder="Enter Legal Name / Co."
                              value={formData.customerName}
                              onChange={e => setFormData({...formData, customerName: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Product Title</label>
                           <input 
                              required
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                              placeholder="e.g. Annual Report 2024"
                              value={formData.product}
                              onChange={e => setFormData({...formData, product: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Quantity</label>
                           <input 
                              type="number"
                              required
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                              value={formData.quantity}
                              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Size</label>
                           <input 
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                              placeholder="e.g. 5.5 x 8.5"
                              value={formData.size}
                              onChange={e => setFormData({...formData, size: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Printing Machine</label>
                           <select 
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all appearance-none"
                              value={formData.printingType}
                              onChange={e => setFormData({...formData, printingType: e.target.value})}
                           >
                              {config.printingRates.map(r => <option key={r.machineType} value={r.machineType}>{r.machineType}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Paper Type</label>
                           <select 
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all appearance-none"
                              value={formData.paperType}
                              onChange={e => setFormData({...formData, paperType: e.target.value})}
                           >
                              {config.paperPrices.map((p,i) => <option key={i} value={p.paperType}>{p.paperType}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">GSM</label>
                           <select 
                              className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all appearance-none"
                              value={formData.gsm}
                              onChange={e => setFormData({...formData, gsm: Number(e.target.value)})}
                           >
                              {config.paperPrices.filter(p => p.paperType === formData.paperType).map((p,i) => <option key={i} value={p.gsm}>{p.gsm} GSM</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-4 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Colors</label>
                           <input type="number" className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm" value={formData.noOfColors} onChange={e => setFormData({...formData, noOfColors: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Plates</label>
                           <input type="number" className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm" value={formData.noOfPlates} onChange={e => setFormData({...formData, noOfPlates: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Hrs Labor</label>
                           <input type="number" className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm" value={formData.laborHours} onChange={e => setFormData({...formData, laborHours: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-secondary tracking-widest pl-1">Finishing ₹</label>
                           <input type="number" className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm" value={formData.finishingCost} onChange={e => setFormData({...formData, finishingCost: Number(e.target.value)})} />
                        </div>
                     </div>
                  </form>
              </div>

              {/* LIVE SUMMARY / QUOTATION VIEW */}
              <div className="w-full md:w-[400px] bg-primary p-10 text-white flex flex-col justify-between overflow-y-auto no-scrollbar">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 italic">Calculation Insights</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Paper Cost', value: costs.paper },
                        { label: 'Printing Cost', value: costs.printing },
                        { label: 'Ink & Plate', value: costs.ink + costs.plate },
                        { label: 'Labor & Finishing', value: costs.labor + costs.finishing },
                        { label: 'Overheads', value: costs.overheads },
                        { label: 'Profit Margin', value: costs.profit },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white/60 uppercase">{item.label}</span>
                          <span className="text-sm font-black">₹{item.value.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
                       <div className="flex justify-between text-xs font-bold text-white/50">
                         <span>Subtotal</span>
                         <span>₹{costs.subtotal.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold text-white/50">
                         <span>GST ({config.gstPercentage}%)</span>
                         <span>₹{costs.gst.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-end pt-4">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-accent-cyan mb-1">Final Quotation</p>
                            <p className="text-3xl font-black italic">₹{costs.total.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Unit Price</p>
                             <p className="text-lg font-bold text-accent-magenta italic">₹{costs.unitPrice.toFixed(2)}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic text-[10px] leading-relaxed text-white/60">
                       Prices are dynamically linked to admin control rates. Any change in paper/ink base rates will reflect here instantly.
                    </div>
                    <button 
                      form="quoteForm"
                      type="submit"
                      className="w-full py-4 bg-white text-primary font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-accent-cyan hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Finalize & Store
                    </button>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
