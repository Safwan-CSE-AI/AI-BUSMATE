import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Compass, 
  Clock, 
  IndianRupee, 
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import RouteCard from '../components/RouteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromStopId = searchParams.get('from');
  const toStopId = searchParams.get('to');
  const preference = searchParams.get('pref') || 'Balanced';
  const maxTransfers = Number(searchParams.get('transfers') || 1);
  const isStudent = searchParams.get('student') !== 'false';
  const travelDate = searchParams.get('date');
  const travelTime = searchParams.get('time');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchRouteResults() {
      if (!fromStopId || !toStopId) {
        setError('Missing starting or destination bus stop.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await api.post('/routes/search', {
          originStopId: fromStopId,
          destinationStopId: toStopId,
          preference,
          maxTransfers,
          isStudent,
          travelTime: travelTime ? `${travelDate || ''} ${travelTime}` : undefined
        });

        if (res.data?.success) {
          setData(res.data);
        } else {
          setError(res.data?.error || 'No verified bus routes found.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to connect to transit server. Please check your stops and try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchRouteResults();
  }, [fromStopId, toStopId, preference, maxTransfers, isStudent, travelDate, travelTime]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <LoadingSpinner message="Searching verified transit network with AI..." />
      </div>
    );
  }

  if (error || !data || !data.recommendation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Compass}
          title="No Verified Transit Routes Available"
          description={error || "We could not find verified bus schedules connecting the chosen stops with the current transfer limit."}
          actionText="Adjust Search Preferences"
          actionLink={`/search?from=${fromStopId || ''}&to=${toStopId || ''}&pref=${preference}`}
        />
      </div>
    );
  }

  const { origin, destination, recommendation, alternatives = [], warnings = [] } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to={`/search?from=${fromStopId}&to=${toStopId}&pref=${preference}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Edit Search Criteria
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {origin?.name}
            </h1>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {destination?.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
              Preference: {preference}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              Max {maxTransfers} Transfer(s)
            </span>
            {isStudent && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                🎓 Student Concession Applied
              </span>
            )}
            {travelTime && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Departing: {travelTime}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/search?from=${toStopId}&to=${fromStopId}&pref=${preference}`}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Return Trip
        </Link>
      </div>

      {/* Warnings & Notices */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Travel Advisory
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Route Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              ★
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Best Recommended Route</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Ranked #1 by AI Grounding Engine</span>
        </div>

        <RouteCard
          route={{
            ...recommendation,
            originStopId: fromStopId,
            destinationStopId: toStopId
          }}
          isRecommended={true}
          originName={origin?.name}
          destName={destination?.name}
        />
      </section>

      {/* Alternative Routes Section */}
      {alternatives.length > 0 && (
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">
              Alternative Verified Routes ({alternatives.length})
            </h3>
            <p className="text-xs text-slate-500">Other valid options connecting these stops</p>
          </div>

          <div className="space-y-4">
            {alternatives.map((alt) => (
              <RouteCard
                key={alt.id}
                route={{
                  ...alt,
                  originStopId: fromStopId,
                  destinationStopId: toStopId
                }}
                isRecommended={false}
                originName={origin?.name}
                destName={destination?.name}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Help / Feedback reminder */}
      <div className="bg-slate-100/70 rounded-3xl p-6 text-center border border-slate-200 space-y-2">
        <h4 className="text-sm font-bold text-slate-800">Traveled on one of these buses recently?</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Help fellow passengers and students by rating the crowd level and punctuality using the "Rate Route" button on each route card.
        </p>
      </div>

    </div>
  );
}
