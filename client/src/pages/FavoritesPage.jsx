import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bookmark, 
  MapPin, 
  Bus, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Check, 
  Building, 
  Home, 
  GraduationCap, 
  Briefcase,
  Navigation,
  Locate,
  Compass,
  Sparkles,
  ExternalLink,
  Map as MapIcon,
  ChevronRight,
  Plane,
  HeartPulse,
  ShoppingBag,
  Train
} from 'lucide-react';
import StopSelect from '../components/StopSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const POPULAR_HUBS = [
  {
    label: 'Central Hub',
    code: 'SBK-01',
    name: 'State Bank (Service Bus Stand)',
    locality: 'State Bank Central',
    icon: 'Building',
    color: 'bg-blue-600',
    iconComp: Building
  },
  {
    label: 'Engineering Campus',
    code: 'NIT-11',
    name: 'NITK Surathkal Campus Gate',
    locality: 'Srinivasnagar',
    icon: 'GraduationCap',
    color: 'bg-emerald-600',
    iconComp: GraduationCap
  },
  {
    label: 'Residential Suburb',
    code: 'KJB-25',
    name: 'Kunjathbail / Kunjethbail (Main Bus Stand)',
    locality: 'Kunjathbail',
    icon: 'Home',
    color: 'bg-indigo-600',
    iconComp: Home
  },
  {
    label: 'Intercity Terminal',
    code: 'KBJ-05',
    name: 'KSRTC Bus Stand Bejai',
    locality: 'Bejai',
    icon: 'Bus',
    color: 'bg-amber-600',
    iconComp: Bus
  },
  {
    label: 'University Campus',
    code: 'MU-N-16',
    name: 'Mangalore University North Gate',
    locality: 'Konaje',
    icon: 'GraduationCap',
    color: 'bg-purple-600',
    iconComp: GraduationCap
  },
  {
    label: 'International Airport',
    code: 'IXE-23',
    name: 'Mangalore International Airport (IXE)',
    locality: 'Kenjar / Bajpe',
    icon: 'Plane',
    color: 'bg-sky-600',
    iconComp: Plane
  },
  {
    label: 'Medical College Hub',
    code: 'DLK-15',
    name: 'Deralakatte Medical Hub',
    locality: 'Deralakatte',
    icon: 'HeartPulse',
    color: 'bg-rose-600',
    iconComp: HeartPulse
  },
  {
    label: 'Railway Concourse',
    code: 'MAQ-21',
    name: 'Mangalore Central Railway Station (MAQ)',
    locality: 'Attavar',
    icon: 'Train',
    color: 'bg-teal-600',
    iconComp: Train
  }
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState({ places: [], routes: [] });
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newStopId, setNewStopId] = useState('');
  const [newCustomName, setNewCustomName] = useState('');
  const [savingPlace, setSavingPlace] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [showMap, setShowMap] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const loadData = async () => {
    try {
      const [favRes, stopsRes] = await Promise.all([
        api.get('/favorites'),
        api.get('/stops')
      ]);

      const allStops = stopsRes.data?.stops || [];
      if (allStops.length > 0) setStops(allStops);

      if (favRes.data?.favorites) {
        const rawPlaces = favRes.data.favorites.places || [];
        const rawRoutes = favRes.data.favorites.routes || [];

        // Ensure every place has its complete stop object with name, locality, coords
        const enrichedPlaces = rawPlaces.map(p => {
          const matchedStop = p.stop || p.bus_stops || allStops.find(s => s.id === p.stop_id || s.name === p.stop_id);
          return { ...p, stop: matchedStop };
        });

        // Ensure every route has resolved from_stop_name and to_stop_name
        const enrichedRoutes = rawRoutes.map(r => {
          const fromStop = allStops.find(s => s.id === r.from_stop_id || s.name === r.from_stop_id);
          const toStop = allStops.find(s => s.id === r.to_stop_id || s.name === r.to_stop_id);
          return {
            ...r,
            from_stop_name: r.from_stop_name || fromStop?.name || 'Boarding Stop',
            to_stop_name: r.to_stop_name || toStop?.name || 'Destination'
          };
        });

        setFavorites({ places: enrichedPlaces, routes: enrichedRoutes });
      }
    } catch (err) {
      console.warn('Load favorites error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize or update interactive map
  useEffect(() => {
    if (!mapContainerRef.current || !showMap) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.8700, 74.8500],
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const validPlaces = favorites.places.filter(p => p.stop && typeof p.stop.latitude === 'number');

    if (validPlaces.length > 0) {
      const latLngs = [];

      validPlaces.forEach((place) => {
        const stop = place.stop;
        latLngs.push([stop.latitude, stop.longitude]);

        const markerHtml = `
          <div class="relative flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-md border-2 border-white whitespace-nowrap">
              ${place.label}
            </div>
            <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white mt-0.5 group-hover:scale-110 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'favorite-pin-marker',
          html: markerHtml,
          iconSize: [0, 0]
        });

        const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(markersGroup);

        const popupHtml = `
          <div class="p-3 text-slate-900 font-sans min-w-[210px] space-y-1.5">
            <span class="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black">
              ${place.label}
            </span>
            <h4 class="text-sm font-black leading-snug">${place.custom_name || stop.name}</h4>
            <p class="text-xs text-slate-600">📍 ${stop.name} (${stop.locality})</p>
            ${stop.landmark ? `<p class="text-[11px] text-slate-500 italic mt-0.5">"${stop.landmark}"</p>` : ''}
            <div class="pt-2 flex items-center gap-2">
              <a href="/results?to=${stop.id}" class="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Ride TO here ➔
              </a>
              <a href="/results?from=${stop.id}" class="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                Ride FROM
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
      });

      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 250);

  }, [favorites.places, showMap]);

  // GPS Geolocation: Detect nearest bus stop to user's real physical coordinates
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (stops.length === 0) {
          setGpsStatus('No stops loaded to compare.');
          return;
        }

        // Calculate distance to each stop (Haversine formula approximation)
        let closestStop = null;
        let minDistanceKm = Infinity;

        stops.forEach((stop) => {
          if (typeof stop.latitude === 'number' && typeof stop.longitude === 'number') {
            const dLat = (stop.latitude - latitude) * (Math.PI / 180);
            const dLon = (stop.longitude - longitude) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latitude * (Math.PI / 180)) *
                Math.cos(stop.latitude * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = 6371 * c;

            if (distanceKm < minDistanceKm) {
              minDistanceKm = distanceKm;
              closestStop = stop;
            }
          }
        });

        if (closestStop) {
          setNewStopId(closestStop.id);
          setNewCustomName(`My Current Location (${closestStop.name})`);
          setNewLabel('My Current Location');
          setShowAddPlace(true);
          const meters = Math.round(minDistanceKm * 1000);
          setGpsStatus(`✓ Found nearest stop: ${closestStop.name} (~${meters < 1000 ? `${meters}m` : `${minDistanceKm.toFixed(1)}km`} away)`);
        } else {
          setGpsStatus('Could not match a nearby Mangalore bus stop.');
        }
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setGpsStatus('Could not access GPS. Please choose a stop from the list.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!newStopId) return;
    setSavingPlace(true);
    try {
      await api.post('/favorites', {
        type: 'place',
        label: newLabel,
        stop_id: newStopId,
        custom_name: newCustomName || newLabel
      });
      setShowAddPlace(false);
      setNewCustomName('');
      setGpsStatus('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save favorite place.');
    } finally {
      setSavingPlace(false);
    }
  };

  const handleQuickAddPopularHub = async (hub) => {
    const targetStop = stops.find(s => s.code === hub.code || s.name.toLowerCase().includes(hub.name.toLowerCase()));
    if (!targetStop) {
      alert(`Could not find stop: ${hub.name}`);
      return;
    }

    try {
      await api.post('/favorites', {
        type: 'place',
        label: hub.label,
        stop_id: targetStop.id,
        custom_name: hub.name,
        icon: hub.icon
      });
      await loadData();
    } catch (err) {
      console.warn('Quick add error:', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(prev => ({
        places: prev.places.filter(p => p.id !== id),
        routes: prev.routes.filter(r => r.id !== id)
      }));
    } catch (err) {
      console.warn('Delete favorite failed:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading your favorite places & routes..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
              Personal Transit Shortcuts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Bookmark className="w-6 h-6 text-amber-500" />
            Favorite Locations & Routes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pin your Home, College, Workplace, or frequent bus routes for instantaneous 1-click commuting across Mangalore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Use GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectGPSLocation}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-xs flex items-center gap-1.5 transition-all"
            title="Detect GPS location and find nearest Mangalore bus stop"
          >
            <Locate className="w-4 h-4 text-emerald-600" />
            <span>Use GPS Location</span>
          </button>

          {/* Save New Place Button */}
          <button
            onClick={() => setShowAddPlace(!showAddPlace)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Save Location</span>
          </button>
        </div>
      </div>

      {/* GPS Status Message if active */}
      {gpsStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{gpsStatus}</span>
          </div>
          <button
            onClick={() => setGpsStatus('')}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Place Drawer / Form */}
      {showAddPlace && (
        <form onSubmit={handleAddPlace} className="bg-white rounded-3xl p-6 border-2 border-blue-500/30 shadow-lg space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add New Favorite Location</h3>
              <p className="text-xs text-slate-500">Assign a friendly name to any Mangalore bus stop.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPlace(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location Category
              </label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="Home">🏠 Home</option>
                <option value="University / College">🎓 University / College</option>
                <option value="Hostel">🏢 Hostel</option>
                <option value="Work / IT SEZ">💼 Work / IT SEZ</option>
                <option value="Central Hub">🏛️ Central Hub</option>
                <option value="Library">📚 Library / Study Hall</option>
                <option value="Shopping Mall">🛍️ Shopping Mall</option>
                <option value="My Current Location">📍 My Current Location</option>
              </select>
            </div>

            <div>
              <StopSelect
                label="Associated Bus Stop"
                stops={stops}
                value={newStopId}
                onChange={setNewStopId}
                placeholder="Choose nearest stop..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                placeholder="e.g. My Flat in Kunjathbail"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddPlace(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingPlace || !newStopId}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 shadow-xs"
            >
              {savingPlace ? 'Saving...' : 'Save Location Pin'}
            </button>
          </div>
        </form>
      )}

      {/* QUICK ADD: POPULAR MANGALORE COMMUTE HUBS */}
      <section className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              1-Click Popular Mangalore Locations
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Tap to instantly pin to your favorites</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {POPULAR_HUBS.map((hub) => {
            const alreadyAdded = favorites.places.some(
              p => p.stop?.code === hub.code || p.stop?.name.toLowerCase().includes(hub.name.toLowerCase())
            );

            const IconComponent = hub.iconComp;

            return (
              <button
                key={hub.code}
                type="button"
                onClick={() => !alreadyAdded && handleQuickAddPopularHub(hub)}
                disabled={alreadyAdded}
                className={`p-3 rounded-2xl text-left border transition-all flex items-start justify-between gap-2 ${
                  alreadyAdded
                    ? 'bg-white/80 border-slate-200 opacity-60 cursor-default'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs hover:scale-[1.01]'
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {hub.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold truncate">
                    {hub.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    📍 {hub.locality}
                  </p>
                </div>

                <div className={`w-7 h-7 rounded-xl ${hub.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  {alreadyAdded ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE MAP: SAVED LOCATIONS */}
      {favorites.places.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-blue-600" />
              Interactive Map of Your Saved Locations
            </h3>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 transition-colors"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && (
            <div className="w-full h-72 sm:h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 relative">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{favorites.places.length} Locations Plotted on Mangalore Map</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 1: Saved Places Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Saved Locations ({favorites.places.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Quick 1-tap departure or arrival</span>
        </div>

        {favorites.places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.places.map((place) => {
              const stop = place.stop;
              const hasCoords = stop && typeof stop.latitude === 'number';

              return (
                <div
                  key={place.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    {/* Badge & Delete button */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                        {place.label}
                      </span>

                      <button
                        onClick={() => handleDelete(place.id)}
                        title="Remove from favorites"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Location Name */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {place.custom_name || stop?.name || place.label}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        📍 {stop?.name || 'Mangalore Bus Stop'}
                      </p>
                      {stop?.locality && (
                        <p className="text-[11px] text-slate-500">
                          {stop.locality}
                        </p>
                      )}
                      {stop?.landmark && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          "{stop.landmark}"
                        </p>
                      )}
                    </div>

                    {/* GPS Coordinates pill */}
                    {hasCoords && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-mono text-slate-500 border border-slate-100">
                        <span>{stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</span>
                        {stop.code && <span>• {stop.code}</span>}
                      </div>
                    )}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/results?to=${place.stop_id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                    >
                      Ride TO Here
                    </Link>
                    <Link
                      to={`/results?from=${place.stop_id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Ride FROM
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-2">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No saved locations yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap "Use GPS Location" above to auto-detect your stop, or choose from the 1-Click Popular Mangalore Locations.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: Saved Routes */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Bus className="w-4 h-4 text-indigo-600" />
            Saved Favorite Commute Routes ({favorites.routes.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Instant transit schedule finder</span>
        </div>

        {favorites.routes.length > 0 ? (
          <div className="space-y-3">
            {favorites.routes.map((fav) => (
              <div
                key={fav.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {fav.custom_label || `${fav.from_stop_name} ➔ ${fav.to_stop_name}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{fav.from_stop_name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{fav.to_stop_name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Link
                    to={`/results?from=${fav.from_stop_id}&to=${fav.to_stop_id}`}
                    className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    Search Route Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(fav.id)}
                    title="Delete saved route"
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No saved routes yet. Search for any route on the home page and tap "Save Route" to keep it handy here.
          </p>
        )}
      </section>

    </div>
  );
}
