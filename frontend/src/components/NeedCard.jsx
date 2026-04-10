import React, { useState } from 'react';
import { updateNeedStatus, updateVolunteerAvailability } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function NeedCard({ need }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (e) => {
    e.stopPropagation();
    setResolving(true);
    try {
      // 1. Mark Need as Done
      // 2. Make Volunteer Available again
      await Promise.all([
        updateNeedStatus(need.id, 'done'),
        need.assigned_volunteer_id ? updateVolunteerAvailability(need.assigned_volunteer_id, true) : Promise.resolve()
      ]);
      
      queryClient.invalidateQueries({ queryKey: ['needs'] });
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast.success("Task resolved and humanitarian resources liberated.");
    } catch (e) {
      toast.error("Failed to resolve task.");
    } finally {
      setResolving(false);
    }
  };
  
  const isAssigned = need.status === 'assigned';
  const isDone = need.status === 'done';
  
  return (
    <div 
        className={`bg-white shadow-sm border border-slate-100 rounded-lg p-4 mb-3 hover:shadow-md cursor-pointer transition border-l-4 ${
            isDone ? 'border-l-green-500 opacity-75' : isAssigned ? 'border-l-blue-500' : 'border-l-orange-500'
        }`} 
        onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
         <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
             isDone ? 'bg-green-100 text-green-800' : isAssigned ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
         }`}>
             {need.need_type}
         </span>
         <span className="text-slate-500 text-xs font-medium">Score: {need.priority_score ? parseFloat(need.priority_score).toFixed(1) : need.urgency_score}</span>
      </div>
      
      <p className="font-bold text-slate-800 mt-3 mb-1 truncate">{need.location_description}</p>
      
      <div className="flex justify-between items-center mt-2">
         <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < need.urgency_score ? 'text-orange-500' : 'text-slate-200'}`}>★</span>
            ))}
         </div>
         {isAssigned && (
             <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Action Required</span>
         )}
      </div>
      
      {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-700">{need.description}</p>
              <div className="flex justify-between mt-4 items-end">
                 <div>
                    <p className="text-xs text-slate-500 font-medium uppercase mb-1">Status</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isDone ? 'border-green-200 text-green-700 bg-green-50' : isAssigned ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-orange-200 text-orange-700 bg-orange-50'
                    }`}>
                        {need.status}
                    </span>
                 </div>
                 
                 {isAssigned && (
                     <button 
                        onClick={handleResolve}
                        disabled={resolving}
                        className="bg-green-600 text-white text-[10px] font-bold py-1.5 px-3 rounded hover:bg-green-700 transition disabled:opacity-50"
                     >
                         {resolving ? 'RESOLVING...' : 'COMPLETE TASK & FREE VOLUNTEER'}
                     </button>
                 )}
              </div>
          </div>
      )}
    </div>
  );
}
