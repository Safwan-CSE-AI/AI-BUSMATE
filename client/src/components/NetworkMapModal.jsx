import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  X, 
  MapPin, 
  Search, 
  Navigation, 
  Check, 
  Compass, 
  Bus,
  Layers,
  Sparkles
} from 'lucide-react';

export default function NetworkMapModal({ 
  isOpen, 
  onClose, 
  stops = [], 
  onSelectFrom, 
  onSelectTo, 
  currentFromId, 
  currentToId 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStop, setSelectedStop] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Mangalore
      const map = L.map(mapContainerRef.current, {
        center: [12.8900, 74.8450],
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    markersRef.current.clear();

    // Plot all stops
    const validStops = stops.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number');

    validStops.forEach(stop => {
      const isFrom = stop.id === currentFromId;
      const isTo = stop.id === currentToId;

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 border-2 border-white ${
            isFrom 
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-300' 
              : isTo 
                ? 'bg-rose-600 text-white ring-4 ring-rose-300' 
                : stop.locality?.toLowerCase().includes('state bank') || stop.code === 'SBK-01'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-800'
          }">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-network-marker',
        html: markerHtml,
        iconSize: [0, 0]
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);
      marker.on('click', () => {
        setSelectedStop(stop);
      });

      markersRef.current.set(stop.id, marker);
    });

    if (validStops.length > 0) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      try {
        map.fitBounds(group.getBounds().pad(0.1));
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map reference or cleanup
    };
  }, [isOpen, stops, currentFromId, currentToId]);

  if (!isOpen) return null;

  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.locality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFlyToStop = (stop) => {
    setSelectedStop(stop);
    if (mapInstanceRef.current && stop.latitude && stop.longitude) {
      mapInstanceRef.current.flyTo([stop.latitude, stop.longitude], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Mangalore Transit Network Map
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any bus stop on the map to set as starting point or destination
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Map + Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          
          {/* Left / Bottom Stop Picker Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-white shrink-0 h-48 md:h-auto overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Find stop (e.g. Kunjathbail)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Stops List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredStops.map(s => {
                const isSelected = selectedStop?.id === s.id;
                const isFrom = currentFromId === s.id;
                const isTo = currentToId === s.id;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleFlyToStop(s)}
                    className={`w-full text-left p-3 text-xs transition-colors flex items-start justify-between gap-2 ${
                      isSelected ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-900 truncate">{s.name}</span>
                        {isFrom && <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">FROM</span>}
                        {isTo && <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">TO</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{s.locality}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{s.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative min-h-0">
            <div ref={mapContainerRef} className="w-full h-full bg-slate-100 z-0" />

            {/* Selected Stop Floating Action Card */}
            {selectedStop && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">{selectedStop.code}</span>
                    <h4 className="text-sm font-black text-slate-900 leading-snug">{selectedStop.name}</h4>
                    <p className="text-xs text-slate-500">📍 {selectedStop.locality}</p>
                    {selectedStop.landmark && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">"{selectedStop.landmark}"</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStop(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFrom(selectedStop.id);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Set as Starting Stop
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTo(selectedStop.id);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Set as Destination
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
