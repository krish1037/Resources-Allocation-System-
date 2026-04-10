import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllNeeds, selectOpenNeeds, selectActiveNeeds } from '../store/needsSlice';
import { selectAvailableVolunteers } from '../store/volunteerSlice';
import useNeeds from '../hooks/useNeeds';
import useVolunteers from '../hooks/useVolunteers';
import HeatmapLayer from '../components/HeatmapLayer';
import NeedCard from '../components/NeedCard';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  useNeeds();           // starts Firestore realtime listener, populates Redux
  useVolunteers();      // same for volunteers

  const allNeeds        = useSelector(selectAllNeeds);
  const openNeeds       = useSelector(selectOpenNeeds);
  const activeNeeds     = useSelector(selectActiveNeeds);
  const availableVols   = useSelector(selectAvailableVolunteers);

  const assigned = allNeeds.filter(n => n.status === 'assigned').length;
  const done     = allNeeds.filter(n => n.status === 'done').length;

  const topNeeds = [...activeNeeds]
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
    .slice(0, 10);

  return (
    <div className="flex h-full">

      {/* Main map area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-medium text-slate-800">Dashboard</h1>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <StatCard label="Open needs"       value={openNeeds.length}       color="orange" />
            <StatCard label="Assigned today"   value={assigned}               color="blue"   />
            <StatCard label="Volunteers ready" value={availableVols.length}   color="teal"   />
            <StatCard label="Resolved"         value={done}                   color="green"  />
          </div>
        </div>

        {/* Heatmap — takes remaining height */}
        <div className="flex-1 px-6 pb-6">
          <div className="h-full rounded-xl overflow-hidden border border-slate-200">
            <HeatmapLayer needs={openNeeds} />
          </div>
        </div>
      </div>

      {/* Right panel — top needs list */}
      <div className="w-80 border-l border-slate-200 bg-white overflow-auto p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-600">Top priority needs</p>
        {topNeeds.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No open needs. Run the seed script to add demo data.</p>
        )}
        {topNeeds.map(need => (
          <NeedCard key={need.id} need={need} />
        ))}
      </div>
    </div>
  );
}
