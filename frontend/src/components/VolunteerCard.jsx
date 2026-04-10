import React, { useState } from 'react';
import { updateVolunteerAvailability } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const SKILL_COLORS = {
  medical: 'bg-red-100 text-red-700',
  food_distribution: 'bg-orange-100 text-orange-700',
  teaching: 'bg-blue-100 text-blue-700',
  transport: 'bg-purple-100 text-purple-700',
  construction: 'bg-yellow-100 text-yellow-700',
  counseling: 'bg-pink-100 text-pink-700',
  general: 'bg-slate-100 text-slate-600',
};

export default function VolunteerCard({ volunteer, matchData, onConfirmAssignment }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
        await updateVolunteerAvailability(volunteer.id, !volunteer.availability);
        queryClient.invalidateQueries({ queryKey: ['volunteers'] });
        toast.success(`Volunteer marked as ${!volunteer.availability ? 'Available' : 'Busy'}`);
    } catch(e) {
        toast.error("Failed to update status");
    } finally {
        setLoading(false);
    }
  };

  async function handleConfirm() {
    setConfirming(true);
    await onConfirmAssignment?.(volunteer.id);
    setConfirmed(true);
    setConfirming(false);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      
      {/* Header: avatar + name + status badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center
                        text-teal-700 font-medium text-sm flex-shrink-0">
          {volunteer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">{volunteer.name}</p>
          <p className="text-xs text-slate-400 truncate">{volunteer.email}</p>
        </div>
        <button 
          onClick={handleToggleStatus}
          disabled={loading}
          className={`text-[10px] px-2 py-1 rounded border font-bold transition ${
              volunteer.availability 
              ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' 
              : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
          }`}
        >
          {loading ? '...' : volunteer.availability ? 'SET BUSY' : 'SET AVAILABLE'}
        </button>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          volunteer.availability
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {volunteer.availability ? 'Available' : 'Assigned'}
        </span>
      </div>

      {/* Skills chips */}
      <div className="flex flex-wrap gap-1.5">
        {volunteer.skills.map(skill => (
          <span key={skill}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${SKILL_COLORS[skill] || SKILL_COLORS.general}`}>
            {skill.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Match data — only shown in MatchPanel context */}
      {matchData && (
        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
          
          {/* Match score bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-20 flex-shrink-0">Match score</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${matchData.match_score}%` }}
              />
            </div>
            <span className="text-xs font-medium text-teal-700 w-8 text-right">
              {Math.round(matchData.match_score)}
            </span>
          </div>

          {/* Distance */}
          <p className="text-xs text-slate-400">
            {matchData.estimated_distance_km} km away
          </p>

          {/* AI task briefing */}
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-400 mb-1 font-medium">Task briefing</p>
            <p className="text-xs text-slate-700 leading-relaxed">{matchData.task_briefing}</p>
          </div>

          {/* Confirm button */}
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full mt-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium
                         hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-60">
              {confirming ? 'Assigning...' : 'Confirm assignment'}
            </button>
          ) : (
            <div className="w-full mt-1 py-2 rounded-lg bg-green-50 border border-green-200
                            text-green-700 text-sm font-medium text-center">
              Assigned
            </div>
          )}
        </div>
      )}
    </div>
  );
}
