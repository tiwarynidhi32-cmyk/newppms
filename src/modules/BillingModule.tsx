import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Plus, Search, Filter, FileText, CheckCircle, 
  Clock, DollarSign, ArrowUpRight, X, Download, Printer, 
  Send, MoreHorizontal, Percent, Receipt, Wallet, Banknote,
  ChevronDown, History, CheckSquare, ShieldCheck, Share2,
  ExternalLink, Mail, Landmark, Settings, Keyboard, ArrowLeft,
  Scan, Info, PlusCircle, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode?: string;
  format?: string; // e.g. 16 pages
  qty: number;
  rate: number;
  discount?: number;
  tax?: number; // GST Rate for this item
  amount: number;
  subDescription?: string; 
}

interface Invoice {
  id: string;
  prefix: string;
  invoiceNo: string;
  invoiceNumberNumeric: number;
  jobIds: string[]; 
  customerName: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  paymentTerms: number; // days
  ewayBillNo?: string;
  vehicleNo?: string;
  orderNo?: string;
  orderDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalTax: number;
  additionalCharges: number;
  totalAmount: number;
  paidAmount: number;
  isGstApplicable: boolean;
  customerGst?: string;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  paymentMode?: 'Cash' | 'UPI' | 'Bank' | 'Cheque';
  isEwayBill?: boolean;
  isEInvoice?: boolean;
  notes?: string;
  termsAndConditions?: string[];
  applyTCS?: boolean;
  autoRoundOff?: boolean;
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    prefix: 'SOP-INV/24/',
    invoiceNo: 'SOP-INV/24/042',
    invoiceNumberNumeric: 42,
    jobIds: ['JC-013'],
    customerName: 'Malhotra Publishing',
    date: '2024-03-20',
    dueDate: '2024-04-04',
    paymentTerms: 15,
    items: [
      { id: '1', description: 'Web Offset Book Printing', hsnCode: '4901', format: '128 Pages', qty: 1000, rate: 42, amount: 42000, tax: 12, subDescription: 'Saraswati Math Book' }
    ],
    subtotal: 42000,
    totalDiscount: 0,
    taxableAmount: 42000,
    totalTax: 5040,
    additionalCharges: 0,
    totalAmount: 47040,
    paidAmount: 20000,
    isGstApplicable: true,
    status: 'Partial',
    paymentMode: 'Bank',
    isEInvoice: true
  }
];

export default function BillingModule() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('printing_pms_invoices');
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [allJobs] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [allCustomers] = useState<any[]>(() => {
    const saved = localStorage.getItem('printing_pms_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [banks, setBanks] = useState(() => {
    const saved = localStorage.getItem('printing_pms_banks');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'HDFC Current A/c', branch: 'Nariman Point', accountNo: '**** 4291', balance: 345000, status: 'Synced' },
      { id: '2', name: 'SBI Corporate', branch: 'Pune Main', accountNo: '**** 8832', balance: 197000, status: 'Synced' }
    ];
  });

  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');

  useEffect(() => {
    localStorage.setItem('printing_pms_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // New State for Invoice Creation
  const [invoicePrefix, setInvoicePrefix] = useState('SOP/25-26/');
  const [invoiceNo, setInvoiceNo] = useState(invoices.length + 1);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerGst, setCustomerGst] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [newInvoiceItem, setNewInvoiceItem] = useState<Partial<InvoiceItem>>({
    description: '',
    hsnCode: '',
    format: '',
    qty: 1,
    rate: 0,
    discount: 0,
    tax: 12
  });

  const [ewayBillNo, setEwayBillNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState([
    'Our responsibility ceases as soon as goods leave our premise.',
    'We are not responsible for the finished material after a period of 10 days.',
    'Subject to Patna Jurisdiction Only.',
    'E.&O.E.'
  ]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRoundOff, setAutoRoundOff] = useState(true);

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = items.reduce((sum, item) => sum + ((item.qty * item.rate - (item.discount || 0)) * (item.tax || 0) / 100), 0);
    let finalTotal = taxableAmount + totalTax + additionalCharges;
    
    if (autoRoundOff) {
      finalTotal = Math.round(finalTotal);
    }
    
    return { subtotal, totalDiscount, taxableAmount, totalTax, finalTotal };
  };

  const totals = calculateTotals(invoiceItems);

  useEffect(() => {
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + paymentTerms);
    setDueDate(d.toISOString().split('T')[0]);
  }, [invoiceDate, paymentTerms]);

  const handleRecordPayment = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    setInvoices(invoices.map(inv => {
      if (inv.id !== id) return inv;
      return { ...inv, paidAmount: inv.totalAmount, status: 'Paid' as const };
    }));

    // Post payment receipt to ledger
    postToLedger(`Payment Received: ${invoice.invoiceNo} (${invoice.customerName})`, invoice.totalAmount, true, 'Bank');

    alert('Full payment recorded successfully and posted to Bankbook.');
  };

  const stats = {
    totalBilled: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
    collectedRate: 72
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-success/10 text-success border-success/20 shadow-sm shadow-success/5';
      case 'Partial': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'Overdue': return 'bg-danger/10 text-danger border-danger/20 animate-pulse';
      default: return 'bg-gray-100 text-secondary border-gray-200';
    }
  };

  const postToLedger = (particulars: string, amount: number, isIncome: boolean, mode: 'Cash' | 'Bank' | 'Journal' = 'Journal') => {
    const savedLedger = localStorage.getItem('printing_pms_ledger');
    const ledger = savedLedger ? JSON.parse(savedLedger) : [
      { id: 'TXN-001', date: '2024-03-24', particulars: 'Opening Balance', category: 'Asset', mode: 'Bank', debit: 0, credit: 0, balance: 145000 }
    ];

    const lastBalance = ledger.length > 0 ? ledger[0].balance : 0;
    const newBalance = isIncome ? lastBalance + amount : lastBalance - amount;

    const newEntry = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      particulars,
      category: isIncome ? 'Income' : 'Expense',
      mode: mode,
      debit: isIncome ? 0 : amount,
      credit: isIncome ? amount : 0,
      balance: newBalance
    };

    localStorage.setItem('printing_pms_ledger', JSON.stringify([newEntry, ...ledger]));

    if (mode === 'Bank' && isIncome) {
      const updatedBanks = banks.map((b: any) => 
        b.id === selectedBankId ? { ...b, balance: b.balance + amount } : b
      );
      setBanks(updatedBanks);
      localStorage.setItem('printing_pms_banks', JSON.stringify(updatedBanks));
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      alert('Please add at least one item to the invoice.');
      return;
    }
    
    if (!selectedCustomer) {
      alert('Please select or add a customer.');
      return;
    }

    const { subtotal, totalDiscount, taxableAmount, totalTax, finalTotal } = calculateTotals(invoiceItems);

    const newInvoice: Invoice = {
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      prefix: invoicePrefix,
      invoiceNo: `${invoicePrefix}${invoiceNo}`,
      invoiceNumberNumeric: invoiceNo,
      jobIds: [], 
      customerName: selectedCustomer.name || selectedCustomer,
      customerGst: customerGst,
      date: invoiceDate,
      dueDate: dueDate,
      paymentTerms: paymentTerms,
      ewayBillNo,
      vehicleNo,
      orderNo,
      orderDate,
      items: invoiceItems,
      subtotal,
      totalDiscount,
      taxableAmount,
      totalTax,
      additionalCharges,
      totalAmount: finalTotal,
      paidAmount: 0,
      isGstApplicable: true,
      status: 'Unpaid',
      notes,
      termsAndConditions: terms,
      applyTCS,
      autoRoundOff
    };
    
    setInvoices([newInvoice, ...invoices]);
    postToLedger(`Sales: ${newInvoice.invoiceNo} (${newInvoice.customerName})`, newInvoice.totalAmount, true);
    
    setIsModalOpen(false);
    resetInvoiceState();
    alert(`Invoice ${newInvoice.invoiceNo} generated successfully.`);
  };

  const resetInvoiceState = () => {
    setInvoiceNo(invoices.length + 2);
    setInvoiceItems([]);
    setSelectedCustomer(null);
    setCustomerGst('');
    setEwayBillNo('');
    setVehicleNo('');
    setOrderNo('');
    setOrderDate('');
    setNotes('');
    setAdditionalCharges(0);
  };

  const addInvoiceItem = () => {
    if (!newInvoiceItem.description || !newInvoiceItem.qty || !newInvoiceItem.rate) return;
    const item: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 6),
      description: newInvoiceItem.description,
      hsnCode: newInvoiceItem.hsnCode,
      format: newInvoiceItem.format,
      qty: Number(newInvoiceItem.qty),
      rate: Number(newInvoiceItem.rate),
      discount: Number(newInvoiceItem.discount || 0),
      tax: Number(newInvoiceItem.tax || 12),
      amount: (Number(newInvoiceItem.qty) * Number(newInvoiceItem.rate)) - Number(newInvoiceItem.discount || 0)
    };
    setInvoiceItems([...invoiceItems, item]);
    setNewInvoiceItem({
      description: '',
      hsnCode: '',
      format: '',
      qty: 1,
      rate: 0,
      discount: 0,
      tax: 12
    });
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const element = document.getElementById(`invoice-preview-content`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoice.invoiceNo.replace(/\//g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try printing to PDF instead.');
    }
  };

  const handleShare = (invoice: Invoice) => {
    const shareText = `Invoice ${invoice.invoiceNo} for ${invoice.customerName}. Amount: ₹${invoice.totalAmount.toLocaleString()}`;
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNo}`,
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      const emailUrl = `mailto:?subject=Invoice ${invoice.invoiceNo}&body=${encodeURIComponent(shareText)}`;
      window.location.href = emailUrl;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Billing & RevOps</h2>
          <p className="text-secondary text-sm font-medium">GST-compliant invoicing and receivables tracking.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
             <Landmark size={14} className="text-secondary" />
             <span className="text-[9px] font-black text-secondary uppercase">PAY TO:</span>
             <select 
               value={selectedBankId}
               onChange={(e) => setSelectedBankId(e.target.value)}
               className="text-[10px] font-black text-primary bg-transparent outline-none cursor-pointer"
             >
               {banks.map((b: any) => (
                 <option key={b.id} value={b.id}>{b.name}</option>
               ))}
             </select>
          </div>
          <button 
            onClick={() => alert('Opening full payment history and logs...')}
            className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <History size={18} className="text-accent-cyan group-hover:rotate-180 transition-transform duration-700" /> Payment Logs
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all"
          >
            <Plus size={20} /> Create GST Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales (MTD)', value: stats.totalBilled, icon: <FileText className="text-accent-cyan" /> },
          { label: 'Total Received', value: stats.totalPaid, icon: <CheckCircle className="text-success" /> },
          { label: 'Outstanding', value: stats.outstanding, icon: <Clock className="text-danger" /> },
          { label: 'Collection Rate', value: `${stats.collectedRate}%`, icon: <Percent className="text-accent-magenta" /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="p-3 bg-gray-50/50 rounded-2xl w-fit group-hover:bg-white transition-colors duration-500 shadow-inner">
                {stat.icon}
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{stat.label}</p>
                <h4 className="text-2xl font-black text-primary mt-1">
                  {typeof stat.value === 'number' ? `₹${stat.value.toLocaleString()}` : stat.value}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search invoice #, customer name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 border border-gray-100 rounded-[24px] outline-none focus:ring-4 focus:ring-accent-cyan/10 transition-all text-sm font-medium bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                <th className="px-8 py-5">Invoice Reference</th>
                <th className="px-8 py-5">Customer / Entity</th>
                <th className="px-8 py-5">Net Amount</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.filter(inv => 
                inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/5 rounded-2xl relative">
                        <Receipt size={18} />
                        {(invoice.isEInvoice || invoice.isEwayBill) && (
                          <div className="absolute -top-1 -right-1 flex gap-0.5">
                            {invoice.isEInvoice && <div className="w-2 h-2 bg-success rounded-full ring-2 ring-white" title="e-Invoice Generated" />}
                            {invoice.isEwayBill && <div className="w-2 h-2 bg-accent-cyan rounded-full ring-2 ring-white" title="e-Way Bill Generated" />}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-mono font-black text-sm text-primary tracking-tighter">{invoice.invoiceNo}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-secondary font-bold italic">Raised: {invoice.date}</p>
                          <span className="text-[9px] text-accent-cyan font-black uppercase">[{invoice.jobIds.join(', ')}]</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-primary opacity-80">{invoice.customerName}</td>
                  <td className="px-8 py-6">
                    <div>
                      <span className="font-black text-primary text-lg tracking-tighter">₹{invoice.totalAmount.toLocaleString()}</span>
                      <p className="text-[10px] text-secondary font-bold mt-1">Paid: ₹{invoice.paidAmount.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsPreviewOpen(true);
                        }}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all shadow-sm text-secondary"
                        title="View / Print Preview"
                      >
                        <FileText size={18} />
                      </button>
                      {invoice.status !== 'Paid' && (
                        <button 
                          onClick={() => handleRecordPayment(invoice.id)}
                          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-success hover:text-white transition-all shadow-sm group/pay"
                          title="Record Full Payment"
                        >
                          <Wallet size={18} className="text-success group-hover/pay:text-white" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsPreviewOpen(true);
                          setTimeout(() => window.print(), 500);
                        }}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-accent-cyan hover:text-white transition-all shadow-sm text-secondary hover:text-white"
                        title="Print Invoice"
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-accent-cyan hover:text-white transition-all shadow-sm text-secondary hover:text-white"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleShare(invoice)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        title="Share Invoice"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Invoice Creation UI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/10 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, y: 50 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: 50 }} 
               className="w-full h-full max-w-[1400px] max-h-[95vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-sans"
             >
                {/* Header Section */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                   <div className="flex items-center gap-6">
                      <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                         <ArrowLeft size={24} className="text-secondary" />
                      </button>
                      <h2 className="text-2xl font-black text-primary tracking-tight">Create Sales Invoice</h2>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <button className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-secondary">
                        <Keyboard size={20} />
                      </button>
                      <button className="px-6 py-2.5 border border-gray-100 rounded-xl flex items-center gap-2 font-bold text-sm text-secondary hover:bg-gray-50 transition-all">
                        <Settings size={18} /> Settings
                      </button>
                      <button onClick={handleCreateInvoice} className="px-8 py-2.5 border border-primary text-primary rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all">
                        Save & New
                      </button>
                      <button onClick={handleCreateInvoice} className="px-10 py-2.5 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-accent-cyan transition-all">
                        Save
                      </button>
                      <button onClick={() => setIsModalOpen(false)} className="ml-2 p-2 hover:bg-danger/10 text-secondary hover:text-danger rounded-full transition-all">
                        <X size={24} />
                      </button>
                   </div>
                </div>

                {/* Banner / Alert */}
                <div className="px-10 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent-cyan/10 rounded-full flex items-center justify-center">
                         <Share2 size={18} className="text-accent-cyan" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-wider">Invoice Auto-SMS to Party</p>
                        <p className="text-[10px] font-bold text-secondary opacity-60">An SMS with the invoice will be shared instantly.</p>
                      </div>
                   </div>
                   <button className="px-6 py-2 bg-primary/10 text-primary rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all">
                     Change Settings
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                   {/* Bill To & Invoice Info */}
                   <div className="flex flex-col lg:flex-row gap-12">
                      {/* Left: Bill To */}
                      <div className="flex-1 space-y-6">
                         <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Bill To</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                              className="border-2 border-dashed border-primary/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all group"
                              onClick={() => {
                                const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
                                if (customer) {
                                  setSelectedCustomer(customer);
                                  setCustomerGst(customer.taxInfo?.gstNumber || '');
                                } else {
                                  setSelectedCustomer({ name: 'New Walk-in Customer' });
                                }
                              }}
                            >
                               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <PlusCircle className="text-secondary group-hover:text-accent-cyan" />
                               </div>
                               <span className="text-[10px] font-black text-secondary group-hover:text-accent-cyan uppercase tracking-widest">+ Add Party</span>
                            </div>

                            {selectedCustomer && (
                              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative group">
                                <button 
                                  onClick={() => { setSelectedCustomer(null); setCustomerGst(''); }} 
                                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} className="text-danger" />
                                </button>
                                <h4 className="text-xl font-black text-primary italic uppercase mb-2">{selectedCustomer.name}</h4>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-secondary uppercase opacity-60">Customer GSTIN</p>
                                  <input 
                                    value={customerGst}
                                    onChange={(e) => setCustomerGst(e.target.value)}
                                    placeholder="Enter GST Number"
                                    className="bg-transparent font-mono text-sm font-black text-primary outline-none focus:text-accent-cyan transition-colors"
                                  />
                                </div>
                              </div>
                            )}
                         </div>
                      </div>

                      {/* Right: Invoice Info */}
                      <div className="lg:w-1/3 grid grid-cols-3 gap-x-4 gap-y-6 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 shadow-inner">
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Invoice Prefix</label>
                            <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Invoice Number</label>
                            <input type="number" value={invoiceNo} onChange={(e) => setInvoiceNo(Number(e.target.value))} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Invoice Date</label>
                            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>

                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Payment Terms</label>
                            <div className="flex items-center bg-white border border-gray-100 px-3 py-2 rounded-xl">
                              <input type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(Number(e.target.value))} className="w-full text-xs font-bold outline-none" />
                              <span className="text-[8px] font-black text-secondary opacity-40 ml-2">DAYS</span>
                            </div>
                         </div>
                         <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Due Date</label>
                            <input type="date" value={dueDate} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none cursor-not-allowed opacity-60" readOnly />
                         </div>

                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">E-Way Bill No.</label>
                            <input value={ewayBillNo} onChange={(e) => setEwayBillNo(e.target.value)} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Vehicle No.</label>
                            <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-secondary uppercase opacity-60">Order No.</label>
                            <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} className="w-full bg-white border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent-cyan" />
                         </div>
                      </div>
                   </div>

                   {/* Items Table */}
                   <div className="space-y-6">
                      <div className="overflow-x-auto rounded-[32px] border border-gray-100 shadow-sm relative pr-20">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-secondary tracking-widest">
                                 <th className="px-6 py-5 w-16">NO</th>
                                 <th className="px-6 py-5">ITEMS/ SERVICES</th>
                                 <th className="px-6 py-5 w-32">HSN/ SAC</th>
                                 <th className="px-6 py-5">FORMAT</th>
                                 <th className="px-6 py-5 w-24">QTY</th>
                                 <th className="px-6 py-5 w-32 text-right">PRICE/ITEM (₹)</th>
                                 <th className="px-6 py-5 w-32 text-right">DISCOUNT</th>
                                 <th className="px-6 py-5 w-24 text-right">TAX</th>
                                 <th className="px-6 py-5 w-32 text-right">AMOUNT (₹)</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {invoiceItems.map((item, idx) => (
                                <tr key={item.id} className="text-sm font-bold group">
                                  <td className="px-6 py-4 text-xs text-secondary opacity-40">{idx + 1}</td>
                                  <td className="px-6 py-4">
                                     <p className="text-primary italic font-black uppercase tracking-tight">{item.description}</p>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs text-secondary opacity-80">{item.hsnCode}</td>
                                  <td className="px-6 py-4 text-xs text-secondary italic">{item.format}</td>
                                  <td className="px-6 py-4">{item.qty}</td>
                                  <td className="px-6 py-4 text-right">₹{item.rate.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-accent-magenta">-₹{item.discount?.toLocaleString() || 0}</td>
                                  <td className="px-6 py-4 text-right">{item.tax}%</td>
                                  <td className="px-6 py-4 text-right font-black text-primary italic">₹{item.amount.toLocaleString()}</td>
                                </tr>
                              ))}

                              {/* Form to Add New Item */}
                              <tr className="bg-accent-cyan/5">
                                 <td className="px-6 py-4 text-xs font-black text-accent-cyan opacity-40 italic">New</td>
                                 <td className="px-4 py-2">
                                    <input 
                                      value={newInvoiceItem.description} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, description: e.target.value})}
                                      placeholder="Service or Product Name"
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-bold italic outline-none focus:border-accent-cyan shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <input 
                                      value={newInvoiceItem.hsnCode} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, hsnCode: e.target.value})}
                                      placeholder="Ex: 4802"
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-mono outline-none shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <input 
                                      value={newInvoiceItem.format} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, format: e.target.value})}
                                      placeholder="Ex: 16 Pages"
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-bold outline-none shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <input 
                                      type="number"
                                      value={newInvoiceItem.qty} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, qty: Number(e.target.value)})}
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-black outline-none shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <input 
                                      type="number"
                                      value={newInvoiceItem.rate || ''} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, rate: Number(e.target.value)})}
                                      placeholder="Rate"
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-black text-right outline-none shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <input 
                                      type="number"
                                      value={newInvoiceItem.discount || ''} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, discount: Number(e.target.value)})}
                                      placeholder="0"
                                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-4 text-xs font-black text-right outline-none shadow-sm"
                                    />
                                 </td>
                                 <td className="px-4 py-2">
                                    <select 
                                      value={newInvoiceItem.tax} 
                                      onChange={(e) => setNewInvoiceItem({...newInvoiceItem, tax: Number(e.target.value)})}
                                      className="w-full bg-white border border-gray-100 rounded-lg px-2 py-4 text-[10px] font-black outline-none shadow-sm"
                                    >
                                       {[5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                                    </select>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={addInvoiceItem}
                                      className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-accent-cyan transition-all active:scale-95"
                                    >
                                       <Plus size={24} />
                                    </button>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        
                        {/* Summary inline section as in image */}
                        <div className="bg-gray-50/50 flex justify-between items-center p-6 border-t border-gray-100">
                           <div className="flex items-center gap-12">
                              <p className="text-[10px] font-black text-secondary tracking-widest flex items-center gap-2">
                                 SUBTOTAL <span className="text-sm text-primary font-black italic">₹{totals.subtotal.toLocaleString()}</span>
                              </p>
                              <p className="text-[10px] font-black text-secondary tracking-widest flex items-center gap-2">
                                 TAX <span className="text-sm text-primary font-black italic">₹{totals.totalTax.toLocaleString()}</span>
                              </p>
                           </div>
                           <p className="text-[10px] font-black text-secondary tracking-widest flex items-center gap-3">
                              TOTAL <span className="text-2xl text-primary font-black italic tracking-tighter">₹{totals.finalTotal.toLocaleString()}</span>
                           </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-12">
                         {/* Bottom Left: Notes & T&C */}
                         <div className="flex-1 space-y-8">
                            <div className="space-y-3">
                               <button className="flex items-center gap-2 text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:opacity-70 transition-opacity">
                                  <PlusCircle size={14} /> Add Notes
                               </button>
                               <textarea 
                                 value={notes} 
                                 onChange={(e) => setNotes(e.target.value)}
                                 placeholder="Add specific notes to the customer if any..."
                                 className="w-full h-24 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-accent-cyan transition-all"
                               />
                            </div>

                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Terms and Conditions</p>
                                  <button className="p-2 hover:bg-gray-100 rounded-full transition-all"><Settings size={14} className="text-secondary" /></button>
                               </div>
                               <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100">
                                  <ul className="space-y-3">
                                    {terms.map((t, i) => (
                                      <li key={i} className="flex gap-4 group">
                                         <span className="text-[10px] font-black text-primary opacity-30">{i+1}.</span>
                                         <p className="text-xs font-bold text-primary italic leading-relaxed">{t}</p>
                                      </li>
                                    ))}
                                  </ul>
                               </div>
                            </div>
                         </div>

                         {/* Bottom Right: Adjustments & Total */}
                         <div className="lg:w-1/3 flex flex-col items-end gap-8 pt-8">
                            <div className="w-full space-y-4 border-b border-gray-100 pb-8">
                               <button className="flex items-center gap-2 text-[10px] font-black text-accent-cyan uppercase tracking-widest ml-auto hover:opacity-70">
                                  <PlusCircle size={14} /> Add Discount
                               </button>
                               <button className="flex items-center gap-2 text-[10px] font-black text-accent-cyan uppercase tracking-widest ml-auto hover:opacity-70">
                                  <PlusCircle size={14} /> Add Additional Charges
                               </button>
                               
                               <div className="flex justify-between items-center text-secondary">
                                  <span className="text-[10px] font-black uppercase tracking-widest">Taxable Amount</span>
                                  <span className="text-sm font-black italic">₹{totals.taxableAmount.toLocaleString()}</span>
                               </div>

                               <div className="flex items-center justify-end gap-3 pt-2">
                                  <label className="flex items-center gap-3 cursor-pointer group">
                                     <input type="checkbox" checked={applyTCS} onChange={(e) => setApplyTCS(e.target.checked)} className="w-5 h-5 accent-primary rounded-lg" />
                                     <span className="text-[11px] font-black text-primary italic uppercase tracking-tighter group-hover:text-accent-cyan">Apply TCS</span>
                                  </label>
                               </div>

                               <div className="flex items-center justify-end gap-3 pt-2">
                                  <label className="flex items-center gap-3 cursor-pointer group">
                                     <input type="checkbox" checked={autoRoundOff} onChange={(e) => setAutoRoundOff(e.target.checked)} className="w-5 h-5 accent-primary rounded-lg" />
                                     <span className="text-[11px] font-black text-primary italic uppercase tracking-tighter group-hover:text-accent-cyan">Auto Round Off</span>
                                  </label>
                                  <div className="ml-4 flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                                     <span className="text-[10px] font-black text-secondary mr-3">+ Add</span>
                                     <ChevronDown size={14} className="text-secondary opacity-40" />
                                     <div className="mx-3 w-px h-3 bg-gray-200" />
                                     <span className="text-[10px] font-black text-primary">₹ {autoRoundOff ? (totals.finalTotal - (totals.taxableAmount + totals.totalTax + additionalCharges)).toFixed(2) : '0.00'}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="w-full p-8 bg-primary rounded-[32px] text-white flex flex-col gap-4 shadow-xl shadow-primary/20 relative overflow-hidden group">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                               <div className="flex justify-between items-end relative z-10">
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total Amount Payable</span>
                                  <div className="text-right">
                                     <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Final Invoice Total</p>
                                     <h3 className="text-5xl font-black italic tracking-tighter">₹{totals.finalTotal.toLocaleString()}</h3>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && selectedInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setIsPreviewOpen(false)} 
               className="absolute inset-0 bg-primary/40 backdrop-blur-md no-print" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.95 }} 
               className="relative bg-white rounded-[40px] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar print:max-h-none print:shadow-none print:rounded-none"
            >
               <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10 no-print">
                  <div className="flex gap-4">
                     <button 
                       onClick={() => window.print()}
                       className="px-6 py-2.5 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                     >
                        <Printer size={16} /> Print / Save PDF
                     </button>
                     <button 
                       onClick={() => handleDownloadPDF(selectedInvoice)}
                       className="px-6 py-2.5 border border-gray-200 text-primary rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-gray-50"
                     >
                        <Download size={16} /> Download
                     </button>
                  </div>
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full text-secondary"
                  >
                     <X size={24} />
                  </button>
               </div>

               <div id="invoice-preview-content" className="p-12 font-sans text-primary print:p-0">
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <div className="w-12 h-12 bg-primary rounded-2xl mb-4 flex items-center justify-center text-white">
                           <Banknote size={24} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-widest leading-tight text-primary">Sai Offset<br/>Printers</h1>
                        <p className="text-[10px] font-bold text-secondary uppercase opacity-60 mt-2 tracking-widest">Industrial Area, Pune, Maharashtra</p>
                        <p className="text-[10px] font-bold text-secondary uppercase opacity-60 tracking-wider">GSTIN: 27SOPP1234F1Z5</p>
                     </div>
                     <div className="text-right">
                        <h2 className="text-4xl font-black uppercase italic text-primary/5 mb-4">Tax Invoice</h2>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Invoice Number</p>
                           <p className="font-mono font-black text-lg text-primary">{selectedInvoice.invoiceNo}</p>
                        </div>
                        <div className="mt-4 space-y-1">
                           <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Date of Issue</p>
                           <p className="font-black text-primary">{selectedInvoice.date}</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12 mb-12">
                     <div>
                        <p className="text-[10px] font-black text-secondary uppercase mb-4 tracking-[0.2em]">Bill To</p>
                        <h4 className="text-xl font-black uppercase italic mb-2 text-primary">{selectedInvoice.customerName}</h4>
                        <p className="text-xs font-medium text-secondary max-w-[240px] leading-relaxed italic opacity-80">
                           {selectedInvoice.customerAddress || 'Registered Office Address, Pune, MH'}
                        </p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                           <p className="text-[9px] font-black text-secondary uppercase opacity-40 mb-1">Customer GSTIN</p>
                           <p className="font-mono text-xs font-black text-primary tracking-tight">{selectedInvoice.customerGst || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10">
                        <p className="text-[10px] font-black uppercase text-primary mb-6 tracking-widest">Payment Summary</p>
                        <div className="space-y-4">
                           <div className="flex justify-between border-b border-primary/5 pb-4">
                              <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">Subtotal</span>
                              <span className="font-black text-sm italic">₹{selectedInvoice.subtotal?.toLocaleString() || selectedInvoice.taxableAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between border-b border-primary/5 pb-4">
                              <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">Tax Component</span>
                              <span className="font-black text-sm italic">₹{selectedInvoice.totalTax?.toLocaleString() || '0'}</span>
                           </div>
                           {selectedInvoice.totalDiscount > 0 && (
                             <div className="flex justify-between border-b border-primary/5 pb-4">
                                <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">Savings</span>
                                <span className="font-black text-sm italic text-accent-magenta">-₹{selectedInvoice.totalDiscount.toLocaleString()}</span>
                             </div>
                           )}
                           <div className="flex justify-between items-end pt-4">
                              <span className="text-[10px] font-black uppercase text-primary leading-none tracking-[0.3em]">Total Payable</span>
                              <span className="text-4xl font-black text-primary leading-none tracking-tighter italic">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mb-12">
                     <p className="text-[10px] font-black uppercase text-secondary mb-4 tracking-[0.2em]">Itemized Billing</p>
                     <div className="border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <table className="w-full text-left bg-white">
                           <thead>
                              <tr className="bg-gray-50 text-[10px] font-black uppercase text-secondary border-b border-gray-100 tracking-widest">
                                 <th className="px-8 py-5">Service Details</th>
                                 <th className="px-8 py-5 text-center">HSN/SAC</th>
                                 <th className="px-8 py-5 text-center">Qty</th>
                                 <th className="px-8 py-5 text-right">Price</th>
                                 <th className="px-8 py-5 text-right">Total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {selectedInvoice.items.map((item, i) => (
                                 <tr key={i}>
                                    <td className="px-8 py-6">
                                       <p className="font-black text-primary text-sm italic uppercase tracking-tight">{item.description}</p>
                                       {item.format && <p className="text-[10px] text-accent-cyan font-bold mt-1 uppercase tracking-widest">{item.format}</p>}
                                    </td>
                                    <td className="px-8 py-6 text-center font-mono text-xs text-secondary opacity-60">{item.hsnCode || '---'}</td>
                                    <td className="px-8 py-6 text-center font-black text-sm italic">{item.qty}</td>
                                    <td className="px-8 py-6 text-right font-black text-sm italic">₹{item.rate.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-right font-black text-primary text-base italic">₹{item.amount.toLocaleString()}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div>
                           <p className="text-[10px] font-black uppercase text-secondary mb-3 tracking-widest opacity-40">Terms & Conditions</p>
                           <ul className="text-[10px] font-bold text-secondary space-y-2 italic opacity-80 decoration-accent-cyan decoration-2">
                              {selectedInvoice.termsAndConditions?.map((t, idx) => (
                                <li key={idx} className="flex gap-3">
                                   <span className="text-accent-cyan font-black">•</span>
                                   <span>{t}</span>
                                </li>
                              )) || (
                                <>
                                  <li>• Payments due within 15 days of invoice date.</li>
                                  <li>• Please quote invoice number on all payments.</li>
                                </>
                              )}
                           </ul>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                           <p className="text-[10px] font-black uppercase text-secondary mb-4 tracking-widest relative z-10">Settlement Info</p>
                           <div className="grid grid-cols-2 gap-6 text-[10px] relative z-10">
                              <div>
                                 <p className="opacity-40 font-bold uppercase mb-1">Account Name</p>
                                 <p className="font-black uppercase italic text-primary">Sai Offset Printers</p>
                              </div>
                              <div>
                                 <p className="opacity-40 font-bold uppercase mb-1">IFSC Code</p>
                                 <p className="font-black text-primary">HDFC0001234</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="opacity-40 font-bold uppercase mb-1">Bank Name / Branch</p>
                                 <p className="font-black italic text-primary">HDFC Bank Ltd, Pune Main Branch</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="opacity-40 font-bold uppercase mb-1">Account No.</p>
                                 <p className="font-black font-mono text-primary text-base tracking-widest">50200012345678</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-end items-center text-center pb-8 group">
                        <div className="w-56 h-28 border-b-2 border-primary/10 mb-6 flex items-center justify-center grayscale opacity-10 group-hover:opacity-20 transition-opacity italic font-serif text-3xl font-light scale-x-110">
                           Signatory
                        </div>
                        <p className="text-[11px] font-black uppercase text-primary tracking-[0.3em] italic">For Sai Offset Printers</p>
                        <p className="text-[9px] font-bold text-secondary uppercase opacity-40 mt-2 tracking-widest">Authorize Computer Generated Invoice</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
