import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bus, 
  Search, 
  Shuffle, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import StopSelect from '../components/StopSelect';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState(searchParams.get('from') || '');
  const [toStop, setToStop] = useState(searchParams.get('to') || '');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelTime, setTravelTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [preference, setPreference] = useState(searchParams.get('pref') || user?.preferred_mode || 'Balanced');
  const [maxTransfers, setMaxTransfers] = useState(1);
  const [isStudent, setIsStudent] = useState(user ? Boolean(user.is_student) : true);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadStops() {
      try {
        const res = await api.get('/stops');
        if (res.data?.stops) {
          setStops(res.data.stops);
          if (!fromStop && res.data.stops.length > 0) {
            setFromStop(res.data.stops[0].id);
          }
          if (!toStop && res.data.stops.length > 1) {
            setToStop(res.data.stops[1].id);
          }
        }
      } catch (err) {
        console.warn('Could not load stops:', err.message);
      }
    }
    loadStops();
  }, []);

  const handleSwap = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFormError('');

    if (!fromStop || !toStop) {
      setFormError('Please select both a boarding stop and a destination.');
      return;
    }

    if (fromStop === toStop) {
      setFormError('Starting stop and destination cannot be identical.');
      return;
    }

    const query = new URLSearchParams({
      from: fromStop,
      to: toStop,
      date: travelDate,
      time: travelTime,
      pref: preference,
      transfers: maxTransfers,
      student: isStudent
    }).toString();

    navigate(`/results?${query}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold mb-3">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>TRANSIT ROUTE PLANNER</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plan Your Bus Journey</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize departure time, routing preferences, and maximum transfers for accurate AI bus recommendations.
        </p>
      </div>

      {/* Main Search Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {formError && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-6">
          
          {/* Stops Selection with Swap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <div>
              <StopSelect
                label="1. Boarding Stop (From)"
                stops={stops}
                value={fromStop}
                onChange={setFromStop}
                placeholder="Select origin bus stop..."
                iconColor="text-blue-600"
              />
            </div>

            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To"
              className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all hover:scale-110"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <div>
              <StopSelect
                label="2. Destination Stop (To)"
                stops={stops}
                value={toStop}
                onChange={setToStop}
                placeholder="Select destination bus stop..."
                iconColor="text-emerald-600"
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date of Travel
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Departure Time
              </label>
              <input
                type="time"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Route Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'Balanced', label: 'Balanced', desc: 'Best mix of time & cost' },
                { id: 'Fastest', label: 'Fastest', desc: 'Shortest travel duration' },
                { id: 'Cheapest', label: 'Cheapest', desc: 'Lowest ticket fare' },
                { id: 'Fewest Transfers', label: 'Fewest Transfers', desc: 'Direct routes prioritized' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreference(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    preference === p.id
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-extrabold">{p.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Max Transfers & Passenger Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Maximum Transfers
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: 'Direct Only' },
                  { value: 1, label: 'Max 1' },
                  { value: 2, label: 'Max 2' }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setMaxTransfers(t.value)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                      maxTransfers === t.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fare Type
              </label>
              <button
                type="button"
                onClick={() => setIsStudent(!isStudent)}
                className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  isStudent
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className={`w-4 h-4 ${isStudent ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Student Concession (50% Off)</span>
                </div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  isStudent ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                }`}>
                  {isStudent ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Search */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl text-base font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              Find Recommended Routes
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
