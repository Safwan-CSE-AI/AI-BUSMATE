import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, ArrowRight, Compass, Clock, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await api.get('/history');
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.warn('Delete history item failed:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading your transit search history..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Route Search History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your past transit searches and re-run route plans with one click.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          {history.length} Queries
        </span>
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {item.origin_name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {item.destination_name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Preference: <strong className="text-slate-700">{item.preference || 'Balanced'}</strong></span>
                  <span>•</span>
                  <span>Max Transfers: {item.max_transfers}</span>
                  <span>•</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/results?from=${item.origin_stop_id}&to=${item.destination_stop_id}&pref=${item.preference || 'Balanced'}&transfers=${item.max_transfers}`}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  Re-Search
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete from history"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No Search History Yet"
          description="Your recent route searches and transit inquiries will appear here automatically for quick re-searching."
          actionText="Plan a New Route"
          actionLink="/search"
        />
      )}

    </div>
  );
}
