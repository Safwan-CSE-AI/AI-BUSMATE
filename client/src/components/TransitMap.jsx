import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Bus, 
  Navigation, 
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Route as RouteIcon,
  Layers
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

// Global in-memory cache for OSRM road geometry
const osrmCache = new Map();

/**
 * Fetch road-snapped geometry from OSRM (Open Source Routing Machine).
 * Connects stops along physical Mangalore streets, flyovers, and highways.
 */
async function fetchRoadGeometry(stops) {
  if (!stops || stops.length < 2) return null;

  const validStops = stops.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number');
  if (validStops.length < 2) return null;

  const coordString = validStops.map(s => `${s.longitude.toFixed(5)},${s.latitude.toFixed(5)}`).join(';');
  
  if (osrmCache.has(coordString)) {
    return osrmCache.get(coordString);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`OSRM HTTP error: ${response.status}`);

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const routeData = data.routes[0];
      // OSRM coordinates are [longitude, latitude], convert to Leaflet [latitude, longitude]
      const latLngs = routeData.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const result = {
        latLngs,
        distanceKm: (routeData.distance / 1000).toFixed(1),
        durationMins: Math.round(routeData.duration / 60),
        isSnapped: true
      };
      osrmCache.set(coordString, result);
      return result;
    }
  } catch (err) {
    console.warn('OSRM road-snapping fallback to stop-to-stop geometry:', err.message);
  }

  // Graceful fallback to direct stop-to-stop lines
  const fallback = {
    latLngs: validStops.map(s => [s.latitude, s.longitude]),
    distanceKm: null,
    durationMins: null,
    isSnapped: false
  };
  return fallback;
}

// Create custom DOM markers using Leaflet's L.divIcon
function createMarkerIcon({ type, sequence, busNumber }) {
  if (type === 'origin') {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-full shadow-lg border-2 border-white whitespace-nowrap animate-bounce">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
            BOARD HERE
          </div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white mt-0.5">
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
          <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white mt-0.5">
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
          <div class="px-2.5 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full shadow-md border-2 border-white whitespace-nowrap">
            TRANSFER HUB
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

  // Intermediate stop with order sequence number
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
        <div class="w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center text-[10px] font-black text-blue-700 hover:scale-125 transition-transform hover:bg-blue-600 hover:text-white">
          ${sequence || '•'}
        </div>
      </div>
    `,
    iconSize: [0, 0]
  });
}

// Moving Bus Simulator Icon
function createMovingBusIcon(busNumber) {
  return L.divIcon({
    className: 'custom-bus-pulse-marker',
    html: `
      <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-white shadow-xl flex items-center justify-center font-black text-[9px] relative z-10">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 4h8m-8 4h4m-5 4h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
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
  height = '440px',
  interactive = true 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const animationRef = useRef(null);
  const busMarkerRef = useRef(null);

  const [activeTile, setActiveTile] = useState('voyager');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roadStats, setRoadStats] = useState({ distanceKm: null, isSnapped: false });
  const [isSimulating, setIsSimulating] = useState(false);
  const [fullRoadPath, setFullRoadPath] = useState([]);

  // Extract sequential stops with valid coordinates from route data
  const stopsList = useMemo(() => {
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
      // Deduplicate consecutive identical stops at transfer interchange
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

  // Extract origin and destination coordinates for Google Maps deep link
  const originStop = stopsList[0];
  const destStop = stopsList[stopsList.length - 1];
  const googleMapsUrl = useMemo(() => {
    if (!originStop || !destStop) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${originStop.latitude},${originStop.longitude}&destination=${destStop.latitude},${destStop.longitude}&travelmode=transit`;
  }, [originStop, destStop]);

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user toggles theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_PROVIDERS[activeTile].url, {
      attribution: TILE_PROVIDERS[activeTile].attribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // Fetch Road Snapped Coordinates and Draw Polylines + Stop Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    let isMounted = true;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (stopsList.length < 2) return;

    const renderRoute = async () => {
      const hasLegs = Array.isArray(route?.legs) && route.legs.length > 1;
      let aggregatedRoadCoords = [];
      let totalDistance = 0;
      let allSnapped = true;

      if (hasLegs) {
        // Multi-leg transfer route: fetch separate road geometry for each leg
        const legColors = ['#2563eb', '#7c3aed']; // Leg 1 Blue, Leg 2 Violet
        const legGlows = ['rgba(37, 99, 235, 0.3)', 'rgba(124, 58, 237, 0.3)'];

        for (let i = 0; i < route.legs.length; i++) {
          const leg = route.legs[i];
          const legStops = Array.isArray(leg.stopDetails) && leg.stopDetails.length > 0 
            ? leg.stopDetails.filter(s => typeof s.latitude === 'number')
            : [];

          if (legStops.length >= 2) {
            const legRoad = await fetchRoadGeometry(legStops);
            if (!isMounted) return;

            const color = legColors[i % legColors.length];
            const glow = legGlows[i % legGlows.length];

            // Outer road halo
            L.polyline(legRoad.latLngs, {
              color: glow,
              weight: 8,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(layerGroup);

            // Core crisp road line
            L.polyline(legRoad.latLngs, {
              color: color,
              weight: 4.5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(layerGroup);

            aggregatedRoadCoords.push(...legRoad.latLngs);
            if (legRoad.distanceKm) totalDistance += parseFloat(legRoad.distanceKm);
            if (!legRoad.isSnapped) allSnapped = false;
          }
        }

        // Draw transfer connector if there is a gap between legs
        if (route.transferPoint && stopsList.length > 2) {
          const transferStop = stopsList.find(s => 
            s.name.toLowerCase().includes(route.transferPoint.toLowerCase())
          );
          if (transferStop) {
            L.circle([transferStop.latitude, transferStop.longitude], {
              radius: 65,
              color: '#f59e0b',
              fillColor: '#fbbf24',
              fillOpacity: 0.35,
              weight: 2.5
            }).addTo(layerGroup);
          }
        }

      } else {
        // Direct route: fetch full road snapped geometry
        const roadResult = await fetchRoadGeometry(stopsList);
        if (!isMounted) return;

        aggregatedRoadCoords = roadResult.latLngs;
        totalDistance = roadResult.distanceKm ? parseFloat(roadResult.distanceKm) : null;
        allSnapped = roadResult.isSnapped;

        // Outer highway glow
        L.polyline(roadResult.latLngs, {
          color: '#3b82f6',
          weight: 8,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layerGroup);

        // Core crisp road line following physical curves
        L.polyline(roadResult.latLngs, {
          color: '#2563eb',
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layerGroup);
      }

      if (isMounted) {
        setFullRoadPath(aggregatedRoadCoords);
        setRoadStats({
          distanceKm: totalDistance ? totalDistance.toFixed(1) : null,
          isSnapped: allSnapped
        });
      }

      // Add Stop Markers with custom icons and detailed popup cards
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

        const popupHtml = `
          <div class="p-3 text-slate-900 font-sans min-w-[220px] space-y-1.5">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full ${isFirst ? 'bg-emerald-500' : isLast ? 'bg-rose-500' : isTransfer ? 'bg-amber-500' : 'bg-blue-600'}"></span>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">
                ${isFirst ? 'Boarding Stop (Origin)' : isLast ? 'Final Destination Stop' : isTransfer ? 'Bus Interchange Hub' : `Stop #${index + 1}`}
              </span>
            </div>
            <h4 class="text-sm font-black leading-snug">${stop.name}</h4>
            ${stop.locality ? `<p class="text-xs text-slate-600">📍 ${stop.locality}</p>` : ''}
            ${stop.landmark ? `<p class="text-[11px] text-slate-500 italic mt-0.5">"${stop.landmark}"</p>` : ''}
            <div class="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              ${stop.code ? `<span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">${stop.code}</span>` : ''}
              <span>${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          closeButton: true,
          className: 'custom-leaflet-popup'
        });
      });

      // Fit bounds to the route road geometry or stop markers
      try {
        const boundsCoords = aggregatedRoadCoords.length > 0 ? aggregatedRoadCoords : stopsList.map(s => [s.latitude, s.longitude]);
        const bounds = L.latLngBounds(boundsCoords);
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 15,
          animate: true
        });
      } catch (e) {
        console.warn('Could not fit map bounds:', e);
      }

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
    };

    renderRoute();

    return () => {
      isMounted = false;
    };
  }, [stopsList, route]);

  // Live Transit Simulation Animation along Physical Road Waypoints
  useEffect(() => {
    if (!isSimulating || !mapInstanceRef.current || !layerGroupRef.current || fullRoadPath.length === 0) {
      if (busMarkerRef.current && layerGroupRef.current) {
        layerGroupRef.current.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    let currentIndex = 0;
    const totalPoints = fullRoadPath.length;
    // Step size based on path length to complete simulation in ~12 seconds
    const step = Math.max(1, Math.floor(totalPoints / 220));

    const initialPoint = fullRoadPath[0];
    const busIcon = createMovingBusIcon(route?.bus);
    const busMarker = L.marker(initialPoint, { icon: busIcon, zIndexOffset: 1000 }).addTo(layerGroup);
    busMarkerRef.current = busMarker;

    const interval = setInterval(() => {
      currentIndex += step;
      if (currentIndex >= totalPoints) {
        currentIndex = 0; // loop simulation
      }
      const nextPoint = fullRoadPath[currentIndex];
      if (nextPoint && busMarkerRef.current) {
        busMarkerRef.current.setLatLng(nextPoint);
      }
    }, 45);

    return () => {
      clearInterval(interval);
      if (busMarkerRef.current && layerGroup) {
        layerGroup.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
    };
  }, [isSimulating, fullRoadPath, route]);

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
    const boundsCoords = fullRoadPath.length > 0 ? fullRoadPath : stopsList.map(s => [s.latitude, s.longitude]);
    const bounds = L.latLngBounds(boundsCoords);
    mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], animate: true });
  };

  return (
    <div className={`relative transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-black/80 flex flex-col p-4 sm:p-8 backdrop-blur-md' 
        : 'w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-50'
    }`}>
      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Route Info Badge & Accuracy Pill */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-bold text-slate-800">
            <Bus className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-xs">
              {route?.bus ? `Bus ${route.bus}` : 'Transit Path'}: {stopsList[0]?.name || originName} ➔ {stopsList[stopsList.length - 1]?.name || destName}
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100">
              {stopsList.length} Stops
            </span>
          </div>

          {/* Road Snapped Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50/95 backdrop-blur-md shadow-md border border-emerald-200/80 text-[11px] font-black text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{roadStats.isSnapped ? 'Physical Road Snapped' : 'GPS Connected'}</span>
            {roadStats.distanceKm && (
              <span className="text-emerald-700 font-extrabold hidden sm:inline">
                • {roadStats.distanceKm} km
              </span>
            )}
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Live Bus Simulator Toggle */}
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-2xl shadow-md border transition-all ${
              isSimulating 
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300' 
                : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
            title={isSimulating ? 'Stop Live Transit Simulation' : 'Simulate Moving Bus on Road'}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                <span className="hidden sm:inline">Simulate Bus</span>
              </>
            )}
          </button>

          {/* Open Live Google Maps */}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:border-emerald-300 rounded-2xl shadow-md border border-slate-200/80 transition-all text-xs font-black"
              title="Open Turn-by-Turn Transit Directions in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

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
            <span>Transfer Hub</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-blue-600 bg-white"></span>
          <span>Stops (Click for landmarks)</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-700 font-bold">
          <span className="w-3 h-1 rounded-full bg-blue-600"></span>
          <span>Road-Snapped Route</span>
        </div>
      </div>
    </div>
  );
}
