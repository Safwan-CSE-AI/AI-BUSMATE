import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  ArrowRight, 
  Shuffle, 
  Bookmark, 
  History, 
  MapPin, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  Compass,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StopSelect from '../components/StopSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [preference, setPreference] = useState(user?.preferred_mode || 'Balanced');
  const [favorites, setFavorites] = useState({ places: [], routes: [] });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [stopsRes, favRes, histRes] = await Promise.all([
          api.get('/stops'),
          api.get('/favorites').catch(() => ({ data: { favorites: { places: [], routes: [] } } })),
          api.get('/history').catch(() => ({ data: { history: [] } }))
        ]);

        if (stopsRes.data?.stops) {
          setStops(stopsRes.data.stops);
          if (stopsRes.data.stops.length >= 2) {
            setFromStop(stopsRes.data.stops[0].id);
            setToStop(stopsRes.data.stops[1].id);
          }
        }

        if (favRes.data?.favorites) {
          setFavorites(favRes.data.favorites);
        }

        if (histRes.data?.history) {
          setRecentHistory(histRes.data.history.slice(0, 5));
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!fromStop || !toStop) return;
    navigate(`/results?from=${fromStop}&to=${toStop}&pref=${preference}`);
  };

  const swapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const handleQuickPlaceSelect = (targetStopId, isDestination = true) => {
    if (isDestination) {
      setToStop(targetStopId);
    } else {
      setFromStop(targetStopId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading your transit dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Commuter Dashboard</span>
            {user?.is_student && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-900 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Student Concession Pass Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Passenger'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Where are you headed today? Get instant AI-selected bus routes, fare calculations, and transfer points.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link
            to="/favorites"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved ({favorites.places.length + favorites.routes.length})
          </Link>
          <Link
            to="/history"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
        </div>
      </div>

      {/* CORE PROMPT REQUIREMENT: IMMEDIATE SHOW: From -> To -> Find Best Bus */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Quick Route Finder</h2>
              <p className="text-xs text-slate-500">From → To → Find Best Bus</p>
            </div>
          </div>

          <Link
            to="/search"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Advanced Search & Preferences
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <form onSubmit={handleQuickSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <div>
              <StopSelect
                label="From (Boarding Stop)"
                stops={stops}
                value={fromStop}
                onChange={setFromStop}
                placeholder="Choose starting location..."
                iconColor="text-blue-600"
              />
            </div>

            <button
              type="button"
              onClick={swapStops}
              title="Swap From and To"
              className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all hover:scale-110"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <div>
              <StopSelect
                label="To (Destination Stop)"
                stops={stops}
                value={toStop}
                onChange={setToStop}
                placeholder="Choose destination..."
                iconColor="text-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Preference:</span>
              {['Balanced', 'Fastest', 'Cheapest', 'Fewest Transfers'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreference(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                    preference === p
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Find Best Bus CTA */}
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Find Best Bus
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Place Shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Quick Destination:
          </span>
          {favorites.places.length > 0 ? (
            favorites.places.map((place) => {
              const stopName = place.custom_name || place.stop?.name || stops.find(s => s.id === place.stop_id)?.name || place.label;
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleQuickPlaceSelect(place.stop_id, true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs hover:scale-[1.02]"
                >
                  <span className="font-extrabold text-blue-600">{place.label}:</span>
                  <span className="text-slate-600">{stopName}</span>
                </button>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 italic">No saved locations yet.</span>
              <Link to="/favorites" className="text-blue-600 font-bold hover:underline">
                + Pin Home / College in Favorites
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* DASHBOARD GRID: Recent Searches & Saved Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Searches */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Recent Route Searches
            </h3>
            <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          {recentHistory.length > 0 ? (
            <div className="space-y-2.5">
              {recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.origin_name} ➔ {item.destination_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Preference: {item.preference} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFromStop(item.origin_stop_id);
                      setToStop(item.destination_stop_id);
                      setPreference(item.preference || 'Balanced');
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 rounded-lg shrink-0 transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent searches yet. Search for a route above!
            </div>
          )}
        </section>

        {/* Saved Favorite Routes */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              Bookmarked Routes
            </h3>
            <Link to="/favorites" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage
            </Link>
          </div>

          {favorites.routes.length > 0 ? (
            <div className="space-y-2.5">
              {favorites.routes.slice(0, 5).map((fav) => (
                <div
                  key={fav.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {fav.custom_label || `${fav.from_stop_name} ➔ ${fav.to_stop_name}`}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      From {fav.from_stop_name} to {fav.to_stop_name}
                    </p>
                  </div>
                  <Link
                    to={`/results?from=${fav.from_stop_id}&to=${fav.to_stop_id}`}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 transition-colors"
                  >
                    Find Now
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No saved routes yet. When you view route search results, tap "Save Route" to bookmark them here.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
