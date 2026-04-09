import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { useTranslation } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAnalytics, getTrends } from '../services/api';
import PageHeader from '../components/PageHeader';

export default function Analytics() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [overviewRes, trendsRes] = await Promise.allSettled([
          getAnalytics(),
          getTrends(),
        ]);

        if (cancelled) return;

        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value.data);
        }
        if (trendsRes.status === 'fulfilled') {
          setTrends(trendsRes.value.data || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Color config based on theme
  const colors = {
    line1: theme === 'dark' ? '#fff' : '#000',
    line2: theme === 'dark' ? '#52525b' : '#a1a1aa',
    grid: theme === 'dark' ? '#27272a' : '#f4f4f5',
    text: theme === 'dark' ? '#71717a' : '#a1a1aa',
    pie: theme === 'dark'
      ? ['#fff', '#a1a1aa', '#52525b', '#27272a', '#3f3f46', '#71717a']
      : ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5'],
  };

  // Build pie data from overview
  const pieData = overview?.by_category
    ? Object.entries(overview.by_category).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Medical', value: 45 },
        { name: 'Shelter', value: 25 },
        { name: 'Food', value: 20 },
        { name: 'Transport', value: 10 },
      ];

  // Build line data from trends or fallback
  const lineData = trends.length > 0
    ? (() => {
        const byDate = {};
        trends.forEach(t => {
          if (!byDate[t.date]) byDate[t.date] = { name: t.date, needs: 0 };
          byDate[t.date].needs += t.count;
        });
        return Object.values(byDate);
      })()
    : [
        { name: '00:00', needs: 12, fulfilled: 10 },
        { name: '04:00', needs: 18, fulfilled: 15 },
        { name: '08:00', needs: 45, fulfilled: 30 },
        { name: '12:00', needs: 80, fulfilled: 45 },
        { name: '16:00', needs: 65, fulfilled: 55 },
        { name: '20:00', needs: 40, fulfilled: 38 },
      ];

  // Overview stat cards
  const stats = overview
    ? [
        { label: 'Total Needs', value: overview.total_needs, color: 'text-zinc-900 dark:text-white' },
        { label: 'Open', value: overview.open, color: 'text-orange-600 dark:text-orange-400' },
        { label: 'Assigned', value: overview.assigned, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Resolved', value: overview.done, color: 'text-emerald-600 dark:text-emerald-400' },
      ]
    : null;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.analytics')} />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          <span className="ml-3 text-sm text-zinc-500">Loading analytics...</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-300">
          Could not fetch live data — showing sample charts. ({error})
        </div>
      )}

      {!loading && (
        <>
          {/* Stat cards row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((s, i) => (
                <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#111] shadow-sm">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">{s.label}</p>
                  <span className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Line Chart */}
            <div className="md:col-span-2 p-6 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                  {trends.length > 0 ? 'Need Trends Over Time' : 'Resource Demand vs Fulfillment (24h)'}
                </h3>
                <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
                  {trends.length > 0 ? 'BigQuery Data' : 'Sample Data'}
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.text, fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#000' : '#fff',
                        borderRadius: '8px',
                        border: `1px solid ${colors.grid}`,
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="needs" stroke={colors.line1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    {lineData[0]?.fulfilled !== undefined && (
                      <Line type="monotone" dataKey="fulfilled" stroke={colors.line2} strokeWidth={2} dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="p-6 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-6">Distribution by Type</h3>
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors.pie[index % colors.pie.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#000' : '#fff',
                        borderRadius: '8px',
                        border: `1px solid ${colors.grid}`,
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: colors.pie[i % colors.pie.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bar chart section — category breakdown */}
          {overview?.by_category && (
            <div className="mt-6 p-6 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-6">Needs by Category</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.text, fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#000' : '#fff',
                        borderRadius: '8px',
                        border: `1px solid ${colors.grid}`,
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill={colors.line1} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
