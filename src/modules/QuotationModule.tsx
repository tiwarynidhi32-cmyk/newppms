import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, FileText, Download, Printer, Calculator, X, Save, CheckCircle, ChevronRight, User, Hash, Calendar, ArrowUpRight } from 'lucide-react';
import { Quotation, PricingConfig } from '../types';

export default function QuotationModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('printing_pms_quotations');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Migration: if first item doesn't have 'items' property, it's old format
      if (parsed.length > 0 && !parsed[0].items) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [customers] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [config] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('printing_pms_pricing_config');
    if (saved) return JSON.parse(saved);
    return {
      id: 'default',
      paperPrices: [
        { paperType: 'Art Paper', gsm: 130, pricePerUnit: 2.5 },
        { paperType: 'Maplitho', gsm: 70, pricePerUnit: 1.2 }
      ],
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

  const [customerName, setCustomerName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
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

  function calculateItemCosts(data: typeof formData) {
    const paperRate = config.paperPrices.find(p => p.paperType === data.paperType && p.gsm === data.gsm)?.pricePerUnit || 1.5;
    const paperCost = (data.quantity * paperRate);
    
    const machine = config.printingRates.find(r => r.machineType === data.printingType);
    const printingCost = (machine?.setupCost || 0) + (machine?.ratePerHour || 1000) * (data.quantity / 2000);
    
    const inkCost = data.noOfColors * config.inkCostPerColor * (data.quantity / 1000);
    const plateCost = data.noOfPlates * config.plateCostPerPlate;
    const laborCost = data.laborHours * config.laborCostPerManHour;
    const finishingCost = data.finishingCost;
    
    const baseTotal = paperCost + printingCost + inkCost + plateCost + laborCost + finishingCost;
    const overhead = (baseTotal * config.overheadPercentage) / 100;
    const totalWithOverheads = baseTotal + overhead;
    const profit = (totalWithOverheads * config.profitMarginPercentage) / 100;
    
    const subtotal = totalWithOverheads + profit;
    const gst = (subtotal * config.gstPercentage) / 100;
    const total = subtotal + gst;
    const unitPrice = total / data.quantity;

    return {
      paper: paperCost,
      printing: printingCost,
      ink: inkCost,
      plate: plateCost,
      labor: laborCost,
      finishing: finishingCost,
      overhead,
      profit,
      subtotal,
      gst,
      total,
      unitPrice
    };
  }

  const [currentCosts, setCurrentCosts] = useState(() => calculateItemCosts(formData));

  useEffect(() => {
    setCurrentCosts(calculateItemCosts(formData));
  }, [formData, config]);

  const addOrUpdateItem = () => {
    const itemCosts = calculateItemCosts(formData);
    const newItem: QuotationItem = {
      id: String(Date.now()),
      ...formData,
      costs: itemCosts
    };

    if (editingItemIndex !== null) {
      const updated = [...quoteItems];
      updated[editingItemIndex] = newItem;
      setQuoteItems(updated);
      setEditingItemIndex(null);
    } else {
      setQuoteItems([...quoteItems, newItem]);
    }
    setShowItemForm(false);
    setFormData({
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
  };

  const handleSave = () => {
    if (!customerName || quoteItems.length === 0) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    const nextNo = quotations.length + 1;
    const year = new Date().getFullYear().toString().slice(-2);
    const quoteNo = `SOP/QTN/${year}/${String(nextNo).padStart(3, '0')}`;
    
    const totalAmount = quoteItems.reduce((acc, item) => acc + item.costs.subtotal, 0);
    const gstAmount = quoteItems.reduce((acc, item) => acc + item.costs.gst, 0);
    const grandTotal = totalAmount + gstAmount;

    const newQuote: Quotation = {
      id: String(Date.now()),
      quotationNo: quoteNo,
      date: new Date().toISOString().split('T')[0],
      customerName,
      items: quoteItems,
      totalAmount,
      gstAmount,
      grandTotal,
      status: 'Draft',
      remarks
    };

    const updated = [newQuote, ...quotations];
    setQuotations(updated);
    localStorage.setItem('printing_pms_quotations', JSON.stringify(updated));
    setIsModalOpen(false);
    setQuoteItems([]);
    setCustomerName('');
    setRemarks('');
  };

  const PRODUCT_TEMPLATES = [
    { name: 'Standard Brochure', size: 'A4', printing: '4 Color Offset', colors: 4, plates: 4, finishing: 200, labor: 2 },
    { name: 'Business Card', size: '3.5 x 2', printing: '4 Color Offset', colors: 4, plates: 4, finishing: 100, labor: 1 },
    { name: 'Letterhead', size: 'A4', printing: '1 Color Offset', colors: 1, plates: 1, finishing: 50, labor: 1 },
    { name: 'Paper Bag', size: '10 x 14 x 4', printing: '2 Color Offset', colors: 2, plates: 2, finishing: 500, labor: 4 },
    { name: 'Hardcover Book', size: '6 x 9', printing: '4 Color Offset', colors: 4, plates: 32, finishing: 2000, labor: 10 },
  ];

  const STANDARD_SIZES = ['A4', 'A5', 'A3', 'B5', '3.5 x 2', '10 x 14', 'Legal'];
  const QUANTITY_TIERS = [500, 1000, 2000, 5000, 10000, 15000, 20000];
  const COLOR_OPTIONS = [1, 2, 4, 5, 8];
  
  const FINISHING_PRESETS = [
    { name: 'None', cost: 0 },
    { name: 'Gloss Lamin.', cost: 250 },
    { name: 'Matt Lamin.', cost: 300 },
    { name: 'UV Coating', cost: 450 },
    { name: 'Perfect Bind', cost: 1200 },
    { name: 'Center Pin', cost: 150 },
    { name: 'Die-Cut', cost: 800 },
    { name: 'Folding', cost: 200 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-primary">Quotation & Costing Center</h2>
          <p className="text-secondary text-sm font-medium">Auto-calculated pricing based on admin standard rates.</p>
        </div>
        <button 
          onClick={() => {
            setQuoteItems([]);
            setCustomerName('');
            setRemarks('');
            setIsModalOpen(true);
          }}
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
                <th className="px-6 py-5 text-left border-r border-white/10">Party & Items</th>
                <th className="px-6 py-5 text-center border-r border-white/10">Items Count</th>
                <th className="px-6 py-5 text-right border-r border-white/10">Total GST</th>
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
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-tight">
                      {q.items.length > 0 ? (
                        q.items.length === 1 
                          ? `${q.items[0].product} (${q.items[0].quantity} qty)` 
                          : `${q.items[0].product} + ${q.items.length - 1} more items`
                      ) : 'Empty Quote'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-black text-sm">{q.items.length}</td>
                  <td className="px-6 py-4 text-right font-black text-sm text-accent-cyan">₹{q.gstAmount.toLocaleString()}</td>
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
              className="bg-white w-full max-w-7xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row h-[90vh]"
            >
              <div className="flex-1 p-10 overflow-y-auto no-scrollbar border-r border-gray-100 bg-gray-50/30">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black italic text-primary uppercase tracking-tighter">Quote Constructor</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-secondary shadow-sm"><X size={24} /></button>
                  </div>

                  <div className="space-y-8">
                      <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                           <User size={16} className="text-accent-cyan" />
                           <label className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Customer Information</label>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <select 
                                  required
                                  className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                                  value={customerName}
                                  onChange={e => setCustomerName(e.target.value)}
                               >
                                  <option value="">Choose Existing Customer...</option>
                                  {customers.map(c => (
                                    <option key={c.id} value={c.companyName || c.name}>{c.companyName || c.name}</option>
                                  ))}
                                  <option value="NEW_CUSTOMER">+ Add New / One-time Customer</option>
                               </select>
                               {customerName === 'NEW_CUSTOMER' && (
                                 <input 
                                   className="w-full mt-2 bg-gray-50 px-5 py-3 rounded-xl font-bold text-xs outline-none border border-accent-cyan"
                                   placeholder="Type Customer Name..."
                                   onBlur={e => setCustomerName(e.target.value)}
                                 />
                               )}
                            </div>
                            <div className="space-y-2">
                               <input 
                                 className="w-full bg-gray-50 px-5 py-4 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-accent-cyan transition-all"
                                 placeholder="Overall Quote Remarks..."
                                 value={remarks}
                                 onChange={e => setRemarks(e.target.value)}
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Quotation Line Items ({quoteItems.length})</h4>
                            <button 
                              onClick={() => {
                                setEditingItemIndex(null);
                                setFormData({
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
                                setShowItemForm(true);
                              }}
                              className="text-[10px] font-black uppercase text-accent-cyan flex items-center gap-2 hover:bg-accent-cyan/10 px-3 py-2 rounded-xl transition-all"
                            >
                              <Plus size={14} /> Add New Entry
                            </button>
                         </div>

                         {quoteItems.length === 0 ? (
                           <div className="p-10 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                              <Calculator size={48} className="text-gray-300" />
                              <p className="text-secondary text-xs font-bold uppercase tracking-widest">No items added yet</p>
                              <button 
                                onClick={() => setShowItemForm(true)}
                                className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl"
                              >
                                Create First Item
                              </button>
                           </div>
                         ) : (
                           <div className="space-y-3">
                              {quoteItems.map((item, idx) => (
                                <div key={item.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-accent-cyan font-black italic">#{idx+1}</div>
                                      <div>
                                         <p className="text-sm font-black text-primary">{item.product}</p>
                                         <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-secondary uppercase tracking-tighter italic">
                                            <span>{item.quantity.toLocaleString()} qty</span>
                                            <span>•</span>
                                            <span>{item.printingType}</span>
                                            <span>•</span>
                                            <span className="text-accent-cyan">₹{item.costs.total.toLocaleString()}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => {
                                          setFormData(item);
                                          setEditingItemIndex(idx);
                                          setShowItemForm(true);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-xl text-secondary transition-all"
                                      >
                                         <Plus size={16} className="rotate-45" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (confirm('Remove this item?')) {
                                            setQuoteItems(quoteItems.filter((_, i) => i !== idx));
                                          }
                                        }}
                                        className="p-2 hover:bg-danger/10 text-danger rounded-xl transition-all"
                                      >
                                         <X size={16} />
                                      </button>
                                   </div>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                  </div>
              </div>

              {/* LIVE SUMMARY / QUOTATION VIEW */}
              <div className="w-full md:w-[500px] bg-primary p-10 text-white flex flex-col justify-between overflow-y-auto no-scrollbar relative">
                  {showItemForm ? (
                    <div className="space-y-8 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                           <h4 className="text-xl font-black italic uppercase tracking-tighter">{editingItemIndex !== null ? 'Edit Entry' : 'Configure Entry'}</h4>
                           <button onClick={() => setShowItemForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Line Item Product</label>
                              <div className="relative group">
                                 <select 
                                   className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:border-accent-cyan transition-all appearance-none"
                                   onChange={e => {
                                      const template = PRODUCT_TEMPLATES.find(t => t.name === e.target.value);
                                      if (template) {
                                        setFormData({
                                          ...formData,
                                          product: template.name,
                                          size: template.size,
                                          printingType: template.printing,
                                          noOfColors: template.colors,
                                          noOfPlates: template.plates,
                                          finishingCost: template.finishing,
                                          laborHours: template.labor
                                        });
                                      } else {
                                        setFormData({...formData, product: e.target.value});
                                      }
                                   }}
                                 >
                                    <option value="" className="bg-primary">Custom / Select Template...</option>
                                    {PRODUCT_TEMPLATES.map(t => <option key={t.name} value={t.name} className="bg-primary">{t.name}</option>)}
                                 </select>
                                 <input 
                                   className="w-full mt-2 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:border-accent-cyan transition-all" 
                                   placeholder="Final Product Name..." 
                                   value={formData.product}
                                   onChange={e => setFormData({...formData, product: e.target.value})}
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Size (Standard/Custom)</label>
                                 <select 
                                   className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:border-accent-cyan transition-all appearance-none"
                                   value={STANDARD_SIZES.find(s => formData.size.includes(s)) || ''}
                                   onChange={e => setFormData({...formData, size: e.target.value})}
                                 >
                                    <option value="" className="bg-primary">Select Size Preset...</option>
                                    {STANDARD_SIZES.map(s => <option key={s} value={s} className="bg-primary">{s}</option>)}
                                    <option value="CUSTOM" className="bg-primary">Custom Dimensions</option>
                                 </select>
                                 <input 
                                   className="w-full mt-2 bg-white/5 border border-white/10 px-5 py-2 rounded-xl font-bold text-xs" 
                                   placeholder="Custom dimensions (e.g. 5x7)..."
                                   value={formData.size} 
                                   onChange={e => setFormData({...formData, size: e.target.value})} 
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Quantity Tier</label>
                                 <select 
                                   className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:border-accent-cyan transition-all appearance-none"
                                   value={QUANTITY_TIERS.includes(formData.quantity) ? formData.quantity : ''}
                                   onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                                 >
                                    <option value="" className="bg-primary">Select Tier...</option>
                                    {QUANTITY_TIERS.map(q => <option key={q} value={q} className="bg-primary">{q.toLocaleString()} Qty</option>)}
                                 </select>
                                 <input 
                                   type="number" 
                                   className="w-full mt-2 bg-white/5 border border-white/10 px-5 py-2 rounded-xl font-bold text-xs" 
                                   placeholder="Specific Qty..."
                                   value={formData.quantity} 
                                   onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} 
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Paper Type</label>
                                 <select className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm appearance-none" value={formData.paperType} onChange={e => setFormData({...formData, paperType: e.target.value})}>
                                    {config.paperPrices.map(p => <option key={p.paperType} value={p.paperType} className="bg-primary">{p.paperType}</option>)}
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">GSM</label>
                                 <select className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm appearance-none" value={formData.gsm} onChange={e => setFormData({...formData, gsm: Number(e.target.value)})}>
                                    {config.paperPrices.filter(p => p.paperType === formData.paperType).map(p => <option key={p.gsm} value={p.gsm} className="bg-primary">{p.gsm}</option>)}
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Machine</label>
                              <select className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl font-bold text-sm appearance-none" value={formData.printingType} onChange={e => setFormData({...formData, printingType: e.target.value})}>
                                 {config.printingRates.map(r => <option key={r.machineType} value={r.machineType} className="bg-primary">{r.machineType}</option>)}
                              </select>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-1">Finishing Mode</label>
                                 <select 
                                   className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm font-bold appearance-none outline-none focus:border-accent-cyan"
                                   onChange={e => setFormData({...formData, finishingCost: Number(e.target.value)})}
                                 >
                                    <option value="0" className="bg-primary">Select Preset...</option>
                                    {FINISHING_PRESETS.map(f => (
                                      <option key={f.name} value={f.cost} className="bg-primary">{f.name} (₹{f.cost})</option>
                                    ))}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest pl-1">Labor (Hrs)</label>
                                 <input type="number" className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm font-bold" value={formData.laborHours} onChange={e => setFormData({...formData, laborHours: Number(e.target.value)})} />
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-4">
                              <div>
                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Colors</label>
                                 <select 
                                   className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm font-bold appearance-none outline-none focus:border-accent-cyan"
                                   value={formData.noOfColors}
                                   onChange={e => {
                                     const colors = Number(e.target.value);
                                     setFormData({...formData, noOfColors: colors, noOfPlates: colors});
                                   }}
                                 >
                                    {COLOR_OPTIONS.map(c => <option key={c} value={c} className="bg-primary">{c} Color</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Plates</label>
                                 <input type="number" className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm" value={formData.noOfPlates} onChange={e => setFormData({...formData, noOfPlates: Number(e.target.value)})} />
                              </div>
                              <div>
                                 <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Finishing ₹</label>
                                 <input type="number" className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm" value={formData.finishingCost} onChange={e => setFormData({...formData, finishingCost: Number(e.target.value)})} />
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                            <div className="flex justify-between items-end">
                               <div>
                                  <p className="text-[10px] font-bold text-white/40 uppercase">Item Estimated Total</p>
                                  <p className="text-3xl font-black italic">₹{currentCosts.total.toLocaleString()}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Unit Price</p>
                                  <p className="text-lg font-black italic">₹{currentCosts.unitPrice.toFixed(2)}</p>
                               </div>
                            </div>
                            <button 
                              onClick={addOrUpdateItem}
                              className="w-full py-4 bg-accent-cyan text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-accent-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              {editingItemIndex !== null ? 'Update Record' : 'Confirm & Add Entry'}
                            </button>
                        </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                        <div className="space-y-12">
                           <div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 italic">Quote Grand Summary</h4>
                              <div className="space-y-6">
                                 <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
                                    <span className="text-white/60 font-bold uppercase text-[10px]">Total Taxable Amount</span>
                                    <span className="text-xl font-black">₹{quoteItems.reduce((acc, i) => acc + i.costs.subtotal, 0).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
                                    <span className="text-white/60 font-bold uppercase text-[10px]">Applied GST (18%)</span>
                                    <span className="text-xl font-black text-accent-cyan">₹{quoteItems.reduce((acc, i) => acc + i.costs.gst, 0).toLocaleString()}</span>
                                 </div>
                                 <div className="pt-4">
                                    <span className="text-accent-magenta font-black uppercase text-[11px] tracking-widest mb-2 block">Net Grand Total</span>
                                    <div className="text-6xl font-black italic tracking-tighter transition-all">
                                       ₹{(quoteItems.reduce((acc, i) => acc + i.costs.subtotal, 0) + quoteItems.reduce((acc, i) => acc + i.costs.gst, 0)).toLocaleString()}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="p-8 bg-black/20 rounded-[32px] border border-white/5 space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="p-3 bg-accent-cyan/10 rounded-2xl text-accent-cyan">
                                    <CheckCircle size={24} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white">Ready for Issuance</p>
                                    <p className="text-[10px] text-white/40 font-bold italic">All line items verified & calculated.</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto space-y-4">
                           <button 
                             onClick={handleSave}
                             className="w-full py-6 bg-white text-primary font-black uppercase tracking-[0.3em] text-sm rounded-3xl shadow-2xl hover:bg-accent-cyan hover:text-white transition-all transform hover:-translate-y-1"
                           >
                             Finalize & Generate Quote
                           </button>
                           <button 
                             onClick={() => setIsModalOpen(false)}
                             className="w-full py-4 text-white/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                           >
                             Discard Preparation
                           </button>
                        </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
