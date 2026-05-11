import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Phone, Mail, MapPin, Search, Plus, X, 
  Wallet, Briefcase, Contact, Wrench, History, CheckCircle2,
  Calendar, FileText, ArrowRight, UserCheck, AlertCircle,
  Landmark
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Operator' | 'Helper' | 'Manager' | 'Accountant' | 'Sales';
  department: string;
  phone: string;
  email: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  doj: string;
  advanceBalance: number;
  loanBalance: number;
  attendanceDays: number;
  totalDays: number;
}

interface PaymentRecord {
  id: string;
  employeeId: string;
  type: 'Advance' | 'Loan';
  amount: number;
  date: string;
  forMonth: string;
  reason: string;
  repaymentMonths?: number;
}

interface ExternalContact {
  id: string;
  name: string;
  type: 'Service Engineer' | 'Past Staff' | 'Vendor Support' | 'Others';
  specialty?: string;
  phone: string;
  email: string;
  organization?: string;
}

const mockEmployees: Employee[] = [
  { id: 'EMP-001', name: 'Rahul Sharma', role: 'Operator', department: 'Production', phone: '+91 9876543210', email: 'rahul@press.com', salary: 25000, status: 'Active', doj: '2022-01-15', advanceBalance: 0, loanBalance: 0, attendanceDays: 26, totalDays: 26 },
  { id: 'EMP-002', name: 'Anita Singh', role: 'Accountant', department: 'Finance', phone: '+91 9876543211', email: 'anita@press.com', salary: 35000, status: 'Active', doj: '2021-11-01', advanceBalance: 2000, loanBalance: 0, attendanceDays: 26, totalDays: 26 },
  { id: 'EMP-003', name: 'Vikram Das', role: 'Helper', department: 'Production', phone: '+91 9876543212', email: 'vikram@press.com', salary: 15000, status: 'Active', doj: '2023-05-10', advanceBalance: 0, loanBalance: 0, attendanceDays: 26, totalDays: 26 },
];

const mockContacts: ExternalContact[] = [
  { id: 'CON-001', name: 'Amit Kumar', type: 'Service Engineer', specialty: 'Heidelberg SM 74', phone: '+91 9123456789', email: 'amit@service.com', organization: 'TechFix Graphics' },
  { id: 'CON-002', name: 'Suresh Raina', type: 'Past Staff', phone: '+91 9123456780', email: 'suresh@mail.com', organization: 'Former Offset Lead' },
];

const mockLedger = [
  { id: 'TXN-001', date: '2024-03-24', particulars: 'Opening Balance', category: 'Asset', mode: 'Bank', debit: 0, credit: 0, balance: 145000 }
];

export default function StaffModule() {
  const [activeSubTab, setActiveSubTab] = useState<'Employees' | 'Payroll' | 'ContactBook'>('Employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isHistoryViewOpen, setIsHistoryViewOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<Employee | null>(null);
  const [selectedStaffForAdvance, setSelectedStaffForAdvance] = useState<Employee | null>(null);
  const [selectedStaffForAttendance, setSelectedStaffForAttendance] = useState<Employee | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('printing_pms_staff');
    return saved ? JSON.parse(saved) : mockEmployees;
  });

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('printing_pms_salary_advances');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_staff', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('printing_pms_salary_advances', JSON.stringify(paymentRecords));
  }, [paymentRecords]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const phone = formData.get('phone') as string;

    // Validate Phone (at least 10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('ALERT: Phone number must have at least 10 digits.');
      return;
    }
    setPhoneError('');

    const newMember: Employee = {
      id: `EMP-00${employees.length + 1}`,
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      department: formData.get('department') as string,
      phone: phone,
      email: formData.get('email') as string || `${(formData.get('name') as string).split(' ')[0].toLowerCase()}@press.com`,
      salary: Number(formData.get('salary')),
      status: 'Active',
      doj: new Date().toISOString().split('T')[0],
      advanceBalance: 0,
      loanBalance: 0,
      attendanceDays: 26,
      totalDays: 26
    };
    
    const updatedEmployees = [...employees, newMember];
    setEmployees(updatedEmployees);
    
    setOnboardSuccess(true);
    setTimeout(() => {
      setOnboardSuccess(false);
      setIsModalOpen(false);
    }, 2000);
  };

  const [banks] = useState(() => {
    const saved = localStorage.getItem('printing_pms_banks');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'HDFC Current A/c', branch: 'Nariman Point', accountNo: '**** 4291', balance: 345000, status: 'Synced' },
      { id: '2', name: 'SBI Corporate', branch: 'Pune Main', accountNo: '**** 8832', balance: 197000, status: 'Synced' }
    ];
  });

  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');

  const postToLedger = (particulars: string, amount: number, isExpense: boolean, mode: 'Cash' | 'Bank' | 'Journal' = 'Bank') => {
    const savedLedger = localStorage.getItem('printing_pms_ledger');
    const ledger = savedLedger ? JSON.parse(savedLedger) : mockLedger;
    const selectedBank = banks.find(b => b.id === selectedBankId);

    const lastBalance = ledger.length > 0 ? ledger[0].balance : 0;
    const newBalance = isExpense ? lastBalance - amount : lastBalance + amount;

    const newEntry = {
      id: `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      particulars: mode === 'Bank' && selectedBank ? `${particulars} (${selectedBank.name})` : particulars,
      category: isExpense ? 'Expense' : 'Income',
      mode: mode,
      debit: isExpense ? amount : 0,
      credit: isExpense ? 0 : amount,
      balance: newBalance
    };

    localStorage.setItem('printing_pms_ledger', JSON.stringify([newEntry, ...ledger]));

    if (mode === 'Bank' && selectedBank) {
      const updatedBanks = banks.map(b => 
        b.id === selectedBankId ? { ...b, balance: b.balance - amount } : b
      );
      localStorage.setItem('printing_pms_banks', JSON.stringify(updatedBanks));
    }
  };

  const handleBatchRelease = () => {
    if (confirm('Are you sure you want to release payroll for all active employees?')) {
      let totalPayout = 0;
      employees.forEach(emp => {
        if (emp.status === 'Active') {
          const attendanceFactor = emp.attendanceDays / emp.totalDays;
          const payout = Math.round((emp.salary * attendanceFactor) - emp.advanceBalance);
          totalPayout += payout;
        }
      });
      
      postToLedger(`Payroll Release: ${new Date().toLocaleString('default', { month: 'long' })} 2024`, totalPayout, true, 'Bank');
      alert(`Payroll released successfully! Total ₹${totalPayout.toLocaleString()} posted to Bankbook.`);
    }
  };

  const handleApproveSlip = (emp: Employee) => {
    const attendanceFactor = emp.attendanceDays / emp.totalDays;
    const payout = Math.round((emp.salary * attendanceFactor) - emp.advanceBalance);
    postToLedger(`Salary Payout: ${emp.name} (${emp.id})`, payout, true, 'Bank');
    
    // Clear advance after payout
    if (emp.advanceBalance > 0) {
      setEmployees(employees.map(e => e.id === emp.id ? { ...e, advanceBalance: 0 } : e));
    }
    
    alert(`Salary Slip for ${emp.name} approved and transaction posted to Bankbook.`);
    setIsSlipModalOpen(false);
  };

  const handleViewSlip = (emp: Employee) => {
    setSelectedStaffForSlip(emp);
    setIsSlipModalOpen(true);
  };

  const handlePayAdvance = (emp: Employee) => {
    setSelectedStaffForAdvance(emp);
    setIsAdvanceModalOpen(true);
  };
  
  const handleEditAttendance = (emp: Employee) => {
    setSelectedStaffForAttendance(emp);
    setIsAttendanceModalOpen(true);
  };

  const handleUpdateAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForAttendance) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const present = Number(formData.get('presentDays'));
    const total = Number(formData.get('totalDays'));

    setEmployees(employees.map(emp => 
      emp.id === selectedStaffForAttendance.id 
        ? { ...emp, attendanceDays: present, totalDays: total }
        : emp
    ));
    setIsAttendanceModalOpen(false);
  };

  const [payAdvanceType, setPayAdvanceType] = useState<'Advance' | 'Loan'>('Advance');
  
  const handleSubmitAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForAdvance) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const amount = Number(formData.get('amount'));
    const type = payAdvanceType;
    const date = formData.get('date') as string;
    const forMonth = formData.get('forMonth') as string;
    const reason = formData.get('reason') as string;
    const repaymentMonths = Number(formData.get('repaymentMonths')) || 0;
    
    if (amount <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    const newRecord: PaymentRecord = {
      id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      employeeId: selectedStaffForAdvance.id,
      type,
      amount,
      date,
      forMonth,
      reason,
      repaymentMonths: type === 'Loan' ? repaymentMonths : undefined
    };

    setPaymentRecords([newRecord, ...paymentRecords]);

    setEmployees(employees.map(emp => 
      emp.id === selectedStaffForAdvance.id 
        ? { 
            ...emp, 
            advanceBalance: type === 'Advance' ? emp.advanceBalance + amount : emp.advanceBalance,
            loanBalance: type === 'Loan' ? emp.loanBalance + amount : emp.loanBalance
          }
        : emp
    ));
    
    postToLedger(`${type} Paid: ${selectedStaffForAdvance.name} (${selectedStaffForAdvance.id})`, amount, true, 'Cash');
    
    alert(`Success: ₹${amount.toLocaleString()} ${type} paid to ${selectedStaffForAdvance.name}. Transaction posted to Cashbook.`);
    setIsAdvanceModalOpen(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = mockContacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.organization?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.specialty?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-xl w-full border border-gray-100 font-sans">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-primary uppercase italic">Onboard New Team Member</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setPhoneError('');
                  setOnboardSuccess(false);
                }} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {onboardSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center space-y-4">
                 <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                 </div>
                 <h4 className="text-xl font-black text-primary uppercase italic">Onboarding Successful</h4>
                 <p className="text-secondary text-sm font-medium">Adding member to team registry and preparing payroll workspace...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Full Name</label>
                  <input name="name" required placeholder="Ex: Rahul Sharma" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Role</label>
                  <select name="role" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm uppercase">
                    <option value="Operator">Operator</option>
                    <option value="Helper">Helper</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Department</label>
                  <input name="department" defaultValue="Production" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Phone Number</label>
                    <input 
                      name="phone" 
                      required 
                      placeholder="9876543210"
                      onChange={() => setPhoneError('')}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none font-bold transition-all ${phoneError ? 'border-danger ring-4 ring-danger/10' : 'border-gray-100'}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Base Salary (Monthly)</label>
                    <input name="salary" type="number" required placeholder="₹" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                </div>
                
                {phoneError && (
                  <div className="col-span-2">
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-danger italic flex items-center gap-2 bg-danger/5 p-3 rounded-xl border border-danger/20">
                      <AlertCircle size={12} /> {phoneError}
                    </motion.p>
                  </div>
                )}
                
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all flex items-center justify-center gap-2 group">
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> Onboard Member
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {isSlipModalOpen && selectedStaffForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsSlipModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-12 max-w-lg w-full border border-gray-100 font-sans text-primary">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">PPMS Salary Advice</h2>
               <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
            
            <div className="space-y-6">
               <div className="flex justify-between border-b border-gray-100 pb-4">
                  <div>
                     <p className="text-[10px] font-black text-secondary tracking-widest">EMPLOYEE</p>
                     <p className="font-black italic uppercase">{selectedStaffForSlip.name}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-secondary tracking-widest">EMP ID</p>
                     <p className="font-black italic uppercase">{selectedStaffForSlip.id}</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="font-bold text-secondary">Basic Salary</span>
                     <span className="font-black">₹{selectedStaffForSlip.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="font-bold text-secondary">Attendance ({selectedStaffForSlip.attendanceDays}/{selectedStaffForSlip.totalDays})</span>
                     <span className={`font-black ${selectedStaffForSlip.attendanceDays < selectedStaffForSlip.totalDays ? 'text-danger' : 'text-success'}`}>
                       {selectedStaffForSlip.attendanceDays < selectedStaffForSlip.totalDays ? 'Partial' : 'Regular'}
                     </span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="font-bold text-secondary">Adjusted Salary</span>
                     <span className="font-black">₹{(selectedStaffForSlip.salary * (selectedStaffForSlip.attendanceDays / selectedStaffForSlip.totalDays)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="font-bold text-secondary">Deductions (Advance)</span>
                     <span className="font-black text-danger">₹{selectedStaffForSlip.advanceBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                     <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Select Bank Account</span>
                     <select 
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="text-xs font-black bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none"
                     >
                       {banks.map((b: any) => (
                         <option key={b.id} value={b.id}>{b.name} (₹{b.balance?.toLocaleString()})</option>
                       ))}
                     </select>
                  </div>
               </div>

               <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center mt-8">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Net Payout</span>
                  <span className="text-2xl font-black text-primary">₹{(
                    (selectedStaffForSlip.salary * (selectedStaffForSlip.attendanceDays / selectedStaffForSlip.totalDays)) - selectedStaffForSlip.advanceBalance
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
               </div>
            </div>

            <div className="flex gap-3 mt-8">
               <button onClick={() => window.print()} className="flex-1 py-4 border-2 border-primary text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-dark hover:text-white transition-all">Print</button>
               <button 
                 onClick={() => handleApproveSlip(selectedStaffForSlip)}
                 className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all"
               >
                 Approve & Post to Ledger
               </button>
            </div>
            <button onClick={() => setIsSlipModalOpen(false)} className="w-full mt-3 py-2 text-secondary font-bold text-xs uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity">Dismiss</button>
          </motion.div>
        </div>
      )}

      {isAdvanceModalOpen && selectedStaffForAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsAdvanceModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full border border-gray-100 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-primary uppercase italic flex items-center gap-3">
                 <Wallet size={24} className="text-accent-cyan" /> PAY CASH ADVANCE
              </h3>
              <button 
                onClick={() => setIsHistoryViewOpen(true)}
                className="px-5 py-2.5 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-secondary transition-all flex items-center gap-2 shadow-sm"
              >
                <History size={14} /> History
              </button>
            </div>
            
            <div className="mb-8 p-6 bg-gray-50/50 rounded-[32px] border border-gray-100">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] leading-none mb-2">PAYING TO:</p>
                    <p className="text-2xl font-black text-primary italic uppercase tracking-tighter leading-none">{selectedStaffForAdvance.name}</p>
                    <p className="text-[10px] font-bold text-secondary uppercase mt-2">Current Balance: ₹{selectedStaffForAdvance.advanceBalance + selectedStaffForAdvance.loanBalance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] leading-none mb-2">EMP ID:</p>
                    <p className="text-sm font-black text-primary italic uppercase">{selectedStaffForAdvance.id}</p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmitAdvance} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">Type of Disbursal</label>
                  <select 
                    name="type" 
                    value={payAdvanceType}
                    onChange={(e) => setPayAdvanceType(e.target.value as any)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm uppercase focus:ring-4 focus:ring-accent-cyan/10 transition-all shadow-sm h-[56px]"
                  >
                    <option value="Advance">Salary Advance</option>
                    <option value="Loan">Professional Loan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">Date of Adv. Paid</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm h-[56px] focus:ring-4 focus:ring-accent-cyan/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">Advance Amount (₹)</label>
                  <input name="amount" type="number" required placeholder="5000" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-2xl text-primary italic h-[56px] focus:ring-4 focus:ring-accent-cyan/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">For Which Month</label>
                  <select name="forMonth" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm uppercase h-[56px] focus:ring-4 focus:ring-accent-cyan/10 appearance-none">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m} selected={m === new Date().toLocaleString('default', { month: 'long' })}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {payAdvanceType === 'Loan' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">Repayment Duration (Months)</label>
                  <input name="repaymentMonths" type="number" defaultValue="12" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm h-[56px] focus:ring-4 focus:ring-accent-cyan/10" />
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary tracking-widest ml-1">Reason / Memo</label>
                <input name="reason" placeholder="Ex: Medical, Family trip, Emergency" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold h-[56px] focus:ring-4 focus:ring-accent-cyan/10" />
              </div>
              
              <div className="p-5 bg-primary/5 rounded-[32px] border border-primary/10">
                <p className="text-[10px] font-medium text-primary italic leading-relaxed text-center">
                  * This amount will be tracked as an <span className="font-bold underline italic">Asset</span> and can be deducted from the next payroll cycle.
                </p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-secondary rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-200 transition-all">Close</button>
                <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all">Disburse Cash</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isHistoryViewOpen && selectedStaffForAdvance && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsHistoryViewOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-2xl w-full border border-gray-100 font-sans max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-primary uppercase italic leading-none">Financial History</h3>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">Transaction audit for {selectedStaffForAdvance.name}</p>
               </div>
               <button onClick={() => setIsHistoryViewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
               {paymentRecords.filter(r => r.employeeId === selectedStaffForAdvance.id).length > 0 ? (
                 paymentRecords.filter(r => r.employeeId === selectedStaffForAdvance.id).map(record => (
                   <div key={record.id} className="p-5 bg-gray-50 border border-gray-100 rounded-3xl flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex gap-4 items-center">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-sm ${record.type === 'Advance' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-primary/10 text-primary'}`}>
                            {record.type.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-primary italic uppercase underline decoration-2 decoration-gray-200 underline-offset-4">{record.type}: ₹{record.amount.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-secondary mt-1">
                               {record.date} • For {record.forMonth}
                               {record.type === 'Loan' && record.repaymentMonths && (
                                 <span className="text-accent-cyan ml-2">• {record.repaymentMonths} Mo. Loan</span>
                               )}
                            </p>
                            {record.reason && <p className="text-[10px] text-primary italic mt-0.5 opacity-60">“{record.reason}”</p>}
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-black uppercase text-secondary tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">{record.id}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="py-20 text-center opacity-40">
                    <History size={40} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No transaction history found</p>
                 </div>
               )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Total Disbursed:</p>
                  <p className="text-xl font-black text-primary italic uppercase tracking-tighter">
                    ₹{paymentRecords.filter(r => r.employeeId === selectedStaffForAdvance.id).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </p>
               </div>
               <button onClick={() => setIsHistoryViewOpen(false)} className="px-8 py-3 bg-gray-100 text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px]">Done</button>
            </div>
          </motion.div>
        </div>
      )}

      {isAttendanceModalOpen && selectedStaffForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsAttendanceModalOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full border border-gray-100 font-sans text-primary">
            <h3 className="text-xl font-black text-primary uppercase italic mb-6">Update Attendance</h3>
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Employee:</p>
               <p className="text-sm font-black italic uppercase">{selectedStaffForAttendance.name}</p>
            </div>
            <form onSubmit={handleUpdateAttendance} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary">Present Days</label>
                    <input name="presentDays" type="number" step="0.5" defaultValue={selectedStaffForAttendance.attendanceDays} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary">Total Days</label>
                    <input name="totalDays" type="number" defaultValue={selectedStaffForAttendance.totalDays} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                 </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all">Save Attendance</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-primary">Human Resources & Contacts</h2>
          <p className="text-secondary text-sm font-medium">Manage employees, payroll, and professional network.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
             <input 
               type="text" 
               placeholder="Search talent..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 focus:ring-accent-cyan" 
             />
          </div>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-primary hover:bg-accent-cyan text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-primary/20 transition-all font-sans"
          >
            <UserPlus size={20} /> Add Member
          </button>
        </div>
      </div>

      <div className="flex bg-white rounded-2xl border border-gray-100 p-1 w-fit">
        {[
          { id: 'Employees', label: 'Team', icon: <Users size={14} /> },
          { id: 'Payroll', label: 'Salary/Payroll', icon: <Wallet size={14} /> },
          { id: 'ContactBook', label: 'Contact Book', icon: <Contact size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              activeSubTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'Employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all font-black text-xl italic uppercase">
                       {emp.name.charAt(0)}
                    </div>
                    <div>
                       <h4 className="font-black text-primary uppercase text-lg italic">{emp.name}</h4>
                       <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{emp.role} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="p-2 bg-success/10 text-success rounded-full">
                     <UserCheck size={14} />
                  </div>
               </div>
               
               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-secondary">
                     <Phone size={14} className="opacity-40" />
                     <span className="text-xs font-bold">{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-secondary">
                     <Mail size={14} className="opacity-40" />
                     <span className="text-xs font-bold">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-secondary">
                     <Calendar size={14} className="opacity-40" />
                     <span className="text-xs font-bold italic">Joined: {emp.doj}</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase text-secondary opacity-50">Base Salary</p>
                    <p className="text-lg font-black text-primary">₹{emp.salary.toLocaleString()}</p>
                  </div>
                  <button className="p-3 bg-gray-50 rounded-2xl text-secondary hover:bg-primary hover:text-white transition-all">
                     <ArrowRight size={16} />
                  </button>
               </div>
               
               <Users size={160} className="absolute -right-10 -bottom-10 text-gray-50/5 opacity-40 -rotate-12 pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'Payroll' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden font-sans">
           <div className="p-8 border-b border-gray-100 bg-gray-50/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                 <h3 className="text-xl font-black text-primary uppercase italic">Monthly Payroll Engine</h3>
                 <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Generating payouts for {new Date().toLocaleString('default', { month: 'long' })} 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl">
                   <Landmark size={14} className="text-secondary" />
                   <span className="text-[9px] font-black text-secondary uppercase">PAY FROM:</span>
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
                  onClick={handleBatchRelease}
                  className="px-6 py-3 bg-primary hover:bg-accent-cyan transition-colors text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                   <Wallet size={16} /> Batch Release All
                </button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-secondary tracking-widest border-b border-gray-50">
                    <th className="px-8 py-5">Employee</th>
                    <th className="px-8 py-5">Attendance</th>
                    <th className="px-8 py-5">Advances</th>
                    <th className="px-8 py-5">Net Payable</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-primary italic uppercase">{emp.name}</span>
                           <span className="text-[10px] font-bold text-secondary uppercase">{emp.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-1 ${emp.attendanceDays < emp.totalDays ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'} text-[10px] font-black rounded`}>
                             {emp.attendanceDays} / {emp.totalDays} days
                           </span>
                           <button 
                             onClick={() => handleEditAttendance(emp)}
                             className="p-1 hover:bg-gray-100 rounded text-secondary transition-colors"
                           >
                             <History size={12} />
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className={`text-sm font-bold ${emp.advanceBalance > 0 ? 'text-danger' : 'text-secondary opacity-30'}`}>₹{emp.advanceBalance.toLocaleString()}</span>
                            <button 
                              onClick={() => handlePayAdvance(emp)}
                              className="text-[8px] font-black uppercase text-accent-cyan hover:underline w-fit"
                            >
                               Pay Advance
                            </button>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-primary">₹{(emp.salary - emp.advanceBalance).toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleViewSlip(emp)}
                          className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all underline decoration-accent-cyan decoration-2 underline-offset-4"
                        >
                           Generate Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeSubTab === 'ContactBook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <h3 className="text-lg font-black text-primary uppercase italic flex items-center gap-3">
                 <Wrench className="text-accent-cyan" /> Service Engineers
              </h3>
              <div className="space-y-4">
                 {filteredContacts.filter(c => c.type === 'Service Engineer').map(c => (
                   <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-accent-cyan/10 text-accent-cyan rounded-2xl flex items-center justify-center font-black">
                            <Wrench size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-primary">{c.name}</p>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{c.specialty} • {c.organization}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert(`Dialing ${c.name}: ${c.phone}`)}
                          className="p-2 bg-gray-50 rounded-xl text-primary hover:bg-accent-cyan hover:text-white transition-all"
                        >
                          <Phone size={14} />
                        </button>
                        <button 
                          onClick={() => alert(`Composing email to ${c.name}: ${c.email}`)}
                          className="p-2 bg-gray-50 rounded-xl text-primary hover:bg-accent-cyan hover:text-white transition-all"
                        >
                          <Mail size={14} />
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-lg font-black text-primary uppercase italic flex items-center gap-3">
                 <History className="text-accent-magenta" /> Past Staff Record
              </h3>
              <div className="space-y-4">
                 {filteredContacts.filter(c => c.type === 'Past Staff').map(c => (
                   <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-accent-magenta/10 text-accent-magenta rounded-2xl flex items-center justify-center font-black italic">
                            {c.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-primary">{c.name}</p>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Ex-{c.organization}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => alert(`Calling former staff ${c.name}: ${c.phone}`)}
                           className="p-2 bg-gray-50 rounded-xl text-primary hover:bg-accent-magenta hover:text-white transition-all"
                         >
                           <Phone size={14} />
                         </button>
                         <button 
                           onClick={() => alert(`Emailing former staff ${c.name}: ${c.email}`)}
                           className="p-2 bg-gray-50 rounded-xl text-primary hover:bg-accent-magenta hover:text-white transition-all"
                         >
                           <Mail size={14} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
