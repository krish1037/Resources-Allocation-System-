import React, { useState } from 'react';

export default function NeedCard({ need }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
        className="bg-white shadow-sm border border-slate-100 rounded-lg p-4 mb-3 hover:shadow-md cursor-pointer transition border-l-4 border-l-orange-500" 
        onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
         <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
             {need.need_type}
         </span>
         <span className="text-slate-500 text-xs font-medium">Score: {need.priority_score ? parseFloat(need.priority_score).toFixed(1) : need.urgency_score}</span>
      </div>
      
      <p className="font-bold text-slate-800 mt-3 mb-1 truncate">{need.location_description}</p>
      
      <div className="flex gap-1 mt-2 mb-2">
         {[...Array(5)].map((_, i) => (
             <span key={i} className={`text-sm ${i < need.urgency_score ? 'text-orange-500' : 'text-slate-200'}`}>★</span>
         ))}
      </div>
      
      {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-700">{need.description}</p>
              <div className="flex justify-between mt-4">
                 <p className="text-xs text-slate-500 font-medium">Status: <span className="uppercase text-slate-700">{need.status}</span></p>
                 <p className="text-xs text-slate-500 font-medium">Affected: {need.affected_count}</p>
              </div>
          </div>
      )}
    </div>
  );
}
