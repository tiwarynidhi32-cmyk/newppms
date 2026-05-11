import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, ShieldCheck, DollarSign, Settings } from 'lucide-react';
import { PricingConfig } from '../types';

export default function PricingAdminModule() {
  const [config, setConfig] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('printing_pms_pricing_config');
    if (saved) return JSON.parse(saved);
    return {
      id: 'default',
      paperPrices: [
        { paperType: 'Art Paper', gsm: 130, pricePerUnit: 2.5 },
        { paperType: 'Art Card', gsm: 300, pricePerUnit: 5.5 },
        { paperType: 'Maplitho', gsm: 80, pricePerUnit: 1.2 },
      ],
      printingRates: [
        { machineType: '4 Color Offset', ratePerHour: 1500, setupCost: 1000 },
        { machineType: '1 Color Offset', ratePerHour: 600, setupCost: 300 },
      ],
      inkCostPerColor: 50,
      plateCostPerPlate: 250,
      laborCostPerManHour: 200,
      overheadPercentage: 15,
      profitMarginPercentage: 20,
      gstPercentage: 18,
    };
  });

  const [message, setMessage] = useState('');

  const handleSave = () => {
    localStorage.setItem('printing_pms_pricing_config', JSON.stringify(config));
    setMessage('Pricing configuration updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const addPaper = () => {
    setConfig({
      ...config,
      paperPrices: [...config.paperPrices, { paperType: '', gsm: 0, pricePerUnit: 0 }]
    });
  };

  const removePaper = (index: number) => {
    const newPapers = [...config.paperPrices];
    newPapers.splice(index, 1);
    setConfig({ ...config, paperPrices: newPapers });
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-primary flex items-center gap-3">
            <ShieldCheck className="text-accent-magenta" /> Admin Pricing Controls
          </h2>
          <p className="text-secondary text-sm font-medium">Define parameters for automatic cost estimation.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-accent-cyan transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Save size={18} /> Save Configurations
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl border border-green-100 font-bold text-sm"
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* PAPER PRICING */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">Paper Cost Matrix</h3>
            <button onClick={addPaper} className="p-1 text-accent-cyan hover:bg-accent-cyan/10 rounded-full transition-all"><Plus size={20} /></button>
          </div>
          <div className="space-y-3">
            {config.paperPrices.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input 
                  className="col-span-5 bg-gray-50 px-3 py-2 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-accent-cyan"
                  placeholder="Type"
                  value={p.paperType}
                  onChange={e => {
                    const newPapers = [...config.paperPrices];
                    newPapers[i].paperType = e.target.value;
                    setConfig({ ...config, paperPrices: newPapers });
                  }}
                />
                <input 
                  type="number"
                  className="col-span-3 bg-gray-50 px-3 py-2 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-accent-cyan"
                  placeholder="GSM"
                  value={p.gsm}
                  onChange={e => {
                    const newPapers = [...config.paperPrices];
                    newPapers[i].gsm = Number(e.target.value);
                    setConfig({ ...config, paperPrices: newPapers });
                  }}
                />
                <input 
                  type="number"
                  className="col-span-3 bg-gray-50 px-3 py-2 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-accent-cyan"
                  placeholder="Rate"
                  value={p.pricePerUnit}
                  onChange={e => {
                    const newPapers = [...config.paperPrices];
                    newPapers[i].pricePerUnit = Number(e.target.value);
                    setConfig({ ...config, paperPrices: newPapers });
                  }}
                />
                <button onClick={() => removePaper(i)} className="col-span-1 text-danger opacity-50 hover:opacity-100 transition-all"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* MACHINE RATES */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">Machine & Operational Rates</h3>
          </div>
          <div className="space-y-4">
             {config.printingRates.map((r, i) => (
               <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                  <div className="text-[10px] font-black uppercase text-secondary tracking-widest">{r.machineType}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-secondary/60">Rate per Hour</label>
                      <input 
                        type="number"
                        className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold border border-gray-100"
                        value={r.ratePerHour}
                        onChange={e => {
                          const newRates = [...config.printingRates];
                          newRates[i].ratePerHour = Number(e.target.value);
                          setConfig({ ...config, printingRates: newRates });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-secondary/60">Setup Cost</label>
                      <input 
                        type="number"
                        className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold border border-gray-100"
                        value={r.setupCost}
                        onChange={e => {
                          const newRates = [...config.printingRates];
                          newRates[i].setupCost = Number(e.target.value);
                          setConfig({ ...config, printingRates: newRates });
                        }}
                      />
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* UNIT COSTS */}
        <div className="p-8 bg-primary rounded-[32px] text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 italic flex items-center gap-2">
            <DollarSign size={18} /> Global Unit Costs
          </h3>
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {[
              { label: 'Ink Cost (Per Color)', key: 'inkCostPerColor' },
              { label: 'Plate Cost (Per Plate)', key: 'plateCostPerPlate' },
              { label: 'Labor (Per Man-Hour)', key: 'laborCostPerManHour' },
              { label: 'GST Percentage', key: 'gstPercentage' },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/50">{item.label}</label>
                <input 
                  type="number"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white/20"
                  value={(config as any)[item.key]}
                  onChange={e => setConfig({ ...config, [item.key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* MARGINS */}
        <div className="p-8 bg-accent-cyan rounded-[32px] text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 italic flex items-center gap-2">
            <Settings size={18} /> Overheads & Margins
          </h3>
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {[
              { label: 'Factory Overheads %', key: 'overheadPercentage' },
              { label: 'Standard Profit Margin %', key: 'profitMarginPercentage' },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/50">{item.label}</label>
                <div className="relative">
                  <input 
                    type="number"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white/20"
                    value={(config as any)[item.key]}
                    onChange={e => setConfig({ ...config, [item.key]: Number(e.target.value) })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-white/50">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
