import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Briefcase 
} from 'lucide-react';
import StopSelect from '../components/StopSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState({ places: [], routes: [] });
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newStopId, setNewStopId] = useState('');
  const [newCustomName, setNewCustomName] = useState('');
  const [savingPlace, setSavingPlace] = useState(false);

  const loadData = async () => {
    try {
      const [favRes, stopsRes] = await Promise.all([
        api.get('/favorites'),
        api.get('/stops')
      ]);
      if (favRes.data?.favorites) setFavorites(favRes.data.favorites);
      if (stopsRes.data?.stops) setStops(stopsRes.data.stops);
    } catch (err) {
      console.warn('Load favorites error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save favorite place.');
    } finally {
      setSavingPlace(false);
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

  const hasAnyFavorites = favorites.places.length > 0 || favorites.routes.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500" />
            Saved Places & Routes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bookmarked locations and frequent bus commutes for fast 1-click route searches.
          </p>
        </div>

        <button
          onClick={() => setShowAddPlace(!showAddPlace)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Save New Place
        </button>
      </div>

      {/* Add Place Drawer / Form */}
      {showAddPlace && (
        <form onSubmit={handleAddPlace} className="bg-white rounded-3xl p-6 border border-blue-200 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Add Favorite Place</h3>
            <span className="text-xs text-slate-400">e.g. Home, University, Work</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Place Label
              </label>
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="Home">🏠 Home</option>
                <option value="University / College">🎓 University / College</option>
                <option value="Hostel">🏢 Hostel</option>
                <option value="Library">📚 Library</option>
                <option value="Work / Internship">💼 Work / Internship</option>
                <option value="Shopping Mall">🛍️ Shopping Mall</option>
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
                placeholder="e.g. My North Hostel"
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {savingPlace ? 'Saving...' : 'Save Place'}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1: Saved Places */}
      <section className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Saved Places ({favorites.places.length})
        </h3>

        {favorites.places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favorites.places.map((place) => (
              <div
                key={place.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-700">
                      {place.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {place.custom_name || place.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Stop: {place.stop?.name || 'Bus Stop'} ({place.stop?.locality})
                  </p>
                  <Link
                    to={`/search?to=${place.stop_id}`}
                    className="inline-block pt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    Ride to here ➔
                  </Link>
                </div>

                <button
                  onClick={() => handleDelete(place.id)}
                  title="Remove from favorites"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No saved places yet. Click "Save New Place" above to add your Home, Campus or Hostel.</p>
        )}
      </section>

      {/* SECTION 2: Saved Routes */}
      <section className="space-y-4 pt-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Bus className="w-4 h-4 text-indigo-600" />
          Saved Favorite Routes ({favorites.routes.length})
        </h3>

        {favorites.routes.length > 0 ? (
          <div className="space-y-3">
            {favorites.routes.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {fav.custom_label || `${fav.from_stop_name} ➔ ${fav.to_stop_name}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    From {fav.from_stop_name} to {fav.to_stop_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/results?from=${fav.from_stop_id}&to=${fav.to_stop_id}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    Search Route Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(fav.id)}
                    title="Delete saved route"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No saved routes yet. Search for any route and tap "Save Route" to keep it handy here.</p>
        )}
      </section>

    </div>
  );
}
