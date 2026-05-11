import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, TrendingUp, Users, Package, FileText, Download, 
  Filter, Clock, AlertCircle, Cpu, Droplet, Layers,
  ChevronDown, Calendar, Search, PieChart as PieChartIcon,
  Send, Target, Star, CheckCircle, Smartphone, Printer, X, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area,
  LineChart, Line
} from 'recharts';

const salesData = [
  { name: 'Jan', value: 45000, margin: 12000 },
  { name: 'Feb', value: 52000, margin: 15600 },
  { name: 'Mar', value: 48000, margin: 13200 },
  { name: 'Apr', value: 61000, margin: 19800 },
  { name: 'May', value: 55000, margin: 16500 },
  { name: 'Jun', value: 67000, margin: 23400 },
];

const categoryData = [
  { name: 'Offset', value: 45, color: '#1E3A5F' },
  { name: 'Digital', value: 30, color: '#06B6D4' },
  { name: 'Packaging', value: 15, color: '#D946EF' },
  { name: 'Post-Press', value: 10, color: '#F59E0B' },
];

const machineUptimeData = [
  { time: '08:00', load: 40 },
  { time: '10:00', load: 85 },
  { time: '12:00', load: 95 },
  { time: '14:00', load: 80 },
  { time: '16:00', load: 90 },
  { time: '18:00', load: 60 },
  { time: '20:00', load: 30 },
];

export default function ReportsModule() {
  const [reportType, setReportType] = React.useState(() => {
    return localStorage.getItem('printing_pms_report_type') || 'Daily';
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{title: string, data: any[]} | null>(null);
  
  // Party-wise audit states
  const [auditParty, setAuditParty] = useState(() => {
    return localStorage.getItem('printing_pms_audit_party') || 'Malhotra Publishing';
  });
  const [auditFromDate, setAuditFromDate] = useState(() => {
    return localStorage.getItem('printing_pms_audit_from_date') || new Date().toISOString().split('T')[0];
  });
  const [auditToDate, setAuditToDate] = useState(() => {
    return localStorage.getItem('printing_pms_audit_to_date') || new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('printing_pms_report_type', reportType);
  }, [reportType]);

  useEffect(() => {
    localStorage.setItem('printing_pms_audit_party', auditParty);
  }, [auditParty]);

  useEffect(() => {
    localStorage.setItem('printing_pms_audit_from_date', auditFromDate);
  }, [auditFromDate]);

  useEffect(() => {
    localStorage.setItem('printing_pms_audit_to_date', auditToDate);
  }, [auditToDate]);

  const handleOpenPreview = (title: string, data: any[]) => {
    setPreviewContent({ title, data });
    setIsPreviewOpen(true);
  };

  const handleDownload = () => {
    if (!previewContent) return;
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`${previewContent.title}\n\nGenerated on: ${new Date().toLocaleString()}\n\n` + JSON.stringify(previewContent.data, null, 2));
    link.download = `${previewContent.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    alert(`Audit report "${previewContent.title}" downloaded successfully.`);
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {isPreviewOpen && previewContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPreviewOpen(false)} 
              className="absolute inset-0 bg-primary/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter">Report Intelligence Preview</h3>
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-60">Strategic Document Traceability</p>
                 </div>
                 <button onClick={() => setIsPreviewOpen(false)} className="p-4 hover:bg-gray-100 rounded-2xl transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 flex-1 overflow-y-auto space-y-8 font-sans">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h4 className="text-sm font-black text-primary uppercase tracking-widest">{previewContent.title}</h4>
                       <p className="text-[10px] font-bold text-secondary">{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase bg-success/10 text-success px-4 py-1.5 rounded-full border border-success/20">Verified Audit</span>
                    </div>
                 </div>

                 <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                    {Array.isArray(previewContent.data) ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase text-secondary tracking-widest">
                             {previewContent.data.length > 0 && Object.keys(previewContent.data[0]).map(key => (
                               <th key={key} className="p-5">{key}</th>
                             ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {previewContent.data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-primary/5 transition-colors">
                               {Object.values(row).map((val: any, vidx) => (
                                 <td key={vidx} className="p-5 text-sm font-bold text-primary">
                                   {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                 </td>
                               ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <pre className="p-10 text-xs font-mono font-bold text-secondary leading-relaxed overflow-x-auto">
                        {JSON.stringify(previewContent.data, null, 2)}
                      </pre>
                    )}
                 </div>

                 <div className="p-6 border-l-4 border-accent-cyan bg-accent-cyan/5 rounded-r-2xl">
                    <p className="text-[10px] font-bold text-primary uppercase leading-relaxed">
                       Note: This is a strategic preview of the generated intelligence. Please review all metrics and data points before finalizing the export or print action.
                    </p>
                 </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                 <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 border-2 border-primary rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
                 >
                    <Printer size={16} /> Print Report
                 </button>
                 <button 
                  onClick={handleDownload}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                 >
                    <Download size={16} /> Download Intelligence
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black font-sans uppercase tracking-[0.2em] text-primary">Strategic Intelligence</h2>
          <p className="text-secondary text-sm font-medium">Real-time data visualization of your print ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl flex p-1">
             {['Daily', 'Monthly', 'Yearly'].map((type) => (
               <button 
                key={type}
                onClick={() => setReportType(type)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  reportType === type ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:bg-gray-50'
                }`}
               >
                {type}
               </button>
             ))}
          </div>
          <button 
            onClick={() => handleOpenPreview(`${reportType} Strategic Audit`, salesData)}
            className="bg-success text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-success/20 transition-all hover:scale-105 active:scale-95"
          >
            <Eye size={20} /> View All Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Shop Floor Load', value: '82%', icon: <Cpu />, color: '#06B6D4' },
           { label: 'Paper Wastage', value: '1.4%', icon: <Layers />, color: '#EF4444' },
           { label: 'Inking Efficiency', value: '94%', icon: <Droplet />, color: '#10B981' },
           { label: 'Staff Attendance', value: '42/45', icon: <Users />, color: '#6366F1' },
         ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="p-3 bg-gray-50 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all mb-4">
                     {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{stat.label}</p>
                    <h4 className="text-2xl font-black text-primary mt-1">{stat.value}</h4>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                 <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Growth & Revenue Matrix</h3>
                 <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-40">Monthly performance analysis</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase text-secondary">Sales</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                    <span className="text-[10px] font-black uppercase text-secondary">Profit</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[400px] w-full relative z-10 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                 <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" fill="#1E3A5F" radius={[10, 10, 0, 0]} barSize={20} />
                    <Bar dataKey="margin" fill="#06B6D4" radius={[10, 10, 0, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <BarChart2 size={300} className="absolute -right-20 -bottom-20 text-gray-50/50" />
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center">
           <h3 className="text-xl font-black text-primary uppercase tracking-tighter self-start mb-10">Vertical Distribution</h3>
           <div className="h-[300px] w-full flex items-center justify-center min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                 <PieChart>
                    <Pie
                       data={categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={8}
                       dataKey="value"
                    >
                       {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="w-full mt-6 space-y-3">
              {categoryData.map(item => (
                 <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                       <span className="text-[10px] font-black uppercase text-primary">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{item.value}%</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-primary p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center text-white">
            <div className="space-y-4">
               <h3 className="text-3xl font-black font-sans uppercase tracking-tighter">Machine Uptime Logs</h3>
               <p className="text-white/40 text-sm font-medium italic">Peak production analysis for Heidelberg Speedmaster XL75</p>
               <div className="flex gap-4 pt-4">
                  <div className="text-center">
                     <p className="text-2xl font-black text-accent-cyan">98.2%</p>
                     <p className="text-[10px] font-bold uppercase opacity-40">Uptime</p>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10" />
                  <div className="text-center">
                     <p className="text-2xl font-black text-accent-magenta">1.8%</p>
                     <p className="text-[10px] font-bold uppercase opacity-40">Downtime</p>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-2 h-[200px] min-w-0">
               <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                  <AreaChart data={machineUptimeData}>
                     <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Tooltip contentStyle={{backgroundColor: '#1E3A5F', border: 'none', borderRadius: '15px', color: 'white'}} />
                     <Area type="monotone" dataKey="load" stroke="#06B6D4" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={4} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                  <Users size={20} />
               </div>
               <h3 className="text-xl font-black text-primary uppercase tracking-tighter italic">Party-Wise Job Audit</h3>
            </div>
             <div className="space-y-6">
               <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Select Customer</label>
                     <select 
                        value={auditParty}
                        onChange={(e) => setAuditParty(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs"
                     >
                        <option>Malhotra Publishing</option>
                        <option>Sharma Creative</option>
                        <option>Reliable Corp</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest">From Date</label>
                       <div className="relative">
                          <input 
                            type="date" 
                            value={auditFromDate}
                            onChange={(e) => setAuditFromDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs" 
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-secondary uppercase tracking-widest">To Date</label>
                       <div className="relative">
                          <input 
                            type="date" 
                            value={auditToDate}
                            onChange={(e) => setAuditToDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs" 
                          />
                       </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => handleOpenPreview(`Statement: ${auditParty}`, [
                   { date: auditFromDate, status: 'Invoiced', amount: 15400 },
                   { date: auditToDate, status: 'Delivered', amount: 2500 },
                   { info: `Generated for range ${auditFromDate} to ${auditToDate}` }
                 ])}
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:bg-accent-cyan transition-all"
               >
                  Generate Statement
               </button>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <h3 className="text-xl font-black text-primary uppercase tracking-tighter mb-2">Production Analytics</h3>
                  <p className="text-xs text-secondary font-medium italic mb-6">Deep-dive into equipment efficiency vs wastage.</p>
               </div>
               <div className="space-y-3">
                  {[
                    { label: 'Avg Turnaround', value: '4.2 Days' },
                    { label: 'Outsourced Qty', value: '12,500 Units' },
                    { label: 'Maintenance Cost', value: '₹18,200' },
                  ].map(a => (
                    <div key={a.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                       <span className="text-[10px] font-black uppercase text-secondary">{a.label}</span>
                       <span className="text-xs font-black text-primary">{a.value}</span>
                    </div>
                  ))}
               </div>
            </div>
            <Target size={150} className="absolute -right-8 -bottom-8 text-primary/5 group-hover:scale-110 transition-transform duration-1000" />
         </div>
      </div>
    </div>
  );
}
