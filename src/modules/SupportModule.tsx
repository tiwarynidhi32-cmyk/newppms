import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageCircle, HelpCircle, ExternalLink, Globe, Building2 } from 'lucide-react';

export default function SupportModule() {
  const contactInfo = {
    company: "Press Management Systems",
    address: "Global Business Park, Tower A, 4th Floor, Tech Hub District, Lucknow, Uttar Pradesh, India.",
    phone: "+91-XXXXXXXXXX",
    email: "support@pressmgmt.com",
    website: "www.pressmgmt.com"
  };

  const faq = [
    { q: "How to export data for Tally?", a: "Go to Accounts > Tally XML Export tab. You can generate and download Tally-compatible XML files for direct import into your Tally Prime software." },
    { q: "Where can I see job logs?", a: "Navigate to 'Order/Jobs' for customer orders or 'Shop Floor' for real-time production status." },
    { q: "How to add new users?", a: "Super Admins can add users under Settings > Permissions." },
    { q: "Exporting reports to GST format?", a: "Go to Reports section and select 'Export Audit'. You can choose between Daily, Monthly or Yearly formats." }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-primary p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-6"
          >
            <span className="text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em]">Contact & Helpdesk</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">How can we help?</h2>
          <p className="text-white/60 text-lg font-medium leading-relaxed italic">
            Technical support for your Printing Press Management System is available 24/7 for Enterprise license holders.
          </p>
        </div>
        <HelpCircle size={300} className="absolute -right-20 -bottom-20 text-white/5 -rotate-12 transition-transform duration-[20s] hover:rotate-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-primary mb-6 uppercase italic">Headquarters</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-accent-cyan/10 text-accent-cyan rounded-2xl h-fit">
                   <Building2 size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Company</p>
                   <p className="text-sm font-black text-primary">{contactInfo.company}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-accent-magenta/10 text-accent-magenta rounded-2xl h-fit">
                   <MapPin size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Address</p>
                   <p className="text-sm font-bold text-primary leading-relaxed">
                     {contactInfo.address}
                   </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-accent-amber/10 text-accent-amber rounded-2xl h-fit">
                   <Phone size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Phone</p>
                   <p className="text-sm font-black text-primary">{contactInfo.phone}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-success/10 text-success rounded-2xl h-fit">
                   <Globe size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Online</p>
                   <p className="text-sm font-black text-primary">{contactInfo.website}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-100">
               <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-accent-cyan transition-all">
                  <MessageCircle size={18} /> Open Live Chat
               </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
             <h3 className="text-2xl font-black text-primary mb-8 uppercase italic flex items-center gap-3">
               Frequently Asked Questions
               <div className="h-0.5 flex-1 bg-gray-50"></div>
             </h3>
             <div className="grid grid-cols-1 gap-6">
                {faq.map((item, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-accent-cyan transition-all group">
                    <h4 className="text-md font-black text-primary mb-2 flex items-start gap-2">
                       <span className="text-accent-cyan font-serif italic text-xl leading-none">Q.</span>
                       {item.q}
                    </h4>
                    <p className="text-secondary text-sm font-medium leading-relaxed pl-6">
                      {item.a}
                    </p>
                  </div>
                ))}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-accent-cyan to-accent-cyan-dark p-8 rounded-[40px] text-white shadow-xl shadow-accent-cyan/20 group cursor-pointer">
                 <ExternalLink className="mb-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
                 <h4 className="text-lg font-black uppercase italic mb-2">Video Tutorials</h4>
                 <p className="text-white/70 text-xs font-medium leading-relaxed">Watch step-by-step guides on mastering the billing & inventory modules.</p>
              </div>
              <div className="bg-gradient-to-br from-accent-magenta to-accent-magenta-dark p-8 rounded-[40px] text-white shadow-xl shadow-accent-magenta/20 group cursor-pointer">
                 <Mail className="mb-4 opacity-40 group-hover:opacity-100 transition-all font-black" size={24} />
                 <h4 className="text-lg font-black uppercase italic mb-2">Ticketing System</h4>
                 <p className="text-white/70 text-xs font-medium leading-relaxed">Raise a priority ticket for data migration or severe system glitches.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
