import React from 'react';
import { useSelector } from 'react-redux';
import { Plus, MapPin, Filter } from 'lucide-react';
import { selectAllNeeds, selectOpenNeeds } from '../store/needsSlice';
import { selectAvailableVolunteers } from '../store/volunteerSlice';
import useNeeds from '../hooks/useNeeds';
import useVolunteers from '../hooks/useVolunteers';
import { useTranslation } from '../contexts/I18nContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import HeatmapLayer from '../components/HeatmapLayer';

export default function Dashboard() {
  const { t } = useTranslation();

  // Start Firestore realtime listeners → populates Redux
  useNeeds();
  useVolunteers();

  const allNeeds = useSelector(selectAllNeeds);
  const openNeeds = useSelector(selectOpenNeeds);
  const availableVols = useSelector(selectAvailableVolunteers);

  const assigned = allNeeds.filter(n => n.status === 'assigned').length;
  const done = allNeeds.filter(n => n.status === 'done').length;
  const total = allNeeds.length;
  const successRate = total > 0 ? ((done / total) * 100).toFixed(1) + '%' : '—';

  // Sort by priority for the feed
  const topNeeds = [...openNeeds]
    .sort((a, b) => (b.priority_score ?? b.urgency_score ?? 0) - (a.priority_score ?? a.urgency_score ?? 0))
    .slice(0, 8);

  // Map urgency_score to urgency label for Badge
  const getUrgencyVariant = (need) => {
    const score = need.urgency_score ?? 0;
    if (score >= 5) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'default';
  };

  const getTimeAgo = (created_at) => {
    if (!created_at) return '';
    const date = created_at?.toDate ? created_at.toDate() : new Date(created_at);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.dashboard')}
        action={<Button icon={Plus} variant="primary">New Allocation</Button>}
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dash.totalNeeds'), val: total || '0', trend: `${openNeeds.length} open`, color: 'text-zinc-900 dark:text-white' },
          { label: t('dash.active'), val: openNeeds.length, trend: openNeeds.filter(n => (n.urgency_score ?? 0) >= 4).length + ' critical', color: 'text-red-600 dark:text-red-400' },
          { label: t('dash.volunteers'), val: availableVols.length, trend: 'available', color: 'text-zinc-900 dark:text-white' },
          { label: t('dash.matched'), val: successRate, trend: `${done} resolved`, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#111] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-semibold tracking-tight ${stat.color}`}>{stat.val}</span>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Split Layout: Feed & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Activity Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-white">Live Request Stream</h2>
            <div className="flex items-center space-x-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs text-zinc-500">Syncing</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-auto pr-1">
            {topNeeds.length === 0 && (
              <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-400">No open needs yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Ingest data or run the seed script to get started.</p>
              </div>
            )}
            {topNeeds.map((need) => (
              <div
                key={need.id}
                className="group p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#111] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={getUrgencyVariant(need)}>
                    {need.need_type}
                  </Badge>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {getTimeAgo(need.created_at)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">
                  {need.description}
                </h3>
                <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-3 h-3 mr-1 opacity-70" />
                  {need.location_description}
                </div>
                {need.affected_count > 0 && (
                  <p className="text-[10px] text-zinc-400 mt-2">
                    {need.affected_count} people affected
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Tactical Map */}
        <div className="lg:col-span-2 flex flex-col min-h-[500px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#0A0A0A] relative shadow-sm">
          {/* Map filter overlay */}
          <div className="absolute top-4 left-4 z-10 flex space-x-2">
            <div className="px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm flex items-center">
              <Filter className="w-3 h-3 mr-1.5" /> All Sectors
            </div>
          </div>

          {/* Actual Google Maps Heatmap or fallback grid */}
          <div className="flex-1 relative">
            {openNeeds.some(n => n.lat && n.lng) ? (
              <HeatmapLayer needs={openNeeds} />
            ) : (
              <>
                {/* Grid background fallback */}
                <div
                  className="absolute inset-0 opacity-20 dark:opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Simulated radar points */}
                <div className="absolute inset-0">
                  <div className="absolute top-[30%] left-[40%] flex items-center justify-center">
                    <div className="w-16 h-16 border border-red-500/30 rounded-full animate-ping absolute" />
                    <div className="w-3 h-3 bg-red-500 rounded-full z-10 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                  </div>
                  <div className="absolute top-[60%] left-[60%] w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                  <div className="absolute top-[45%] left-[25%] w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="absolute top-[20%] left-[70%] w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              </>
            )}
          </div>

          {/* Map footer legend */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur flex justify-between items-center z-10">
            <div className="flex space-x-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Critical ({openNeeds.filter(n => (n.urgency_score ?? 0) >= 4).length})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                Active ({openNeeds.length})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Volunteers ({availableVols.length})
              </span>
            </div>
            <Button variant="secondary" className="text-xs py-1 h-7">Expand View</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
