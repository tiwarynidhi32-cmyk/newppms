import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Wallet, TrendingUp, TrendingDown, History, Search,
  Download, Filter, ArrowUpRight, ArrowDownRight, PieChart,
  BookOpen, Scale, Landmark, Briefcase, FileText, MoreHorizontal,
  ChevronDown, Calendar, Calculator, Plus, X, Share2, 
  RefreshCw, CheckCircle2, AlertCircle, FileCode
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  date: string;
  particulars: string;
  category: 'Asset' | 'Liability' | 'Income' | 'Expense';
  mode: 'Cash' | 'Bank' | 'Journal';
  debit: number;
  credit: number;
  balance: number;
}

const mockLedger: LedgerEntry[] = [
  { id: 'TXN-001', date: '2024-03-24', particulars: 'Sales: Inv/24/042 (Malhotra Publishing)', category: 'Income', mode: 'Bank', debit: 0, credit: 47040, balance: 145000 },
  { id: 'TXN-002', date: '2024-03-24', particulars: 'Electricity Bill - Mar 2024', category: 'Expense', mode: 'Bank', debit: 12500, credit: 0, balance: 132500 },
  { id: 'TXN-003', date: '2024-03-25', particulars: 'Vendor: Toyo Ink (Ink Purchase)', category: 'Asset', mode: 'Bank', debit: 8500, credit: 0, balance: 124000 },
  { id: 'TXN-004', date: '2024-03-25', particulars: 'GST Payment: Q4 FY24', category: 'Liability', mode: 'Journal', debit: 45000, credit: 0, balance: 79000 },
  { id: 'TXN-005', date: '2024-03-26', particulars: 'Petty Cash - Tea/Snacks', category: 'Expense', mode: 'Cash', debit: 450, credit: 0, balance: 78550 },
  { id: 'TXN-006', date: '2024-03-26', particulars: 'Cash Received: Local Walk-in', category: 'Income', mode: 'Cash', debit: 0, credit: 2500, balance: 81050 },
];

export default function AccountingModule() {
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('printing_pms_ledger');
    return saved ? JSON.parse(saved) : mockLedger;
  });

  const [banks, setBanks] = useState(() => {
    const saved = localStorage.getItem('printing_pms_banks');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'HDFC Current A/c', branch: 'Nariman Point', accountNo: '**** 4291', balance: 345000, status: 'Synced' },
      { id: '2', name: 'SBI Corporate', branch: 'Pune Main', accountNo: '**** 8832', balance: 197000, status: 'Synced' }
    ];
  });

  const [userRole] = useState<'Admin' | 'Accountant' | 'Staff'>(() => {
    const saved = localStorage.getItem('printing_pms_user');
    if (saved) {
      const user = JSON.parse(saved);
      return user.role || 'Admin';
    }
    return 'Admin'; // Default for prototype
  });

  const canEdit = userRole === 'Admin' || userRole === 'Accountant';

  const [activeTab, setActiveTab] = useState<'Ledger' | 'TrialBalance' | 'PL' | 'BalanceSheet' | 'Tally' | 'Contractors'>('Ledger');
  const [ledgerFilter, setLedgerFilter] = useState<'All' | 'Cash' | 'Bank' | 'Journal'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [financialYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('printing_pms_fy_list');
    return saved ? JSON.parse(saved) : ['FY 2022-23', 'FY 2023-24', 'FY 2024-25'];
  });
  const [financialYear, setFinancialYear] = useState(() => {
    return localStorage.getItem('printing_pms_active_fy') || 'FY 2024-25';
  });
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState({
    party: '',
    jobId: '',
    amount: 0
  });

  const handleCreateContractorVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherData.party || voucherData.amount <= 0) {
      alert('Please select a party and enter a valid amount.');
      return;
    }

    const lastBalance = ledger.length > 0 ? ledger[0].balance : 0;
    const newBalance = lastBalance - voucherData.amount;

    const newEntry: LedgerEntry = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      particulars: `Contractor Payment: ${voucherData.party} (Job: ${voucherData.jobId || 'N/A'})`,
      category: 'Expense',
      mode: 'Bank',
      debit: voucherData.amount,
      credit: 0,
      balance: newBalance
    };

    setLedger([newEntry, ...ledger]);
    alert(`Contractor voucher for ₹${voucherData.amount} created and posted to Ledger.`);
    setVoucherData({ party: '', jobId: '', amount: 0 });
  };

  useEffect(() => {
    localStorage.setItem('printing_pms_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('printing_pms_banks', JSON.stringify(banks));
  }, [banks]);

  const trialBalance = React.useMemo(() => {
    const counts: Record<string, { debit: number, credit: number }> = {
      'Sales Revenue': { debit: 0, credit: 0 },
      'Direct Expenses': { debit: 0, credit: 0 },
      'Administrative Expenses': { debit: 0, credit: 0 },
      'Cash in Hand': { debit: 0, credit: 0 },
      'Bank Accounts': { debit: 0, credit: 0 },
      'Capital Account': { debit: 0, credit: 500000 }, // Starting Capital
      'Fixed Assets': { debit: 0, credit: 0 },
      'Other Liabilities': { debit: 0, credit: 0 },
    };

    ledger.forEach(txn => {
      if (txn.category === 'Income') counts['Sales Revenue'].credit += txn.credit;
      if (txn.category === 'Expense') {
        if (txn.particulars.toLowerCase().includes('salary') || txn.particulars.toLowerCase().includes('payroll')) {
          counts['Direct Expenses'].debit += txn.debit;
        } else {
          counts['Administrative Expenses'].debit += txn.debit;
        }
      }
      if (txn.mode === 'Cash') {
        counts['Cash in Hand'].debit += txn.debit;
        counts['Cash in Hand'].credit += txn.credit;
      }
      if (txn.mode === 'Bank') {
        counts['Bank Accounts'].debit += txn.debit;
        counts['Bank Accounts'].credit += txn.credit;
      }
      if (txn.category === 'Asset' && txn.mode === 'Journal') counts['Fixed Assets'].debit += txn.debit;
      if (txn.category === 'Liability' && txn.mode === 'Journal') counts['Other Liabilities'].credit += txn.credit;
    });

    return Object.entries(counts).map(([name, vals]) => ({
      name,
      debit: vals.debit > vals.credit ? vals.debit - vals.credit : 0,
      credit: vals.credit > vals.debit ? vals.credit - vals.debit : 0
    })).filter(acc => acc.debit !== 0 || acc.credit !== 0);
  }, [ledger]);

  const totalTrialBalance = trialBalance.reduce((acc, curr) => ({
    debit: acc.debit + curr.debit,
    credit: acc.credit + curr.credit
  }), { debit: 0, credit: 0 });

  const financialSummary = React.useMemo(() => {
    const income = ledger.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.credit, 0);
    const expense = ledger.filter(t => t.category === 'Expense').reduce((sum, t) => sum + t.debit, 0);
    const profit = income - expense;

    const assets = ledger.filter(t => t.category === 'Asset').reduce((sum, t) => sum + t.debit - t.credit, 145000);
    const liab = ledger.filter(t => t.category === 'Liability').reduce((sum, t) => sum + t.credit - t.debit, 0);

    return { income, expense, profit, assets, liab };
  }, [ledger]);

  const stats = [
    { label: 'Current Balance', value: `₹${(ledger[0]?.balance || 0).toLocaleString()}`, icon: <Landmark />, change: '+5.2%', positive: true },
    { label: 'Revenue (FY)', value: `₹${financialSummary.income.toLocaleString()}`, icon: <TrendingUp />, change: '+12%', positive: true },
    { label: 'Expense (FY)', value: `₹${financialSummary.expense.toLocaleString()}`, icon: <TrendingDown />, change: '-2.4%', positive: false },
    { label: 'Net Profit', value: `₹${financialSummary.profit.toLocaleString()}`, icon: <Calculator />, change: '+8.1%', positive: true },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file format
    const allowedFormats = ['.xml', '.xls', '.xlsx'];
    const isSupported = allowedFormats.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isSupported) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    // Simulate parsing Tally Export
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  const handleTallyExport = () => {
    setIsSyncing(true);
    // Simulate XML generation and export
    setTimeout(() => {
      const tallyXml = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <!-- Sample Voucher Entry -->
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
      
      const blob = new Blob([tallyXml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tally_Export_${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
      setIsSyncing(false);
    }, 1500);
  };

  const [showJournalModal, setShowJournalModal] = useState(false);

  const handleDownload = (type: 'pdf' | 'excel' | 'xml') => {
    setIsSyncing(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const timestamp = new Date().toISOString().split('T')[0];
      const tallyDate = timestamp.replace(/-/g, '');
      let fileName = `Accounting_Records_${timestamp}`;
      let content = "";
      let contentType = "";

      if (type === 'xml') {
        fileName += ".xml";
        contentType = "text/xml";
        // Tally Compatible Balanced XML Structure
        const guid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Generate dynamic entries from ledger
        const ledgerEntriesXML = ledger.map((txn, idx) => `
          <VOUCHER VCHTYPE="Journal" ACTION="Create" OBJVIEW="Accounting VoucherView">
            <DATE>${ledgerDate(txn.date)}</DATE>
            <GUID>${guid}-${idx}</GUID>
            <VOUCHERTYPENAME>Journal</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${txn.id}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${txn.particulars.split(':')[0]}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting VoucherView</PERSISTEDVIEW>
            <ISOPTIONAL>No</ISOPTIONAL>
            <EFFECTIVEDATE>${ledgerDate(txn.date)}</EFFECTIVEDATE>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${txn.particulars.split(':')[0]}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${txn.debit > 0 ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${txn.debit > 0 ? txn.debit : -txn.credit}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Suspense Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${txn.debit > 0 ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${txn.debit > 0 ? -txn.debit : txn.credit}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>`).join('\n');

        content = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Sanjayshree Offset Printers</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          ${ledgerEntriesXML}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
      } else if (type === 'excel') {
        fileName += ".csv";
        contentType = "text/csv";
        content = "Date,Particulars,Category,Debit,Credit,Balance\n" + 
          ledger.map(t => `${t.date},${t.particulars},${t.category},${t.debit},${t.credit},${t.balance}`).join('\n');
      } else {
        fileName += ".pdf";
        contentType = "application/pdf";
        content = "MOCK_PDF_CONTENT_FOR_DASHBOARD_AUDIT";
      }

      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      setIsSyncing(false);
      alert(`${type.toUpperCase()} records generated successfully for Tally export. ${ledger.length} vouchers formatted.`);
    }, 1500);
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newBank = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      branch: formData.get('branch') as string,
      accountNo: `**** ${formData.get('accountNo')?.toString().slice(-4)}`,
      balance: Number(formData.get('balance')) || 0,
      status: 'Synced'
    };
    setBanks([...banks, newBank]);
    setIsBankModalOpen(false);
  };

  const ledgerDate = (dateStr: string) => dateStr.replace(/-/g, '');

  return (
    <div className="space-y-6">
      {showJournalModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-primary uppercase italic">New Journal Entry</h3>
               <button onClick={() => setShowJournalModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
               </button>
            </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const particulars = formData.get('particulars') as string;
                const debit = Number(formData.get('debit')) || 0;
                const credit = Number(formData.get('credit')) || 0;
                const mode = formData.get('mode') as any || 'Journal';
                
                if (!particulars) {
                  alert('Please enter particulars');
                  return;
                }
                
                const lastBalance = ledger.length > 0 ? ledger[0].balance : 0;
                const newBalance = lastBalance + credit - debit;
                
                const newEntry: LedgerEntry = {
                  id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                  date: new Date().toISOString().split('T')[0],
                  particulars,
                  category: debit > 0 ? 'Expense' : 'Income',
                  mode,
                  debit,
                  credit,
                  balance: newBalance
                };
                
                setLedger([newEntry, ...ledger]);
                setShowJournalModal(false);
                alert('Voucher posted successfully!');
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Particulars</label>
                  <input name="particulars" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="Transaction description..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Mode / Book</label>
                  <select name="mode" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold">
                    <option value="Journal">Journal</option>
                    <option value="Cash">Cashbook</option>
                    <option value="Bank">Bankbook</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Debit (Dr) (₹)</label>
                    <input name="debit" type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-danger" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-secondary mb-1 block">Credit (Cr) (₹)</label>
                    <input name="credit" type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-success" placeholder="0.00" />
                  </div>
                </div>
                <button 
                 type="submit"
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all mt-4"
                >
                  Post Voucher
                </button>
              </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Financial Ledger & Accounts</h2>
          </div>
          <p className="text-secondary text-sm font-medium">Double-entry accounting, P&L statements, and tax reconciliation.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('Tally')}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm ${
              activeTab === 'Tally' ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/20' : 'bg-white border border-gray-200 text-primary hover:bg-gray-50'
            }`}
          >
            <Share2 size={18} /> Tally XML
          </button>
          {canEdit && (
            <button 
              onClick={() => setShowJournalModal(true)}
              className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all"
            >
              <Plus size={20} /> Journal Entry
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-gray-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                   {stat.icon}
                 </div>
                 <div className={`flex items-center gap-1 text-[10px] font-black ${stat.positive ? 'text-success' : 'text-danger'}`}>
                   {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   {stat.change}
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{stat.label}</p>
              <h4 className="text-2xl font-black text-primary mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50/20">
          <div className="flex bg-white rounded-2xl border border-gray-100 p-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'Ledger', label: 'Journal Ledger', icon: <BookOpen size={14} /> },
              { id: 'TrialBalance', label: 'Trial Balance', icon: <Scale size={14} /> },
              { id: 'PL', label: 'Profit & Loss', icon: <TrendingUp size={14} /> },
              { id: 'BalanceSheet', label: 'Balance Sheet', icon: <Building2 size={14} /> },
              { id: 'Contractors', label: 'Contractors', icon: <Briefcase size={14} /> },
              { id: 'Tally', label: 'Tally XML Export', icon: <RefreshCw size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl">
                <Calendar size={14} className="text-secondary" />
                <span className="text-[10px] font-black text-secondary uppercase">FY:</span>
                <select 
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="text-[10px] font-black text-primary bg-transparent outline-none cursor-pointer"
                >
                   {financialYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
             </div>
             {activeTab !== 'Tally' && (
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-6 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent-cyan text-xs font-medium"
                  />
                </div>
             )}
          </div>
        </div>

        <div className="overflow-x-auto font-sans">
          {activeTab === 'Contractors' && (
            <div className="p-8 space-y-8 bg-gray-50/30">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                        <h4 className="text-sm font-black uppercase text-primary">Active Contractors</h4>
                        <div className="space-y-3">
                           {[
                             { name: 'Super Finishing Ltd', type: 'Binding', balance: '₹12,400', jc: 'SOP/JC/012' },
                             { name: 'Global Plates', type: 'Plate Making', balance: '₹8,500', jc: 'SOP/JC/013' },
                             { name: 'Vikas Binding Solutions', type: 'Hardcase', balance: '₹22,100', jc: 'SOP/JC/010' }
                           ].filter(con => 
                             (con.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (con.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (con.jc?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                           ).map((con, i) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-white rounded-xl group-hover:bg-accent-magenta/10 group-hover:text-accent-magenta transition-colors">
                                      <Briefcase size={18} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-primary uppercase">{con.name}</p>
                                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{con.type} • Recent: {con.jc}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-black text-danger">{con.balance}</p>
                                   <button 
                                      onClick={() => setVoucherData({...voucherData, party: con.name, jobId: con.jc})} 
                                      className="text-[9px] font-black uppercase text-accent-cyan hover:underline"
                                    >
                                      Select for Voucher
                                    </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-6">
                      {canEdit && (
                        <div className="bg-primary p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden">
                           <form onSubmit={handleCreateContractorVoucher} className="relative z-10">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">Voucher Creation</h4>
                              <div className="space-y-4">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-bold opacity-60">SELECT CONTRACTOR</label>
                                    <select 
                                       className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                       value={voucherData.party}
                                       onChange={(e) => setVoucherData({...voucherData, party: e.target.value})}
                                     >
                                       <option value="" className="text-primary italic">Select Contractor...</option>
                                       <option value="Super Finishing Ltd" className="text-primary">Super Finishing Ltd</option>
                                       <option value="Global Plates" className="text-primary">Global Plates</option>
                                       <option value="Vikas Binding Solutions" className="text-primary">Vikas Binding Solutions</option>
                                    </select>
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-bold opacity-60">LINK TO JOB CARD</label>
                                    <input 
                                       placeholder="Ex: JC-012" 
                                       className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold outline-none" 
                                       value={voucherData.jobId}
                                       onChange={(e) => setVoucherData({...voucherData, jobId: e.target.value})}
                                     />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-bold opacity-60">AMOUNT (₹)</label>
                                    <input 
                                       type="number" 
                                       placeholder="0.00" 
                                       className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold outline-none font-mono" 
                                       value={voucherData.amount || ''}
                                       onChange={(e) => setVoucherData({...voucherData, amount: Number(e.target.value)})}
                                     />
                                 </div>
                                 <div className="p-3 bg-white/5 rounded-xl text-[9px] font-medium leading-relaxed italic border border-white/10">
                                    TDS @ 2% will be auto-calculated and deducted from the payout ledger.
                                 </div>
                                 <button 
                                   type="submit"
                                   className="w-full py-4 bg-accent-magenta text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent-magenta/20 transition-all hover:scale-105 active:scale-95 leading-none mt-2"
                                 >
                                    Generate Payment Voucher
                                 </button>
                              </div>
                           </form>
                           <Briefcase size={120} className="absolute -right-5 -bottom-5 text-white/5 rotate-12" />
                        </div>
                      )}
                      {!canEdit && (
                         <div className="bg-white border border-gray-100 p-8 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
                            <Lock size={48} className="text-gray-200" />
                            <div>
                               <h4 className="text-sm font-black text-primary uppercase">Read-Only Access</h4>
                               <p className="text-[10px] text-secondary font-bold uppercase tracking-widest max-w-[200px]">Staff users can view ledgers but cannot create vouchers or entries.</p>
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          )}


          {activeTab === 'Ledger' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
                {(['All', 'Cash', 'Bank', 'Journal'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLedgerFilter(f)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ledgerFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:bg-gray-50'}`}
                  >
                    {f === 'All' ? 'General Ledger' : f === 'Cash' ? 'Cashbook' : f === 'Bank' ? 'Bankbook' : 'Journal'}
                  </button>
                ))}
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-secondary">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Particulars / Transaction</th>
                    <th className="px-8 py-5 text-right">Debit (Dr)</th>
                    <th className="px-8 py-5 text-right">Credit (Cr)</th>
                    <th className="px-8 py-5 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ledger.filter(txn => {
                    const matchesFilter = ledgerFilter === 'All' || txn.mode === ledgerFilter;
                    const matchesSearch = (txn.particulars?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                          (txn.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                          (txn.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                    return matchesFilter && matchesSearch;
                  }).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50/30 transition-all group">
                      <td className="px-8 py-6 text-sm font-bold text-secondary">{txn.date}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary italic opacity-80">{txn.particulars}</span>
                          <span className={`text-[9px] font-black uppercase mt-1 px-1.5 py-0.5 rounded w-fit ${
                            txn.category === 'Income' ? 'bg-success/10 text-success' :
                            txn.category === 'Expense' ? 'bg-danger/10 text-danger' : 'bg-primary/5 text-primary'
                          }`}>
                            {txn.category} • {txn.mode}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`font-black text-sm ${txn.debit > 0 ? 'text-danger' : 'text-secondary opacity-30'}`}>
                          {txn.debit > 0 ? `₹${txn.debit.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`font-black text-sm ${txn.credit > 0 ? 'text-success' : 'text-secondary opacity-30'}`}>
                          {txn.credit > 0 ? `₹${txn.credit.toLocaleString()}` : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="font-black text-primary text-base tracking-tighter">₹{txn.balance.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Tally' && (
            <div className="p-12 bg-gray-50/30">
               <div className="max-w-4xl mx-auto space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="p-4 bg-accent-magenta/10 text-accent-magenta rounded-2xl">
                              <Download size={24} />
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-primary uppercase">Manual Data Import</h4>
                              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Import XML/Excel from Tally</p>
                           </div>
                        </div>

                        <div className="pt-4 space-y-4">
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-[28px] cursor-pointer hover:bg-gray-50 transition-all group overflow-hidden relative">
                              <div className="flex flex-col items-center justify-center pt-2">
                                 {uploadStatus === 'idle' && (
                                   <>
                                     <Download className="text-secondary opacity-30 group-hover:text-accent-magenta transform transition-all group-hover:-translate-y-1" size={32} />
                                     <p className="mt-2 text-[10px] font-black uppercase text-secondary tracking-widest italic group-hover:text-accent-magenta">Select Tally Export File</p>
                                   </>
                                 )}
                                 {uploadStatus === 'uploading' && (
                                   <RefreshCw className="text-accent-cyan animate-spin" size={32} />
                                 )}
                                 {uploadStatus === 'success' && (
                                   <CheckCircle2 className="text-success" size={32} />
                                 )}
                                 {uploadStatus === 'error' && (
                                   <AlertCircle className="text-danger" size={32} />
                                 )}
                              </div>
                              <input type='file' className="hidden" accept=".xml,.xls,.xlsx" onChange={handleFileUpload} />
                              
                              {uploadStatus === 'error' && (
                                <p className="absolute bottom-4 text-[8px] font-black uppercase text-danger">Unsupported Format (Use .XML or .XLSX)</p>
                              )}
                              {uploadStatus === 'success' && (
                                <p className="absolute bottom-4 text-[8px] font-black uppercase text-success">Import Complete</p>
                              )}
                           </label>
                           <p className="text-[9px] text-secondary font-medium leading-relaxed italic text-center px-4">
                             Extract data from Tally via <span className="font-bold">Display ➔ Daybook ➔ Export (Alt+E)</span> and upload here for reconciliation.
                           </p>
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="p-4 bg-accent-cyan/10 text-accent-cyan rounded-2xl">
                              <FileCode size={24} />
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-primary uppercase">XML Generation</h4>
                              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Tally-Prime Ready Files</p>
                           </div>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <p className="text-[10px] text-secondary font-medium leading-relaxed">
                               Generate and download XML files that can be directly imported into Tally. This ensures your book-keeping is consistent across platforms without manual data entry.
                             </p>
                           </div>

                           <button 
                             onClick={() => handleDownload('xml')}
                             className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:bg-accent-cyan"
                           >
                             Generate Master XML
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-primary p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                     <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl group-hover:scale-110 transition-transform duration-700">
                        <FileCode size={40} className="text-accent-cyan" />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Accounting Compliance</h4>
                        <p className="text-white/60 text-sm font-medium leading-relaxed italic max-w-xl">
                          Ensure your sales invoices and journal vouchers are formatted correctly. Tally XML exports follow the standard accounting schema for seamless ingestion.
                        </p>
                     </div>
                     <RefreshCw size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'Contractors' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-primary uppercase italic tracking-tighter">Contractor Balances</h3>
                  <div className="flex gap-2">
                     <button className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">+ Add Party</button>
                  </div>
               </div>
               <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-black text-secondary">
                           <th className="p-6">Contractor / Party Name</th>
                           <th className="p-6">Major Category</th>
                           <th className="p-6">Current Balance</th>
                           <th className="p-6">Status</th>
                           <th className="p-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {[
                          { name: 'Vikas Binding Solutions', category: 'Binding/Post-Press', balance: 35400, status: 'Active' },
                          { name: 'Fine Prints Ltd', category: 'Plate Making', balance: -12500, status: 'Active' },
                          { name: 'Paper House Vendors', category: 'Raw Materials', balance: 88200, status: 'Active' },
                        ].map((party, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-all">
                             <td className="p-6 font-bold text-primary">{party.name}</td>
                             <td className="p-6 text-xs font-medium text-secondary italic">{party.category}</td>
                             <td className="p-6 font-black text-sm">₹{Math.abs(party.balance).toLocaleString()} <span className="text-[10px] opacity-40">{party.balance > 0 ? 'Cr' : 'Dr'}</span></td>
                             <td className="p-6">
                                <span className="text-[9px] font-black uppercase px-2 py-1 bg-success/10 text-success rounded-lg">{party.status}</span>
                             </td>
                             <td className="p-6 text-right">
                                <button className="px-4 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">View Ledger</button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab !== 'Ledger' && activeTab !== 'Tally' && activeTab !== 'Contractors' && (
            <div className="p-12 space-y-8 bg-gray-50/10 max-w-5xl mx-auto">
               {activeTab === 'TrialBalance' && (
                 <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-secondary divide-x divide-gray-100">
                         <th className="p-6">Ledger Account</th>
                         <th className="p-6 text-right">Debit Balance (₹)</th>
                         <th className="p-6 text-right">Credit Balance (₹)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 text-sm font-bold text-primary divide-x divide-gray-100">
                       {trialBalance.map((acc, i) => (
                         <tr key={i}>
                           <td className="p-6">{acc.name}</td>
                           <td className="p-6 text-right">{acc.debit > 0 ? acc.debit.toLocaleString() : '-'}</td>
                           <td className="p-6 text-right">{acc.credit > 0 ? acc.credit.toLocaleString() : '-'}</td>
                         </tr>
                       ))}
                       <tr>
                         <td className="p-6 font-black bg-gray-50 uppercase text-[10px]">Total Balance</td>
                         <td className="p-6 text-right font-black bg-gray-50">₹{totalTrialBalance.debit.toLocaleString()}</td>
                         <td className="p-6 text-right font-black bg-gray-50">₹{totalTrialBalance.credit.toLocaleString()}</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               )}
               {activeTab === 'PL' && (
                 <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 bg-primary text-white flex justify-between items-center">
                       <h4 className="font-black uppercase text-xs tracking-widest">Statement of Profit & Loss</h4>
                       <span className="text-[10px] font-bold opacity-60">For the period ending {new Date().toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})}</span>
                    </div>
                    <table className="w-full text-left">
                       <tbody className="text-sm">
                          <tr className="bg-gray-50/50"><td className="p-6 font-black uppercase text-[10px] text-secondary" colSpan={2}>Income / Revenue</td></tr>
                          <tr className="border-b"><td className="p-6 font-bold">Revenue from Operations (Sales)</td><td className="p-6 text-right font-black">₹{financialSummary.income.toLocaleString()}</td></tr>
                          <tr className="border-b"><td className="p-6 font-bold">Other Income</td><td className="p-6 text-right font-black">₹0</td></tr>
                          <tr className="bg-gray-50/50"><td className="p-6 font-black uppercase text-[10px] text-secondary" colSpan={2}>Expenses</td></tr>
                          <tr className="border-b"><td className="p-6 font-bold">Total Operating Expenses</td><td className="p-6 text-right font-black">(₹{financialSummary.expense.toLocaleString()})</td></tr>
                          <tr className="bg-primary/5"><td className="p-6 font-black text-primary uppercase">Net Profit / (Loss)</td><td className={`p-6 text-right font-black ${financialSummary.profit >= 0 ? 'text-success' : 'text-danger'} text-lg`}>₹{financialSummary.profit.toLocaleString()}</td></tr>
                       </tbody>
                    </table>
                 </div>
               )}
               {activeTab === 'BalanceSheet' && (
                 <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 bg-accent-cyan text-white flex justify-between items-center">
                       <h4 className="font-black uppercase text-xs tracking-widest">Balance Sheet</h4>
                       <span className="text-[10px] font-bold opacity-60">As on {new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                       <div>
                          <p className="p-4 bg-gray-50 text-[10px] font-black uppercase text-secondary">Liabilities & Equity</p>
                          <table className="w-full text-sm">
                             <tbody>
                                <tr className="border-b"><td className="p-4 font-bold">Capital Account</td><td className="p-4 text-right font-black">₹5,00,000</td></tr>
                                <tr className="border-b"><td className="p-4 font-bold">Retained Earnings / Profit</td><td className="p-4 text-right font-black">₹{financialSummary.profit.toLocaleString()}</td></tr>
                                <tr className="border-b"><td className="p-4 font-bold">Current Liabilities</td><td className="p-4 text-right font-black">₹{financialSummary.liab.toLocaleString()}</td></tr>
                                <tr className="bg-gray-100/50"><td className="p-4 font-black uppercase text-[10px]">Total Liabilities</td><td className="p-4 text-right font-black">₹{(500000 + financialSummary.profit + financialSummary.liab).toLocaleString()}</td></tr>
                             </tbody>
                          </table>
                       </div>
                       <div>
                          <p className="p-4 bg-gray-50 text-[10px] font-black uppercase text-secondary">Assets</p>
                          <table className="w-full text-sm">
                             <tbody>
                                <tr className="border-b"><td className="p-4 font-bold">Current Assets (Bank/Cash)</td><td className="p-4 text-right font-black">₹{financialSummary.assets.toLocaleString()}</td></tr>
                                <tr className="border-b"><td className="p-4 font-bold">Fixed Assets</td><td className="p-4 text-right font-black">₹0</td></tr>
                                <tr className="bg-gray-100/50"><td className="p-4 font-black uppercase text-[10px]">Total Assets</td><td className="p-4 text-right font-black">₹{financialSummary.assets.toLocaleString()}</td></tr>
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Data Export Console */}
      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter mb-2">Accounting Export Console</h3>
            <p className="text-secondary text-sm font-medium leading-relaxed italic max-w-2xl mx-auto md:mx-0">
              Export your entire financial footprint for audits, statutory compliance, or legacy systems. Our <span className="font-bold text-primary">Tally XML</span> is compatible with TallyPrime standard voucher imports.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
            <button 
              onClick={() => handleDownload('pdf')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-primary border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:shadow-xl transition-all"
            >
              <FileText size={16} className="text-danger" /> Download PDF
            </button>
            <button 
              onClick={() => handleDownload('excel')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-primary border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:shadow-xl transition-all"
            >
              <Download size={16} className="text-success" /> Export Excel
            </button>
            <button 
              onClick={() => handleDownload('xml')}
              disabled={isSyncing}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-cyan shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <FileCode size={16} className="text-accent-cyan" />}
              Tally XML Import
            </button>
          </div>
        </div>
        <Share2 size={240} className="absolute -right-20 -bottom-20 text-gray-50/5 opacity-40 -rotate-12 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-black text-primary font-sans uppercase tracking-widest">Bank Reconciliation</h3>
                 <button 
                  onClick={() => setIsBankModalOpen(true)}
                  className="p-2 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                 >
                   <Plus size={16} />
                 </button>
              </div>
              <p className="text-secondary text-sm font-medium mb-8">Match your cashbook with bank statements automatically.</p>
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                 {banks.map((bank: any) => (
                   <div key={bank.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-accent-cyan/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-lg text-accent-cyan shadow-sm">
                            <Landmark size={20} />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-black text-primary uppercase">{bank.name}</p>
                            <p className="text-[10px] text-secondary font-bold font-mono">{bank.accountNo} • {bank.branch}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-primary">₹{bank.balance.toLocaleString()}</p>
                         <p className="text-[10px] text-success font-black uppercase tracking-tighter">{bank.status}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <button 
            onClick={() => {
              setIsSyncing(true);
              setTimeout(() => {
                alert('Auto-reconciliation complete. 12 matching transactions found.');
                setIsSyncing(false);
              }, 1500);
            }}
            className="mt-8 w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all"
           >
             {isSyncing ? 'Reconciling...' : 'Start Auto-Recon'}
           </button>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-dark p-10 rounded-[40px] text-white relative overflow-hidden group">
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Tax Liability Projection</p>
                 <h3 className="text-3xl font-black font-sans">₹1,45,200</h3>
                 <p className="text-xs font-bold opacity-40 mt-1 italic tracking-widest uppercase italic">Provisioned GST for Apr-Jun</p>
              </div>
              
              <div className="mt-12 space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>Tax Saved (ITC)</span>
                    <span className="text-success">₹18,400</span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan w-[45%]" />
                 </div>
              </div>
           </div>
           <TrendingUp size={200} className="absolute -right-10 -bottom-10 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-1000" />
        </div>
      </div>
      {/* Bank Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-black uppercase text-primary mb-6">Provision Bank Account</h3>
              <form onSubmit={handleAddBank} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-secondary">Bank Name</label>
                   <input name="name" required placeholder="e.g. ICICI Corporate" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-secondary">Account Branch</label>
                   <input name="branch" required placeholder="Branch Location" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-secondary">Account Number</label>
                   <input name="accountNo" required placeholder="Full Account Number" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-mono" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-secondary">Opening Balance (₹)</label>
                   <input name="balance" type="number" placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-black text-primary" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsBankModalOpen(false)} className="flex-1 py-4 border rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-cyan transition-all shadow-xl shadow-primary/20">Add Bank Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
