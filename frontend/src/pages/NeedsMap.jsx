import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useNeeds from '../hooks/useNeeds';
import { Loader } from '@googlemaps/js-api-loader';
import MatchPanel from '../components/MatchPanel';
import { triggerMatch } from '../services/api';

export default function NeedsMap() {
  const { needs, loading } = useNeeds();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matching, setMatching] = useState(false);
  const markersRef = useRef([]);

  useEffect(() => {
      const initMap = async () => {
          const loader = new Loader({
              apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
              version: "weekly",
              libraries: ["visualization"]
          });
          const google = await loader.load();
          
          if (!mapInstanceRef.current && mapRef.current) {
              mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                  center: { lat: 20.5937, lng: 78.9629 },
                  zoom: 5,
                  mapId: "DEMO_MAP_ID"
              });
          }
          
          const map = mapInstanceRef.current;
          const infoWindow = new google.maps.InfoWindow();
          
          markersRef.current.forEach(m => m.setMap(null));
          markersRef.current = [];
          
          needs.filter(n => n.status === 'open').forEach(need => {
             if(need.lat && need.lng) {
                 const color = need.urgency_score >= 4 ? 'red' : need.urgency_score >= 3 ? 'yellow' : 'green';
                 const m = new google.maps.Marker({
                     map,
                     position: { lat: need.lat, lng: need.lng },
                     title: need.need_type,
                     icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
                 });
                 m.addListener('click', () => {
                     setSelectedNeed(need);
                     infoWindow.setContent(`
                        <div style="color:#1e293b; font-family:sans-serif; padding:4px;">
                           <h3 style="font-weight:bold; font-size:16px;">${need.need_type.toUpperCase()}</h3>
                           <p>${need.description}</p>
                           <p><strong>Urgency:</strong> ${need.urgency_score}</p>
                        </div>
                     `);
                     infoWindow.open(map, m);
                 });
                 markersRef.current.push(m);
             }
          });
      };
      
      if (!loading) {
          initMap();
      }
  }, [needs, loading]);

  const handleMatch = async () => {
      if(!selectedNeed) return;
      setMatching(true);
      try {
          const res = await triggerMatch(selectedNeed.id);
          setMatchData(res.data);
          toast.success('Found best volunteer matches!');
      } catch(e) {
          // Handled by global interceptor
      } finally {
          setMatching(false);
      }
  };

  return (
    <div className="relative w-full h-screen bg-slate-50 flex">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {selectedNeed && !matchData && (
          <div className="absolute top-4 left-4 bg-white p-5 rounded shadow-sm z-10 w-80 border-l-4 border-l-teal-600">
              <h2 className="text-xl font-bold text-slate-800 mb-2 truncate">{selectedNeed.location_description}</h2>
              <p className="text-slate-600 text-sm mb-4">{selectedNeed.description}</p>
              <button onClick={handleMatch} disabled={matching} className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded hover:bg-teal-700 shadow-sm transition">
                  {matching ? 'Running Matching Engine...' : 'Find Volunteers'}
              </button>
          </div>
      )}
      
      {matchData && (
          <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-20 overflow-y-auto">
              <MatchPanel matchResponse={matchData} onClose={() => setMatchData(null)} />
          </div>
      )}
    </div>
  );
}
