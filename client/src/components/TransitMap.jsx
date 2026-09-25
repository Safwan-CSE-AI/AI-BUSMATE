import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Compass, 
  Bus, 
  Navigation, 
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const TILE_PROVIDERS = {
  voyager: {
    name: 'Transit Clear',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  dark: {
    name: 'Night Vision',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
};

// Create custom DOM markers using Leaflet's L.divIcon
function createMarkerIcon({ type, label, sequence, busNumber }) {
  if (type === 'origin') {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-full shadow-lg border-2 border-white whitespace-nowrap animate-bounce">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
            BOARD HERE
          </div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-3 border-white shadow-xl flex items-center justify-center text-white mt-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 4h8m-8 4h4m-5 4h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="w-2 h-2 rounded-full bg-emerald-700 mt-[-2px]"></div>
        </div>
      `,
      iconSize: [0, 0]
    });
  }

  if (type === 'destination') {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-[11px] font-black rounded-full shadow-lg border-2 border-white whitespace-nowrap">
            DESTINATION
          </div>
          <div class="w-8 h-8 rounded-full bg-rose-600 border-3 border-white shadow-xl flex items-center justify-center text-white mt-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path>
            </svg>
          </div>
          <div class="w-2 h-2 rounded-full bg-rose-700 mt-[-2px]"></div>
        </div>
      `,
      iconSize: [0, 0]
    });
  }

  if (type === 'transfer') {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="px-2 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full shadow-md border-2 border-white whitespace-nowrap">
            TRANSFER POINT
          </div>
          <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white mt-0.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });
  }

  // Default intermediate stop
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
        <div class="w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center text-[10px] font-bold text-blue-700 hover:scale-125 transition-transform hover:bg-blue-600 hover:text-white">
          ${sequence || '•'}
        </div>
      </div>
    `,
    iconSize: [0, 0]
  });
}

export default function TransitMap({ 
  route, 
  originName, 
  destName,
  height = '420px',
  interactive = true 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [activeTile, setActiveTile] = useState('voyager');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStopPopup, setSelectedStopPopup] = useState(null);

  // Extract stops with coordinates from route data
  const stopsList = React.useMemo(() => {
    if (!route) return [];

    // Check if route.stopDetails exists
    if (Array.isArray(route.stopDetails) && route.stopDetails.length > 0) {
      return route.stopDetails.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number');
    }

    // Check if route.legs have stopDetails
    if (Array.isArray(route.legs) && route.legs.length > 0) {
      const allLegStops = [];
      route.legs.forEach(leg => {
        if (Array.isArray(leg.stopDetails)) {
          allLegStops.push(...leg.stopDetails);
        }
      });
      // Deduplicate consecutive identical stops at transfer point
      const unique = [];
      allLegStops.forEach(s => {
        if (!unique.some(u => u.name === s.name)) {
          unique.push(s);
        }
      });
      if (unique.length > 0) return unique.filter(s => typeof s.latitude === 'number');
    }

    // Check if route.stops is provided directly (e.g. on RouteDetailPage)
    if (Array.isArray(route.stops) && route.stops.length > 0) {
      return route.stops
        .map(rs => ({
          name: rs.stop_name || rs.name,
          locality: rs.locality,
          landmark: rs.landmark,
          code: rs.code,
          latitude: Number(rs.latitude || rs.lat),
          longitude: Number(rs.longitude || rs.lng || rs.long),
          isMajorInterchange: rs.is_major_interchange
        }))
        .filter(s => !isNaN(s.latitude) && !isNaN(s.longitude) && s.latitude !== 0);
    }

    return [];
  }, [route]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = [12.8700, 74.8500]; // Mangalore city center
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: true
      });

      // Add zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add base tile layer
      tileLayerRef.current = L.tileLayer(TILE_PROVIDERS[activeTile].url, {
        attribution: TILE_PROVIDERS[activeTile].attribution,
        maxZoom: 19
      }).addTo(map);

      // Layer group for route markers and polylines
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user toggles tile theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_PROVIDERS[activeTile].url, {
      attribution: TILE_PROVIDERS[activeTile].attribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // Render Route Markers and Polyline whenever stopsList changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (stopsList.length === 0) return;

    const latLngs = stopsList.map(s => [s.latitude, s.longitude]);

    // 1. Draw glowing polyline
    // Outer glow line
    const glowLine = L.polyline(latLngs, {
      color: '#3b82f6',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layerGroup);

    // Inner crisp route line
    const coreLine = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.95,
      dashArray: route?.transfers > 0 ? '6, 8' : undefined
    }).addTo(layerGroup);

    // 2. Add Markers for each stop
    stopsList.forEach((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === stopsList.length - 1;
      const isTransfer = route?.transferPoint && stop.name.toLowerCase().includes(route.transferPoint.toLowerCase());

      let markerType = 'intermediate';
      if (isFirst) markerType = 'origin';
      else if (isLast) markerType = 'destination';
      else if (isTransfer) markerType = 'transfer';

      const icon = createMarkerIcon({
        type: markerType,
        sequence: index + 1,
        busNumber: route?.bus
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(layerGroup);

      // Popup Content
      const popupHtml = `
        <div class="p-3 text-slate-900 font-sans min-w-[210px] space-y-1.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${isFirst ? 'bg-emerald-500' : isLast ? 'bg-rose-500' : isTransfer ? 'bg-amber-500' : 'bg-blue-600'}"></span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ${isFirst ? 'Starting Boarding Stop' : isLast ? 'Final Destination' : isTransfer ? 'Bus Interchange Stop' : `Stop #${index + 1}`}
            </span>
          </div>
          <h4 class="text-sm font-black leading-snug">${stop.name}</h4>
          ${stop.locality ? `<p class="text-xs text-slate-600">📍 ${stop.locality}</p>` : ''}
          ${stop.landmark ? `<p class="text-[11px] text-slate-500 italic mt-0.5">"${stop.landmark}"</p>` : ''}
          ${stop.code ? `<div class="mt-2 inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">Code: ${stop.code}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'custom-leaflet-popup'
      });
    });

    // 3. Auto-fit bounds with padding
    try {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
        animate: true
      });
    } catch (e) {
      console.warn('Could not fit map bounds:', e);
    }

    // Invalidate size to ensure crisp rendering after layout paint
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [stopsList, route]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current || stopsList.length === 0) return;
    const latLngs = stopsList.map(s => [s.latitude, s.longitude]);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  return (
    <div className={`relative transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-black/80 flex flex-col p-4 sm:p-8 backdrop-blur-md' 
        : 'w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-50'
    }`}>
      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Route Info Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-bold text-slate-800">
          <Bus className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate max-w-[180px] sm:max-w-xs">
            {route?.bus ? `Bus ${route.bus}` : 'Route Path'}: {stopsList[0]?.name || originName} ➔ {stopsList[stopsList.length - 1]?.name || destName}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100">
            {stopsList.length} Stops Plotted
          </span>
        </div>

        {/* Map Control Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Layer Selector */}
          <div className="flex bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 p-1">
            {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTile(key)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all ${
                  activeTile === key 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={provider.name}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetView}
            className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-blue-600 rounded-2xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors"
            title="Reset to Fit Route"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-blue-600 rounded-2xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div 
        ref={mapContainerRef} 
        style={{ height: isFullscreen ? '100%' : height }}
        className="w-full z-0 bg-slate-100"
      />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-xs border border-slate-200/80 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white"></span>
          <span>Destination</span>
        </div>
        {route?.transfers > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
            <span>Transfer Point</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-blue-600 bg-white"></span>
          <span>Intermediate Stops (Click for details)</span>
        </div>
      </div>
    </div>
  );
}
