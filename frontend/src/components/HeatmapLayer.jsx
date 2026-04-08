import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function HeatmapLayer({ needs }) {
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["visualization"]
      });
      const googleMaps = await loader.load();

      if (!mapRef.current) return;

      if (!googleMapRef.current) {
        googleMapRef.current = new googleMaps.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 12,
          mapTypeId: "roadmap"
        });
      }

      const data = needs.filter(n => n.lat && n.lng).map(n => ({
        location: new googleMaps.maps.LatLng(n.lat, n.lng),
        weight: n.priority_score || n.urgency_score || 1
      }));

      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
      heatmapRef.current = new googleMaps.maps.visualization.HeatmapLayer({
        data,
        map: googleMapRef.current,
        radius: 30
      });
    };
    init();
  }, [needs]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] bg-slate-200" />;
}
