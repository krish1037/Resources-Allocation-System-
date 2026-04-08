import React, { useEffect, useState } from 'react';
import { getAnalytics, getTrends } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  
  useEffect(() => {
      const fetchData = async () => {
          try {
              const res1 = await getAnalytics();
              setOverview(res1.data);
              
              const res2 = await getTrends();
              setTrends(res2.data);
          } catch(e) {
              console.error("Failed to load analytics", e);
          }
      };
      fetchData();
  }, []);

  const categoryData = overview ? Object.entries(overview.by_category).map(([name, count]) => ({ name, count })) : [];
  
  const statusData = overview ? [
      { name: 'Open', value: overview.open },
      { name: 'Assigned', value: overview.assigned },
      { name: 'Done', value: overview.done }
  ] : [];
  
  const COLORS = ['#0f766e', '#f97316', '#64748b', '#0284c7', '#84cc16'];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Analytics Engine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
         <div className="bg-white p-4 shadow-sm rounded-lg h-80 border border-slate-100">
             <h2 className="text-slate-800 font-bold mb-4 text-center">Open Needs by Category</h2>
             <ResponsiveContainer width="100%" height="90%">
                 <BarChart data={categoryData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                     <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                     <Tooltip cursor={{fill: '#f8fafc'}} />
                     <Bar dataKey="count" fill="#0f766e" radius={[4,4,0,0]} />
                 </BarChart>
             </ResponsiveContainer>
         </div>
         
         <div className="bg-white p-4 shadow-sm rounded-lg h-80 border border-slate-100">
             <h2 className="text-slate-800 font-bold mb-4 text-center">Status Distribution (Donut)</h2>
             <ResponsiveContainer width="100%" height="90%">
                 <PieChart>
                     <Pie data={statusData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                         {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                     </Pie>
                     <Tooltip />
                     <Legend wrapperStyle={{fontSize: "14px"}} />
                 </PieChart>
             </ResponsiveContainer>
         </div>
      </div>
      
      <div className="bg-white p-4 shadow-sm rounded-lg h-96 w-full border border-slate-100">
         <h2 className="text-slate-800 font-bold mb-4 text-center">30 Day Incident Trends</h2>
         <ResponsiveContainer width="100%" height="90%">
             <LineChart data={trends}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 12}} />
                 <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                 <Tooltip />
                 <Legend />
                 <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} activeDot={{ r: 8 }} />
             </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}
