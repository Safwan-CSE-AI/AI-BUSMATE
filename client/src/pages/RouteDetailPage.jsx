import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bus, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Users, 
  Star, 
  Shuffle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function RouteDetailPage() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoute() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/routes/${id}`);
        if (res.data?.success && res.data?.route) {
          setRoute(res.data.route);
          setFeedback(res.data.feedback || []);
        } else {
          setError('Route not found.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load route details.');
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Fetching route details & timetable..." />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Bus Route Not Found"
          description={error || "We could not find the requested route ID."}
          actionText="Back to Route Planner"
          actionLink="/search"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation */}
      <Link
        to="/search"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Search
      </Link>

      {/* Route Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3.5 py-1.5 rounded-xl text-base font-black bg-blue-600 text-white flex items-center gap-2 shadow-sm shadow-blue-500/20">
                <Bus className="w-5 h-5" />
                Bus {route.route_number}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
                {route.bus_type}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{route.route_name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Between <strong>{route.origin_stop_name}</strong> and <strong>{route.destination_stop_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Distance</span>
              <p className="text-lg font-black text-slate-900">{route.total_distance_km} km</p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Est. Travel Time</span>
              <p className="text-lg font-black text-blue-600">{route.estimated_duration_mins} mins</p>
            </div>
          </div>
        </div>

        {/* Quick Search on this route button */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Regular Service Line</span>
          <Link
            to={`/results?from=${route.origin_stop_id}&to=${route.destination_stop_id}`}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            Search Trips on this Route
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sequential Stop List (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Route Stops & Station Sequence ({route.stops?.length || 0})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Sequential order</span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {route.stops?.map((stop, idx) => {
              const isOrigin = idx === 0;
              const isDest = idx === (route.stops.length - 1);
              return (
                <div key={stop.id} className="relative flex items-start gap-4">
                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isOrigin
                      ? 'bg-blue-600 text-white'
                      : isDest
                        ? 'bg-emerald-600 text-white'
                        : stop.is_major_interchange
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-700'
                  }`}>
                    {stop.stop_sequence}
                  </div>

                  <div className="flex-1 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {stop.stop_name}
                        {stop.is_major_interchange && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            Major Interchange
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {stop.time_from_start_mins} mins • {stop.distance_from_start_km} km
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {stop.locality} {stop.landmark ? `• Near ${stop.landmark}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedules & Passenger Feedback (1 Column) */}
        <div className="space-y-6">
          
          {/* Schedules Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Departure Timetable
            </h3>

            {route.schedules?.length > 0 ? (
              <div className="space-y-2">
                {route.schedules.map((sch) => (
                  <div key={sch.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Service: {sch.departure_time} - {sch.arrival_time}</span>
                      <span className="text-blue-600">Every {sch.frequency_mins} mins</span>
                    </div>
                    {sch.bus_plate_number && (
                      <p className="text-[11px] text-slate-500">Vehicle: {sch.bus_plate_number}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Regular daily service every 15-20 minutes.</p>
            )}
          </div>

          {/* Passenger Reviews Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Crowd & Reviews ({feedback.length})
              </h3>
            </div>

            {feedback.length > 0 ? (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div key={f.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                      <span>Crowd: {f.crowd_level}</span>
                      <span>•</span>
                      <span>Punctuality: {f.punctuality_status}</span>
                    </div>
                    {f.comment && (
                      <p className="text-[11px] text-slate-700 italic">"{f.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No passenger feedback recorded yet for this route.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
