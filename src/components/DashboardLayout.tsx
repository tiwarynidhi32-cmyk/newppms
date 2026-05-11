import React from 'react';
import { motion } from 'motion/react';
import { Printer, Layout, Users, FileText, Package, Truck, CreditCard, BarChart2, Settings, LogOut, Search, Bell, Calculator, Briefcase, ShoppingCart, BookOpen, HelpCircle, Wrench, Layers, HardHat, UserCheck, UserPlus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: (e?: any) => void | any;
  subItems?: { id: string, label: string }[];
  activeTab?: string;
  onSubClick?: (id: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  key?: string | number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, subItems, activeTab, onSubClick, isExpanded, onToggle }: SidebarItemProps) => (
  <div className="space-y-1">
    <button
      onClick={subItems ? onToggle : onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-accent-cyan text-white shadow-xl shadow-accent-cyan/30' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className={`text-sm tracking-wide transition-colors ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
      </div>
      {subItems && (
        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      )}
    </button>
    
    {subItems && isExpanded && (
      <div className="ml-9 space-y-1 mt-1 border-l border-white/10 pl-3">
        {subItems.map(sub => (
          <button
            key={sub.id}
            onClick={() => onSubClick!(sub.id)}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === sub.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default function DashboardLayout({ children, activeTab }: { children: React.ReactNode, activeTab: string }) {
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['job-management']);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { 
      id: 'pipeline', 
      label: 'Sales Pipeline', 
      icon: UserPlus,
      subItems: [
        { id: 'leads', label: 'Lead Management' },
        { id: 'estimates', label: 'Cost Estimator / Quote' },
        { id: 'crm', label: 'CRM / Follow-ups' },
      ]
    },
    { 
      id: 'job-management', 
      label: 'Production Flow', 
      icon: FileText,
      subItems: [
        { id: 'job-details', label: 'Create Job Order' },
        { id: 'job-card', label: 'Active Job Cards' },
        { id: 'production', label: 'Workflow Tracking' },
        { id: 'delivery', label: 'Delivery & Logistics' },
      ]
    },
    { id: 'inventory', label: 'Inventory / Paper', icon: Package },
    { id: 'customers', label: 'Customer Registry', icon: Briefcase },
    { 
      id: 'external-ops', 
      label: 'Operations', 
      icon: Layers,
      subItems: [
        { id: 'projects', label: 'Project Tracking' },
        { id: 'contractors', label: 'Contractor Mgmt' },
      ]
    },
    { id: 'billing', label: 'Invoicing & GST', icon: CreditCard },
    { id: 'accounting', label: 'Accounting / Ledger', icon: BookOpen },
    { 
      id: 'admin-panel', 
      label: 'Admin Panel', 
      icon: Settings,
      subItems: [
        { id: 'pricing-admin', label: 'Pricing Controls' },
        { id: 'staff', label: 'Staff & HR' },
        { id: 'machines', label: 'Machine Registry' },
        { id: 'purchase', label: 'Procurement / PO' },
        { id: 'settings', label: 'Global Settings' },
      ]
    },
    { id: 'reports', label: 'Analysis & Reports', icon: BarChart2 },
    { id: 'support', label: 'Support & Tickets', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-app-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col p-4 shadow-2xl z-20 relative overflow-hidden">
        {/* Background SVG Decoration for Sidebar */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 256 768" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="100" r="100" fill="white" />
            <circle cx="256" cy="400" r="80" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3 px-2 py-4 mb-8">
          <div className="w-10 h-10 bg-accent-cyan rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <Printer size={22} className="text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-white tracking-tight">PPMS</h1>
            <p className="text-accent-cyan text-[9px] uppercase font-bold tracking-widest leading-none mt-1">Enterprise Edition</p>
          </div>
        </div>

        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id || (item.subItems?.some(s => s.id === activeTab))}
              subItems={item.subItems}
              activeTab={activeTab}
              onSubClick={(id) => navigate(`/${id}`)}
              isExpanded={expandedMenus.includes(item.id)}
              onToggle={() => toggleMenu(item.id)}
              onClick={() => navigate(`/${item.id}`)}
            />
          ))}
        </nav>

        <div className="relative z-10 mt-auto border-t border-white/10 pt-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-8 flex-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Financial Year:</span>
                <select className="bg-app-bg border-none text-[11px] font-bold px-3 py-1.5 rounded-full outline-none focus:ring-2 focus:ring-accent-cyan transition-all">
                   <option>FY 2024-25</option>
                   <option>FY 2023-24</option>
                </select>
             </div>
             
             <div className="relative max-w-md w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input 
                  type="text" 
                  placeholder="Universal search..." 
                  className="w-full bg-app-bg border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-accent-cyan transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-secondary hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-magenta rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">Admin User</p>
                <p className="text-xs text-secondary">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent-cyan flex items-center justify-center text-white font-bold shadow-md shadow-accent-cyan/20">
                A
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="p-2.5 text-secondary hover:text-danger hover:bg-danger/5 rounded-xl transition-all group"
              title="Logout"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
