import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Filter, MapPin, Layers } from 'lucide-react';
import { selectAllNeeds, selectOpenNeeds } from '../store/needsSlice';
import { selectAvailableVolunteers } from '../store/volunteerSlice';
import useNeeds from '../hooks/useNeeds';
import useVolunteers from '../hooks/useVolunteers';
import { useTranslation } from '../contexts/I18nContext';
import { createMap, createHeatmapLayer, addNeedMarkers, clearMarkers } from '../services/maps';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { matchNeed } from '../services/api';

export default function NeedsMap() {
  const { t } = useTranslation();
  useNeeds();
  useVolunteers();

  const allNeeds = useSelector(selectAllNeeds);
  const openNeeds = useSelector(selectOpenNeeds);
  const availableVols = useSelector(selectAvailableVolunteers);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const heatmapRef = useRef(null);

  const [selectedNeed, setSelectedNeed] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [matchLoading, setMatchLoading] = useState(false);

  const needTypes = ['all', 'food', 'medical', 'shelter', 'water', 'education', 'other'];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const map = await createMap(mapContainerRef.current);
        if (cancelled) return;
        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('[NeedsMap] Google Maps failed to load:', err.message);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Update markers & heatmap when needs change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const filtered = filterType === 'all'
      ? openNeeds
      : openNeeds.filter(n => n.need_type === filterType);

    // Clear old markers
    clearMarkers(markersRef.current);

    // Add markers
    (async () => {
      try {
        markersRef.current = await addNeedMarkers(map, filtered, (need) => {
          setSelectedNeed(need);
        });
      } catch (err) {
        console.warn('[NeedsMap] Marker error:', err.message);
      }

      // Heatmap
      if (showHeatmap) {
        try {
          if (heatmapRef.current) heatmapRef.current.setMap(null);
          heatmapRef.current = await createHeatmapLayer(map, filtered);
        } catch (err) {
          console.warn('[NeedsMap] Heatmap error:', err.message);
        }
      } else if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    })();
  }, [openNeeds, filterType, showHeatmap]);

  const handleMatch = async () => {
    if (!selectedNeed?.id) return;
    setMatchLoading(true);
    try {
      const res = await matchNeed(selectedNeed.id);
      alert(`Matched ${res.data.assignments?.length || 0} volunteer(s)!`);
      setSelectedNeed(null);
    } catch (err) {
      alert('Matching failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setMatchLoading(false);
    }
  };

  const getUrgencyVariant = (need) => {
    const score = need?.urgency_score ?? 0;
    if (score >= 5) return 'critical';
    if (score >= 4) return 'high';
    return 'medium';
  };

  return (
    <div className="animate-fade-in -mx-4 sm:-mx-6 -mt-8 -mb-8 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Map fills viewport */}
      <div className="flex-1 relative">

        {/* Map container */}
        <div ref={mapContainerRef} className="w-full h-full bg-zinc-100 dark:bg-zinc-900" />

        {/* Fallback if no API key */}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-[#0A0A0A]">
            <div
              className="absolute inset-0 opacity-20 dark:opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="text-center z-10 space-y-2">
              <MapPin className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-sm text-zinc-500">Set <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to load the map</p>
              <p className="text-xs text-zinc-400">{openNeeds.length} needs with {openNeeds.filter(n => n.lat && n.lng).length} geocoded locations</p>
            </div>
          </div>
        )}

        {/* Top filter bar */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2 flex-wrap gap-y-2">
          {needTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 backdrop-blur border rounded-md text-xs font-medium shadow-sm transition-colors ${
                filterType === type
                  ? 'bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 border-transparent'
                  : 'bg-white/90 dark:bg-black/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-black'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 backdrop-blur border rounded-md text-xs font-medium shadow-sm transition-colors flex items-center ${
              showHeatmap
                ? 'bg-orange-500/90 text-white border-transparent'
                : 'bg-white/90 dark:bg-black/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <Layers className="w-3 h-3 mr-1.5" />
            Heatmap
          </button>
        </div>

        {/* Selected need panel */}
        {selectedNeed && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 bg-white/95 dark:bg-[#111]/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-5 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <Badge variant={getUrgencyVariant(selectedNeed)}>
                {selectedNeed.need_type} — urgency {selectedNeed.urgency_score}/5
              </Badge>
              <button
                onClick={() => setSelectedNeed(null)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm"
              >✕</button>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
              {selectedNeed.description}
            </h3>
            <div className="flex items-center text-xs text-zinc-500 mb-3">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedNeed.location_description}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
              <span>{selectedNeed.affected_count} affected</span>
              <span>Status: <span className="text-zinc-700 dark:text-zinc-200 uppercase font-medium">{selectedNeed.status}</span></span>
            </div>
            {selectedNeed.status === 'open' && (
              <Button variant="primary" className="w-full" onClick={handleMatch} disabled={matchLoading}>
                {matchLoading ? 'Matching...' : 'Find Best Volunteers'}
              </Button>
            )}
          </div>
        )}

        {/* Bottom legend */}
        <div className="absolute bottom-4 left-4 z-10 flex space-x-4 text-xs font-medium text-zinc-100 bg-black/60 backdrop-blur px-3 py-2 rounded-lg"
             style={selectedNeed ? { display: 'none' } : {}}
        >
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Critical</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5" /> High</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" /> Medium</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> Low</span>
        </div>
      </div>
    </div>
  );
}
