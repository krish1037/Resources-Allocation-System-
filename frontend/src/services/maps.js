import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['visualization', 'places', 'geometry'],
});

let mapsApi = null;

/**
 * Loads the Google Maps JS API once and caches it.
 * All callers await this — safe to call multiple times.
 * Returns the google.maps namespace.
 */
export async function loadMaps() {
  if (mapsApi) return mapsApi;
  mapsApi = await loader.load();
  return mapsApi;
}

/**
 * Creates and mounts a Google Map into a given DOM element ref.
 * @param {HTMLElement} container  — the div to mount into
 * @param {object} options         — override any MapOptions
 * @returns {google.maps.Map}
 */
export async function createMap(container, options = {}) {
  const google = await loadMaps();
  const defaults = {
    center: { lat: 26.9124, lng: 75.7873 },   // Jaipur centre
    zoom: 12,
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
    ],
  };
  return new google.maps.Map(container, { ...defaults, ...options });
}

/**
 * Creates a HeatmapLayer from an array of NeedRecord objects.
 * Weight is driven by priority_score (falls back to urgency_score * 2).
 * @param {google.maps.Map} map
 * @param {Array<NeedRecord>} needs
 * @returns {google.maps.visualization.HeatmapLayer}
 */
export async function createHeatmapLayer(map, needs) {
  const google = await loadMaps();
  const points = needs
    .filter(n => n.lat != null && n.lng != null)
    .map(n => ({
      location: new google.maps.LatLng(n.lat, n.lng),
      weight: n.priority_score ?? (n.urgency_score * 2) ?? 1,
    }));

  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: points,
    map,
    radius: 40,
    opacity: 0.75,
    gradient: [
      'rgba(0, 200, 150, 0)',    // transparent (zero weight)
      'rgba(0, 200, 150, 1)',    // teal   (low urgency)
      'rgba(255, 180, 0, 1)',    // amber  (medium)
      'rgba(255, 80, 0, 1)',     // orange (high)
      'rgba(220, 30, 30, 1)',    // red    (critical)
    ],
  });
  return heatmap;
}

/**
 * Updates an existing HeatmapLayer with a new needs array.
 * Call this when Firestore pushes a realtime update.
 * @param {google.maps.visualization.HeatmapLayer} heatmap
 * @param {Array<NeedRecord>} needs
 */
export async function updateHeatmapData(heatmap, needs) {
  const google = await loadMaps();
  const points = needs
    .filter(n => n.lat != null && n.lng != null)
    .map(n => ({
      location: new google.maps.LatLng(n.lat, n.lng),
      weight: n.priority_score ?? (n.urgency_score * 2) ?? 1,
    }));
  heatmap.setData(points);
}

/**
 * Places urgency-colored markers for each open need on the map.
 * Returns an array of markers so the caller can clear them on re-render.
 * @param {google.maps.Map} map
 * @param {Array<NeedRecord>} needs
 * @param {function} onMarkerClick  — called with (need) when a marker is clicked
 * @returns {Array<google.maps.Marker>}
 */
export async function addNeedMarkers(map, needs, onMarkerClick) {
  const google = await loadMaps();

  const URGENCY_COLORS = {
    1: '#22c55e',   // green-500
    2: '#84cc16',   // lime-500
    3: '#eab308',   // yellow-500
    4: '#f97316',   // orange-500
    5: '#ef4444',   // red-500
  };

  const NEED_TYPE_ICONS = {
    food: 'F', medical: 'M', shelter: 'S',
    water: 'W', education: 'E', other: '?',
  };

  return needs
    .filter(n => n.lat != null && n.lng != null)
    .map(need => {
      const color = URGENCY_COLORS[need.urgency_score] ?? '#94a3b8';
      const label = NEED_TYPE_ICONS[need.need_type] ?? '?';

      const marker = new google.maps.Marker({
        position: { lat: need.lat, lng: need.lng },
        map,
        title: need.description,
        label: {
          text: label,
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: '600',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.92,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 14,
        },
      });

      marker.addListener('click', () => onMarkerClick?.(need));
      return marker;
    });
}

/**
 * Clears an array of markers from the map.
 * Call before re-rendering markers on data update.
 * @param {Array<google.maps.Marker>} markers
 */
export function clearMarkers(markers = []) {
  markers.forEach(m => m.setMap(null));
}

/**
 * Opens a Google Maps Directions URL in a new tab.
 * Used by MatchPanel "Navigate" button.
 * @param {number} destLat
 * @param {number} destLng
 * @param {string} label  — shown as destination name
 */
export function getDirectionsUrl(destLat, destLng, label = '') {
  const dest = encodeURIComponent(label || `${destLat},${destLng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=`;
}

/**
 * Computes straight-line distance between two lat/lng points (Haversine).
 * Mirrors the backend matcher.py haversine_km — used for display only on frontend.
 * @returns {number} distance in km, rounded to 1 decimal
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
