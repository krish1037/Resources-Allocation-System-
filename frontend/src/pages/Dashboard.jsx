import React, { useEffect, useState } from 'react';
import useNeeds from '../hooks/useNeeds';
import HeatmapLayer from '../components/HeatmapLayer';
import NeedCard from '../components/NeedCard';
import StatCard from '../components/StatCard';
import { getAnalytics } from '../services/api';

export default function Dashboard() {
  const { needs, loading: needsLoading } = useNeeds();
  const [stats, setStats] = useState({ open: 0, assigned: 0, done: 0, total_needs: 0 });
  const [activeVolunteers, setActiveVolunteers] = useState(0); 
  
  const fetchStats = async () => {
      try {
          const res = await getAnalytics();
          setStats(res.data);
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const openNeeds = needs.filter(n => n.status === 'open');
  const topNeeds = openNeeds.slice(0, 10);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Open Needs" value={stats.open} />
        <StatCard title="Assigned Today" value={stats.assigned} />
        <StatCard title="Active Volunteers" value={"12"} />
        <StatCard title="Needs Resolved" value={stats.done} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 shadow-sm rounded-lg min-h-[400px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Needs Heatmap</h2>
            <div className="flex-grow rounded overflow-hidden">
                <HeatmapLayer needs={openNeeds} />
            </div>
        </div>
        
        <div className="bg-white p-4 shadow-sm rounded-lg overflow-y-auto max-h-[600px]">
           <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Priority Needs</h2>
           {needsLoading ? <p>Loading...</p> : topNeeds.map((need, idx) => (
               <NeedCard key={need.id || idx} need={need} />
           ))}
        </div>
      </div>
    </div>
  );
}
