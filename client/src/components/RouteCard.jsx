import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bus, 
  Clock, 
  IndianRupee, 
  Shuffle, 
  MapPin, 
  Sparkles, 
  Bookmark, 
  MessageSquarePlus, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import RouteTimeline from './RouteTimeline';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RouteCard({ 
  route, 
  isRecommended = false, 
  onSaveFavorite,
  onSelectMap,
  isSelectedOnMap = false,
  originName,
  destName 
}) {
  const [expanded, setExpanded] = useState(isRecommended);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleSaveFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save this route to your favorites!');
      return;
    }
    setSaving(true);
    try {
      await api.post('/favorites', {
        type: 'route',
        route_id: route.routeId ? route.routeId.split('_')[0] : null,
        from_stop_id: route.originStopId || route.boardAt,
        to_stop_id: route.destinationStopId || route.getDownAt,
        custom_label: `${route.bus}: ${route.boardAt} to ${route.getDownAt}`
      });
      setSaved(true);
      if (onSaveFavorite) onSaveFavorite();
    } catch (err) {
      console.warn('Save favorite route failed:', err.message);
      // If already saved or offline
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-3xl border transition-all ${
      isRecommended
        ? 'bg-gradient-to-b from-blue-50/70 via-white to-white border-blue-300 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
        : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
    }`}>
      {/* Top Banner for Recommendation */}
      {isRecommended && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-t-3xl flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>AI RECOMMENDED OPTIMAL ROUTE</span>
          </div>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] backdrop-blur-xs font-semibold">
            Best Match
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header: Bus Badge, Duration, Fare */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl text-sm font-black bg-blue-600 text-white flex items-center gap-1.5 shadow-sm shadow-blue-500/30">
                <Bus className="w-4 h-4" />
                Bus {route.bus}
              </span>
              {route.busType && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  {route.busType}
                </span>
              )}
              {route.transfers === 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Direct Route
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Shuffle className="w-3 h-3" />
                  {route.transfers} Transfer Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span>From: <strong className="text-slate-800">{route.boardAt}</strong></span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span>To: <strong className="text-slate-800">{route.getDownAt}</strong></span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 flex items-center justify-end gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Est. Duration
              </div>
              <p className="text-base font-extrabold text-slate-900">{route.durationMinutes} mins</p>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="text-right">
              <div className="text-xs text-slate-500 flex items-center justify-end gap-0.5 font-medium">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                Est. Fare
              </div>
              <div className="flex items-baseline justify-end gap-1">
                <p className="text-base font-extrabold text-blue-600">₹{route.fare}</p>
                {user?.is_student && route.studentFare && (
                  <span className="text-[10px] font-semibold text-emerald-600">
                    (Student Concession)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Point Callout if Any */}
        {route.transferPoint && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Shuffle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Interchange Station: {route.transferPoint}</p>
              <p className="text-[11px] text-amber-800">
                Alight at {route.transferPoint} and board connecting bus towards {route.getDownAt}.
              </p>
            </div>
          </div>
        )}

        {/* Travel Instructions */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
          <strong className="text-slate-900 font-semibold block mb-0.5">Instructions:</strong>
          {route.instructions}
        </div>

        {/* AI-Generated Explanation */}
        {route.aiExplanation && (
          <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-950 font-bold block mb-0.5">Why AI recommends this route:</strong>
              {route.aiExplanation}
            </div>
          </div>
        )}

        {/* Collapsible Step-by-Step Timeline */}
        {expanded && route.steps && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Journey Timeline & Navigation Steps
            </h4>
            <RouteTimeline steps={route.steps} intermediateStops={route.intermediateStops} />
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Step-by-Step Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View Step-by-Step Timeline ({route.steps?.length || 3} steps)
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* View on Map Button */}
            {onSelectMap && (
              <button
                type="button"
                onClick={onSelectMap}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                  isSelectedOnMap
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100'
                }`}
                title="Plot this route on the interactive transit map"
              >
                <MapPin className="w-3.5 h-3.5" />
                {isSelectedOnMap ? 'Viewing on Map' : 'View on Map'}
              </button>
            )}

            {/* View Route Schedule Link if single route */}
            {route.routeId && !route.routeId.includes('_') && (
              <Link
                to={`/route/${route.routeId}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Timetable
              </Link>
            )}

            {/* Feedback Button */}
            <button
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />
              Rate Route
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleSaveFavorite}
              disabled={saving || saved}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                saved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  {saving ? 'Saving...' : 'Save Route'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        routeId={route.routeId || route.id}
        routeName={route.bus}
      />
    </div>
  );
}
