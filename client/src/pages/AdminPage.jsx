import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bus, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  MessageSquare,
  AlertCircle 
} from 'lucide-react';
import StopSelect from '../components/StopSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routes');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  // 1. New Route
  const [routeNumber, setRouteNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [originStopId, setOriginStopId] = useState('');
  const [destStopId, setDestStopId] = useState('');
  const [busType, setBusType] = useState('City Standard');
  const [distanceKm, setDistanceKm] = useState('10.5');
  const [durationMins, setDurationMins] = useState('35');

  // 2. New Stop
  const [stopCode, setStopCode] = useState('');
  const [stopName, setStopName] = useState('');
  const [stopLocality, setStopLocality] = useState('');
  const [stopLandmark, setStopLandmark] = useState('');
  const [accessible, setAccessible] = useState(true);

  // 3. New Schedule
  const [schedRouteId, setSchedRouteId] = useState('');
  const [deptTime, setDeptTime] = useState('06:30');
  const [arrTime, setArrTime] = useState('21:30');
  const [frequencyMins, setFrequencyMins] = useState('15');
  const [plateNumber, setPlateNumber] = useState('KA-19-F-9099');

  const [submitting, setSubmitting] = useState(false);

  const loadAdminData = async () => {
    try {
      const [statsRes, stopsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/stops')
      ]);
      if (statsRes.data?.stats) setStats(statsRes.data.stats);
      if (stopsRes.data?.stops) {
        setStops(stopsRes.data.stops);
        if (stopsRes.data.stops.length >= 2) {
          setOriginStopId(stopsRes.data.stops[0].id);
          setDestStopId(stopsRes.data.stops[1].id);
        }
      }
    } catch (err) {
      console.warn('Admin load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/admin/routes', {
        route_number: routeNumber,
        route_name: routeName,
        origin_stop_id: originStopId,
        destination_stop_id: destStopId,
        bus_type: busType,
        total_distance_km: Number(distanceKm),
        estimated_duration_mins: Number(durationMins)
      });
      setSuccessMsg(`Bus route ${routeNumber} added successfully!`);
      setRouteNumber('');
      setRouteName('');
      loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add route.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStop = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/admin/stops', {
        code: stopCode,
        name: stopName,
        locality: stopLocality,
        landmark: stopLandmark,
        wheelchair_accessible: accessible
      });
      setSuccessMsg(`Bus stop "${stopName}" added successfully!`);
      setStopCode('');
      setStopName('');
      setStopLocality('');
      setStopLandmark('');
      loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add stop.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/admin/schedules', {
        route_id: schedRouteId || stops[0]?.id || 'r0000001-0000-0000-0000-000000000001',
        departure_time: deptTime,
        arrival_time: arrTime,
        frequency_mins: Number(frequencyMins),
        bus_plate_number: plateNumber
      });
      setSuccessMsg(`Bus schedule added successfully!`);
      loadAdminData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading transit administration console..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMINISTRATOR PRIVILEGES
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Transit Network Operations Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add and manage official city bus routes, transit stops, and timetable schedules. Grounded AI models automatically update recommendations from this data.
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Active Routes', value: stats?.totalRoutes || 6, icon: Bus, color: 'text-blue-600 bg-blue-50' },
          { label: 'Transit Stops', value: stats?.totalStops || 12, icon: MapPin, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Schedules', value: stats?.totalSchedules || 6, icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Passenger Reviews', value: stats?.totalFeedback || 0, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
          { label: 'Registered Users', value: stats?.totalUsers || 2, icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'routes', label: 'Add Bus Route', icon: Bus },
          { id: 'stops', label: 'Add Bus Stop', icon: MapPin },
          { id: 'schedules', label: 'Add Timetable Schedule', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ADD BUS ROUTE */}
      {activeTab === 'routes' && (
        <form onSubmit={handleCreateRoute} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Create New Bus Route</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Route Number / Code
              </label>
              <input
                type="text"
                required
                value={routeNumber}
                onChange={(e) => setRouteNumber(e.target.value)}
                placeholder="e.g. 55C"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Route Display Name
              </label>
              <input
                type="text"
                required
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Statebank to Mudipu Special Tech Line"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <StopSelect
                label="Origin Bus Stop"
                stops={stops}
                value={originStopId}
                onChange={setOriginStopId}
                placeholder="Select origin stop..."
              />
            </div>

            <div>
              <StopSelect
                label="Destination Bus Stop"
                stops={stops}
                value={destStopId}
                onChange={setDestStopId}
                placeholder="Select destination stop..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bus Service Type
              </label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="City Standard">City Standard</option>
                <option value="City Express">City Express</option>
                <option value="Campus Shuttle">Campus Shuttle</option>
                <option value="AC Metro Feeder">AC Metro Feeder</option>
                <option value="Night Special">Night Special</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Duration (Minutes)
              </label>
              <input
                type="number"
                required
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? 'Creating...' : 'Publish Bus Route'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ADD BUS STOP */}
      {activeTab === 'stops' && (
        <form onSubmit={handleCreateStop} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Add New Transit Stop</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stop Code
              </label>
              <input
                type="text"
                required
                value={stopCode}
                onChange={(e) => setStopCode(e.target.value)}
                placeholder="e.g. LBH-13"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stop Name
              </label>
              <input
                type="text"
                required
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
                placeholder="e.g. Ladyhill Circle"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Locality / Area
              </label>
              <input
                type="text"
                required
                value={stopLocality}
                onChange={(e) => setStopLocality(e.target.value)}
                placeholder="e.g. Urwa"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Landmark / Passenger Directions (Optional)
            </label>
            <input
              type="text"
              value={stopLandmark}
              onChange={(e) => setStopLandmark(e.target.value)}
              placeholder="e.g. Opposite St. Aloysius School gate"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700">
                Wheelchair Accessible Bus Stop
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? 'Adding...' : 'Add Bus Stop'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ADD SCHEDULE */}
      {activeTab === 'schedules' && (
        <form onSubmit={handleCreateSchedule} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Add Route Timetable Schedule</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Route ID or Number
              </label>
              <input
                type="text"
                required
                value={schedRouteId}
                onChange={(e) => setSchedRouteId(e.target.value)}
                placeholder="e.g. r0000001-0000-0000-0000-000000000001 or 24A"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bus Plate / Vehicle Number
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. KA-19-F-1122"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Departure
              </label>
              <input
                type="time"
                value={deptTime}
                onChange={(e) => setDeptTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Departure
              </label>
              <input
                type="time"
                value={arrTime}
                onChange={(e) => setArrTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Frequency (Minutes)
              </label>
              <input
                type="number"
                value={frequencyMins}
                onChange={(e) => setFrequencyMins(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? 'Adding...' : 'Attach Schedule'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
