import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    
    // For prototype, using the requested credentials
    if (target.email.value === 'admin' && target.password.value === '12345') {
      navigate('/dashboard');
    } else {
      setError('Invalid Credentials. Hint: admin / 12345');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden immersive-bg">
      {/* Abstract Mechanical Elements (SVG Overlay) */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1024 768" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="150" cy="650" r="200" fill="none" stroke="currentColor" className="text-accent-cyan" strokeWidth="40" />
          <circle cx="150" cy="650" r="100" fill="none" stroke="currentColor" className="text-accent-magenta" strokeWidth="20" />
          <line x1="0" y1="100" x2="1024" y2="100" stroke="white" strokeOpacity="0.05" />
        </svg>
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] scale-110 opacity-40"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?auto=format&fit=crop&q=80&w=2070")',
        }}
      />
      <div className="absolute inset-0 login-overlay" />

      {/* Header/Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-cyan rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <Printer size={24} className="text-white" />
          </div>
          <div className="leading-tight">
            <h2 className="text-white font-bold tracking-tight text-lg">PPMS</h2>
            <p className="text-accent-cyan text-[10px] uppercase font-semibold tracking-wider">Enterprise Edition</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-white/70">
          <span className="hover:text-white cursor-pointer transition-colors">Solutions</span>
          <span onClick={() => navigate('/support')} className="hover:text-white cursor-pointer transition-colors">Support</span>
          <span className="hover:text-white cursor-pointer transition-colors">Cloud Access</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 z-10 max-w-7xl mx-auto w-full">
        
        {/* Branding Section (Left) */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-white mb-12 md:mb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6"
          >
            <span className="text-accent-cyan text-xs font-bold uppercase tracking-widest">Digital Communique</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-[1.1]">
              Printing Press <br /> 
              <span className="text-gradient">Management System</span>
            </h1>
            <p className="text-xl text-text-muted font-light max-w-md leading-relaxed">
              Streamlining Print Production & Operations with CMYK-integrated workflow automation.
            </p>
          </motion.div>

          <div className="flex gap-4 mt-8">
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-success"></div> Production Ready
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-accent-cyan"></div> Real-time Sync
            </div>
          </div>
        </div>

        {/* Login Form Section (Right) */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full max-w-md glass-card p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle Gradient Accent inside card */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-cyan via-accent-magenta to-accent-amber opacity-50" />

            <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl font-bold text-primary mb-2">System Access</h3>
              <p className="text-secondary text-sm">Please enter your credentials to login.</p>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider px-1">Username / Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                  <input 
                    name="email"
                    type="text" 
                    placeholder="admin"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-accent-cyan focus:border-transparent outline-none transition-all text-primary font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-accent-cyan focus:border-transparent outline-none transition-all text-primary font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-accent-cyan focus:ring-accent-cyan accent-accent-cyan" />
                  <span className="text-xs font-medium text-secondary">Remember Me</span>
                </label>
                <a href="#" className="text-xs font-bold text-accent-cyan hover:underline">Forgot password?</a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#06B6D4' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                SIGN IN TO PPMS
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="flex justify-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-accent-cyan opacity-20"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-magenta opacity-20"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-amber opacity-20"></div>
                  <div className="w-3 h-3 rounded-full bg-success opacity-20"></div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Indicators Overlay */}
      <div className="absolute bottom-12 left-10 z-20 hidden lg:flex gap-3">
         <div className="px-4 py-2 rounded-lg bg-accent-amber/10 border border-accent-amber/20 backdrop-blur-sm text-accent-amber text-[10px] font-bold uppercase tracking-wider shadow-xl shadow-accent-amber/5">
           8 Pending Jobs
         </div>
         <div className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 backdrop-blur-sm text-accent-cyan text-[10px] font-bold uppercase tracking-wider shadow-xl shadow-accent-cyan/5">
           12 In Process
         </div>
      </div>

      {/* Footer */}
      <footer className="relative h-16 flex items-center justify-center z-10 px-6 mt-auto">
        <p className="text-[12px] text-text-muted font-bold tracking-widest uppercase opacity-80 decoration-accent-cyan">
          A Product of Digital Communique Private Limited
        </p>
      </footer>
    </div>
  );
}
