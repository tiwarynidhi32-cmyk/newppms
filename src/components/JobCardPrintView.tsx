import React from 'react';
import { FileText, Box, Clock, Check } from 'lucide-react';

interface JobCard {
  id: string;
  jcNo: string;
  jcDate: string;
  party: string;
  productType: string;
  bookTitle: string;
  size: string;
  quantity: number;
  colorType?: string;
  paperType?: string;
  gsm?: number;
  printingType?: string;
  finishing?: string[];
  priority: string;
  deadline: string;
  machine?: string;
  contractorName?: string;
  outsourceOnly?: boolean;
  jobType?: string;
  printEdition?: string;
  ups?: string;
  plateType?: string[];
  plateUsed?: number;
  plateMaker?: string;
  oldPlate?: string;
  newPlate?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  formsDescription?: { slNo: number; pageFrom: string; pageTo: string; counter: string }[];
  formsRows?: number;
  formsCols?: number;
  remarks?: string;
  noOfForms?: number;
  noOfPages?: number;
  noOfColors?: number;
  reamWt?: number;
  folding?: boolean;
  otherFinishing?: string;
  inkConsumption?: string;
  proofApproved?: boolean;
  approvedBy?: string;
  estimatedCost?: number;
  actualCost?: number;
  plateRequired?: number;
  lamination?: string;
  binding?: string;
  cutting?: boolean;
  uom?: string;
  batchNo?: string;
}

export default function JobCardPrintView({ job }: { job: JobCard }) {
  if (!job) return null;

  return (
    <div className="bg-white text-black font-sans w-full max-w-[800px] border-[1px] border-black p-0 print:border-none print:shadow-none mx-auto relative overflow-hidden">
      {/* HEADER SECTION */}
      <div className="p-6 border-b-[1px] border-black flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-[900] tracking-tight leading-none mb-1">
            Sanjayshree <span className="font-[300]">Offset Printers</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black border-[1px] border-black px-3 py-0.5 bg-black text-white">JOB CARD</span>
            <div className="flex items-center gap-1 opacity-60">
               <div className="w-10 h-[1px] bg-black"></div>
               <span className="text-[8px] font-bold tracking-widest uppercase">Since 1983</span>
            </div>
          </div>
        </div>
        <div className="w-20 h-20 border-[1px] border-black/10 rounded-full flex flex-col items-center justify-center border-dashed relative">
          <span className="text-[7px] text-black/30 font-black uppercase tracking-tighter absolute top-10 rotate-12">OFFICIAL STAMP</span>
        </div>
      </div>

      {/* JOB DESCRIPTION TITLE */}
      <div className="px-4 py-1.5 border-b-[1px] border-black bg-gray-50 flex items-center justify-between">
         <h2 className="text-[11px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
           <FileText size={12} className="opacity-70" /> Job Description
         </h2>
      </div>

      {/* JC DETAILS GRID */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black bg-white">
        <div className="col-span-4 p-3 flex items-center gap-2">
           <span className="text-[11px] font-[900] uppercase">J.C. No.:</span>
           <span className="text-[12px] font-mono font-bold">{job.jcNo}</span>
        </div>
        <div className="col-span-4 p-3 flex items-center gap-2">
           <span className="text-[11px] font-[900] uppercase italic text-primary/60">Batch/Lot/Group:</span>
           <span className="text-[11px] font-black">{job.batchNo || '---'}</span>
        </div>
        <div className="col-span-4 p-3 flex items-center gap-2">
           <span className="text-[11px] font-[900] uppercase">Date:</span>
           <span className="text-[11px] font-mono">{job.jcDate}</span>
        </div>
      </div>

      {/* PRIORITY LEVEL & DEADLINE */}
      <div className="px-4 py-2 border-b-[1px] border-black flex items-center justify-between bg-gray-50/30">
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest italic">Priority Level:</span>
            <div className="flex gap-6">
               {['Normal', 'Medium', 'High'].map(p => (
                  <div key={p} className="flex items-center gap-2">
                     <div className={`w-3.5 h-3.5 rounded-full border-[1px] border-black flex items-center justify-center p-[2px]`}>
                        {(job.priority === p || (!job.priority && p === 'Normal')) && <div className="w-full h-full bg-black rounded-full" />}
                     </div>
                     <span className="text-[10px] font-bold">{p}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="flex items-center gap-2 border-l border-black/10 pl-8">
            <span className="text-[10px] font-black uppercase tracking-widest italic text-red-600">Final Deadline:</span>
            <span className="text-[11px] font-black text-red-700 italic underline">{job.deadline || '---'}</span>
         </div>
      </div>

      {/* CONTRACTOR ROW */}
      <div className="px-4 py-3 border-b-[1px] border-black flex justify-between items-center bg-[#FFF8FF]">
         <div className="flex items-center gap-4">
            <span className="text-[11px] font-[900] uppercase text-[#C026D3]">Contractor:</span>
            <span className="text-[11px] font-bold italic text-black/70">{job.contractorName || 'Assigned Contractor Name'}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border-[1px] border-black flex items-center justify-center`}>
               {job.outsourceOnly && <Check size={12} strokeWidth={4} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Outsource Whole Order?</span>
         </div>
      </div>

      {/* MACHINE ROW */}
      <div className="px-4 py-3 border-b-[1px] border-black flex items-center gap-4">
         <span className="text-[11px] font-[900] uppercase">Machine:</span>
         <span className="text-[11px] font-medium italic">{job.machine || 'e.g., Heidelberg 102 4Clr'}</span>
      </div>

      {/* PARTY ROW */}
      <div className="px-4 py-3 border-b-[1px] border-black flex items-center gap-4 bg-[#F8FAFC]">
         <span className="text-[11px] font-[900] uppercase">Party:</span>
         <span className="text-[13px] font-black tracking-tight">{job.party || 'Customer Name'}</span>
      </div>

      {/* TITLE & PRODUCT ROW */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-8 p-3 flex items-center gap-4">
           <span className="text-[11px] font-[900] uppercase text-cyan-600">Book/Title:</span>
           <span className="text-[15px] font-black tracking-tight text-cyan-700 italic">{job.bookTitle || 'Book Title or Product Name'}</span>
        </div>
        <div className="col-span-4 p-3 flex items-center gap-2 justify-between">
           <span className="text-[11px] font-[900] uppercase">Product:</span>
           <span className="text-[11px] font-bold">{job.productType || 'Booklet'}</span>
        </div>
      </div>

      {/* SIZE & PRINT TYPE ROW */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-6 p-3 flex items-center gap-4">
           <span className="text-[11px] font-[900] uppercase">Size:</span>
           <span className="text-[11px] font-medium">{job.size || 'A4, Custom, etc.'}</span>
        </div>
        <div className="col-span-6 p-3 flex items-center gap-2 justify-between">
           <span className="text-[11px] font-[900] uppercase text-magenta-600">Printing Type:</span>
           <span className="text-[11px] font-black text-magenta-600 italic uppercase" style={{ color: '#C026D3' }}>{job.printingType || 'Offset Printing'}</span>
        </div>
      </div>

      {/* QTY & UOM & PAGES/FORMS ROW */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-3 p-3 flex flex-col gap-1">
           <span className="text-[9px] font-[900] uppercase opacity-50">Quantity:</span>
           <span className="text-[16px] font-black text-red-600">{job.quantity ? `${job.quantity.toLocaleString()} ${job.uom || ''}` : '9,200 Sheets'}</span>
        </div>
        <div className="col-span-3 p-3 flex flex-col gap-1">
           <span className="text-[9px] font-[900] uppercase opacity-50">UOM/Unit:</span>
           <span className="text-[13px] font-black uppercase text-primary/70">{job.uom || 'Sheets'}</span>
        </div>
        <div className="col-span-3 p-3 flex flex-col gap-1">
           <span className="text-[9px] font-[900] uppercase opacity-50 text-cyan-600">Total Pages:</span>
           <span className="text-[16px] font-black text-cyan-700">{job.noOfPages || '--'}</span>
        </div>
        <div className="col-span-3 p-3 flex flex-col gap-1">
           <span className="text-[9px] font-[900] uppercase opacity-50 text-magenta-600">No. of Forms:</span>
           <span className="text-[16px] font-black text-magenta-600" style={{ color: '#C026D3' }}>{job.noOfForms || '--'}</span>
        </div>
      </div>

      {/* TIMELINE ROW */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-6 p-2 flex items-center gap-3">
           <span className="text-[9px] font-black uppercase leading-tight">Start Date:</span>
           <div className="flex gap-[2px]">
              {(() => {
                if (!job.startDate) return Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold" />
                ));
                const parts = job.startDate.split('-');
                if (parts.length !== 3) return null;
                const [y, m, d] = parts;
                const str = `${d.padStart(2, '0')}${m.padStart(2, '0')}${y}`;
                return Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold">
                    {str[idx] || ''}
                  </div>
                ));
              })()}
           </div>
           <span className="text-[9px] font-black uppercase ml-1">Time:</span>
           <div className="flex gap-[2px]">
              {(() => {
                const timeStr = job.startTime?.replace(/:/g, '') || '';
                return Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold">
                    {timeStr[i] || ''}
                  </div>
                ));
              })()}
           </div>
        </div>
        <div className="col-span-6 p-2 flex items-center gap-3">
           <span className="text-[9px] font-black uppercase leading-tight">End Date:</span>
           <div className="flex gap-[2px]">
              {(() => {
                if (!job.endDate) return Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold" />
                ));
                const parts = job.endDate.split('-');
                if (parts.length !== 3) return null;
                const [y, m, d] = parts;
                const str = `${d.padStart(2, '0')}${m.padStart(2, '0')}${y}`;
                return Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold">
                    {str[idx] || ''}
                  </div>
                ));
              })()}
           </div>
           <span className="text-[9px] font-black uppercase ml-1">Time:</span>
           <div className="flex gap-[2px]">
              {(() => {
                const timeStr = job.endTime?.replace(/:/g, '') || '';
                return Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 border-[1px] border-black/30 flex items-center justify-center text-[9px] font-bold">
                    {timeStr[i] || ''}
                  </div>
                ));
              })()}
           </div>
        </div>
      </div>

      {/* MATERIAL SPECIFICATIONS */}
      <div className="bg-black/5 px-4 py-1 border-b border-black">
         <span className="text-[8px] font-black uppercase tracking-widest italic">Material Specifications</span>
      </div>
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black bg-white">
        <div className="col-span-4 p-2 flex flex-col">
           <span className="text-[8px] font-black uppercase opacity-60">Paper Type</span>
           <span className="text-[11px] font-bold italic">{job.paperType || 'BILT Art Card'}</span>
        </div>
        <div className="col-span-2 p-2 flex flex-col items-center">
           <span className="text-[8px] font-black uppercase opacity-60">GSM</span>
           <span className="text-[11px] font-black">{job.gsm || '220'}</span>
        </div>
        <div className="col-span-3 p-2 flex flex-col items-center">
           <span className="text-[8px] font-black uppercase opacity-60 text-[#C026D3]">Plate Required</span>
           <span className="text-[11px] font-black text-[#C026D3]">{job.plateRequired || job.noOfColors || 4}</span>
        </div>
        <div className="col-span-3 p-2 flex flex-col items-center">
           <span className="text-[8px] font-black uppercase opacity-60">Ink Consumption</span>
           <span className="text-[11px] font-black">{job.inkConsumption || 'N/A'}</span>
        </div>
      </div>

      {/* FINISHING DETAILS */}
      <div className="bg-black/5 px-4 py-1 border-b border-black">
         <span className="text-[8px] font-black uppercase tracking-widest italic">Finishing Details</span>
      </div>
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black bg-white">
        <div className="col-span-3 p-2 flex flex-col">
           <span className="text-[8px] font-black uppercase opacity-60">Lamination</span>
           <span className="text-[10px] font-bold">{job.lamination || 'None'}</span>
        </div>
        <div className="col-span-3 p-2 flex flex-col">
           <span className="text-[8px] font-black uppercase opacity-60">Binding Type</span>
           <span className="text-[10px] font-bold">{job.binding || 'None'}</span>
        </div>
        <div className="col-span-6 p-2 flex items-center justify-around">
           <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 border-[1px] border-black flex items-center justify-center`}>
                 {job.cutting && <div className="w-2 h-2 bg-black" />}
              </div>
              <span className="text-[9px] font-black uppercase">Cutting</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 border-[1px] border-black flex items-center justify-center`}>
                 {job.folding && <div className="w-2 h-2 bg-black" />}
              </div>
              <span className="text-[9px] font-black uppercase text-[#C026D3]">Folding</span>
           </div>
        </div>
      </div>

      <div className="px-4 py-1.5 border-b-[1px] border-black flex items-center gap-4 bg-gray-50/50">
         <span className="text-[8px] font-black uppercase tracking-widest italic opacity-50">Other Finishing:</span>
         <span className="text-[10px] font-bold italic">{job.otherFinishing || 'None'}</span>
      </div>

      {/* TECH DETAILS SECTION (CLEANUP) */}
      <div className="px-4 py-2 border-b border-black bg-white flex justify-between items-center">
         <span className="text-[11px] font-[900] uppercase">Color Type:</span>
         <span className="text-[11px] font-black italic text-primary">{job.colorType || '4 Color (CMYK)'}</span>
      </div>

      {/* EDITION & UPS */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-6 p-3 flex items-center gap-8">
           <span className="text-[11px] font-[900] uppercase">Print Edition:</span>
           <div className="flex gap-4">
              {['NEW', 'RE-PRINT'].map(e => (
                 <div key={e} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full border-[1px] border-black flex items-center justify-center p-[2px]`}>
                       {(job.printEdition === e || (!job.printEdition && e === 'NEW')) && <div className="w-full h-full bg-black rounded-full" />}
                    </div>
                    <span className="text-[10px] font-bold">{e}</span>
                 </div>
              ))}
           </div>
        </div>
        <div className="col-span-6 p-3 flex items-center gap-4">
           <span className="text-[11px] font-[900] uppercase">UPS:</span>
           <span className="text-[11px] font-black italic">{job.ups || '1/4'}</span>
        </div>
      </div>

      {/* PLATE SECTION */}
      <div className="grid grid-cols-12 divide-x-[1px] divide-black border-b-[1px] border-black">
        <div className="col-span-6 p-3 grid grid-cols-2 gap-4">
           <div className="space-y-4">
             <span className="text-[11px] font-[900] uppercase underline block mb-3">Plate Type:</span>
             <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                {['CTP', 'P/S', 'D/E', 'BAKED'].map(pt => (
                   <div key={pt} className="flex items-center gap-2">
                      <div className={`w-4 h-4 border-[1px] border-black flex items-center justify-center`}>
                         {(job.plateType?.includes(pt) || (pt === 'BAKED' && !job.plateType)) && <Check size={12} strokeWidth={4} />}
                      </div>
                      <span className="text-[10px] font-black">{pt}</span>
                   </div>
                ))}
             </div>
           </div>
           <div className="flex flex-col justify-between">
              <div className="flex justify-between items-center bg-gray-50 p-2 border-[1px] border-black">
                 <span className="text-[10px] font-black uppercase">Plate Required:</span>
                 <span className="text-[13px] font-black">{job.plateRequired || job.noOfColors || 4}</span>
              </div>
              <div className="grid grid-cols-2 mt-2 h-full">
                 <div className="border-[1px] border-black p-2 flex flex-col justify-center">
                    <span className="text-[8px] font-bold uppercase block mb-1">Old Plate:</span>
                    <span className="text-[10px] font-bold text-center">{job.oldPlate || '-'}</span>
                 </div>
                 <div className="border-[1px] border-black border-l-0 p-2 flex flex-col justify-center">
                    <span className="text-[8px] font-bold uppercase block mb-1">New Plate:</span>
                    <span className="text-[12px] font-black text-center">{job.newPlate || job.noOfColors || 4}</span>
                 </div>
              </div>
           </div>
        </div>
        <div className="col-span-6 grid grid-rows-2">
           <div className="p-3 border-b-[1px] border-black flex items-center gap-4">
              <span className="text-[11px] font-[900] uppercase">Plate Used:</span>
              <span className="text-[12px] font-black underline">{job.plateUsed || job.noOfColors || '4'}</span>
           </div>
           <div className="p-3 flex items-center gap-4">
              <span className="text-[11px] font-[900] uppercase">Plate Maker:</span>
              <span className="text-[11px] font-black italic">{job.plateMaker || 'Global'}</span>
           </div>
        </div>
      </div>

      {/* FORMS DESCRIPTION TITLE */}
      <div className="px-4 py-1.5 border-b-[1px] border-black bg-gray-50 flex items-center justify-between">
         <h2 className="text-[11px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
           <Box size={12} className="opacity-70" /> Forms Description
         </h2>
         <div className="flex gap-4">
            <span className="text-[8px] font-bold uppercase">Columns: <span className="underline ml-1">{job.formsCols || 3}</span></span>
            <span className="text-[8px] font-bold uppercase">Rows: <span className="underline ml-1">{job.formsRows || 10}</span></span>
            <span className="text-[8px] font-bold uppercase">Total Slots: <span className="underline ml-1">{(job.formsCols || 3) * (job.formsRows || 10)}</span></span>
         </div>
      </div>

      {/* FORMS DESCRIPTION TABLE */}
      <div className="border-b-[1px] border-black">
         <table className="w-full text-center border-collapse text-[9px] uppercase">
            <thead>
               <tr className="border-b-[1px] border-black bg-gray-50/50">
                  {Array.from({ length: job.formsCols || 3 }).map((_, colIdx) => (
                    <React.Fragment key={colIdx}>
                       <th className={`py-1 border-black font-[900] ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px]' : ''}`}>Sl No.</th>
                       <th className={`py-1 border-black font-[900] ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px]' : ''}`}>Page To-From</th>
                       <th className={`py-1 border-black font-[900] ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px]' : ''}`}>Counter</th>
                    </React.Fragment>
                  ))}
               </tr>
            </thead>
            <tbody>
               {Array.from({ length: job.formsRows || 10 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b-[1px] border-black/10 last:border-b-0 h-6">
                     {Array.from({ length: job.formsCols || 3 }).map((_, colIdx) => {
                        const currentSl = (colIdx * (job.formsRows || 10)) + rowIdx + 1;
                        const data = job.formsDescription?.find(fd => fd.slNo === currentSl);
                        return (
                          <React.Fragment key={colIdx}>
                             <td className={`border-black bg-gray-50/50 font-black ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px]' : ''}`}>{currentSl}.</td>
                             <td className={`border-black font-bold ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px]' : ''}`}>
                               {data?.pageFrom || '...'} {data?.pageTo ? ` - ${data.pageTo}` : ''}
                             </td>
                             <td className={`font-black text-[#C026D3] ${(job.formsCols || 3) > 1 && colIdx < (job.formsCols || 3) - 1 ? 'border-r-[1px] border-black' : ''}`}>
                               {data?.counter || '--'}
                             </td>
                          </React.Fragment>
                        );
                     })}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* REMARKS SECTION */}
      <div className="p-4 h-24 border-b-[1px] border-black flex flex-col gap-2">
         <span className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Remarks:</span>
         <p className="text-[11px] font-medium leading-tight whitespace-pre-wrap">{job.remarks || '...'}</p>
      </div>

      {/* SIGNATURE SECTION */}
      <div className="grid grid-cols-2 divide-x-[1px] divide-black min-h-[120px]">
         <div className="p-6 flex flex-col justify-between">
            <div className="space-y-1">
               <span className="text-[10px] font-black uppercase">Approved By:</span>
               <div className="flex items-center gap-4">
                  <span className="text-[12px] font-black italic underline">{job.approvedBy || '............'}</span>
                  {job.proofApproved && (
                     <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 border border-green-200">
                        <Check size={10} className="text-green-600" />
                        <span className="text-[8px] font-black text-green-700 uppercase">Proof Approved</span>
                     </div>
                  )}
               </div>
            </div>
            <div className="mt-8 border-t-[1px] border-black border-dotted pt-1 text-center">
               <span className="text-[8px] font-black uppercase text-black/40">Authorized Signature</span>
            </div>
         </div>
         <div className="p-6 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase">Operator / Prod. Manager on Duty:</span>
            <div className="mt-8 border-t-[1px] border-black border-dotted pt-1 text-center">
               <span className="text-[8px] font-black uppercase text-black/40">Supervisor Signature</span>
            </div>
         </div>
      </div>
      
      {/* COSTING SECTION (STRICTLY CONFIDENTIAL) */}
      <div className="grid grid-cols-2 divide-x-[1px] divide-black border-y-[1px] border-black bg-gray-50/50 print:hidden">
         <div className="p-3 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Est. Cost:</span>
            <span className="text-[11px] font-black">₹ {job.estimatedCost?.toLocaleString() || '0.00'}</span>
         </div>
         <div className="p-3 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Actual Cost:</span>
            <span className="text-[11px] font-black">₹ {job.actualCost?.toLocaleString() || '0.00'}</span>
         </div>
      </div>

      {/* FINAL PRINT FOOTER */}
      <div className="p-2 bg-gray-50 border-t-[1px] border-black text-right print:hidden">
         <span className="text-[8px] font-bold text-black/40 uppercase">SOP PRINT PRODUCTION SYSTEM V2.0</span>
      </div>
    </div>
  );
}
