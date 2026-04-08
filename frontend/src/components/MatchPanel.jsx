import React from 'react';
import { updateVolunteerAvailability } from '../services/api';

export default function MatchPanel({ matchResponse, onClose }) {
  const { need, assignments } = matchResponse;

  const handleConfirm = async (assignmentId, volunteerId) => {
      try {
          await updateVolunteerAvailability(volunteerId, false);
          alert("Assignment confirmed! Notification dispatched.");
      } catch(e) {
          console.error(e);
      }
  };

  return (
    <div className="p-5 flex flex-col h-full bg-slate-50">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Matches Found</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold leading-none">&times;</button>
      </div>
      
      <div className="mb-6 bg-white p-4 rounded shadow-sm border-l-4 border-orange-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Target Need</p>
          <p className="font-medium text-slate-800 mt-1">{need.description}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4">
          {assignments.map(a => (
              <div key={a.volunteer_id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-slate-800">{a.volunteer_id.slice(0, 8)}...</h3>
                     <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-bold">{Math.round(a.match_score)}%</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Distance: <span className="font-medium text-slate-800">{a.estimated_distance_km} km</span></p>
                  
                  <div className="bg-slate-50 border-l-2 border-slate-300 p-3 rounded mb-4">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">AI Briefing</p>
                      <p className="text-sm text-slate-700 italic">"{a.task_briefing}"</p>
                  </div>
                  
                  <button 
                     onClick={() => handleConfirm(a.id, a.volunteer_id)}
                     className="w-full bg-teal-600 text-white text-sm font-semibold py-2 px-4 rounded hover:bg-teal-700 transition shadow-sm"
                  >
                      Confirm Assignment
                  </button>
              </div>
          ))}
      </div>
    </div>
  );
}
