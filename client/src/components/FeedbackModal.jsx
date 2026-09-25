import React, { useState } from 'react';
import { X, Star, Users, Clock, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function FeedbackModal({ isOpen, onClose, routeId, routeName, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [crowdLevel, setCrowdLevel] = useState('Moderate');
  const [punctualityStatus, setPunctualityStatus] = useState('On Time');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use clean route_id if combined transfer
      const targetRouteId = (routeId || '').split('_')[0] || routeId;
      await api.post('/feedback', {
        route_id: targetRouteId,
        rating: Number(rating),
        crowd_level: crowdLevel,
        punctuality_status: punctualityStatus,
        comment
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Feedback Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">Thank you for helping other daily passengers travel smarter.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Crowd-Sourced Transit</span>
              <h3 className="text-lg font-extrabold text-slate-900">Rate Route {routeName}</h3>
              <p className="text-xs text-slate-500">Share your experience regarding punctuality and seat availability.</p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Overall Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Crowd Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Crowd Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Low', 'Moderate', 'High', 'Packed'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCrowdLevel(lvl)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all border ${
                      crowdLevel === lvl
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Punctuality Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Punctuality
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['On Time', 'Slightly Delayed', 'Heavily Delayed', 'Early'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPunctualityStatus(status)}
                    className={`py-2 px-2 text-left rounded-xl text-xs font-semibold transition-all border ${
                      punctualityStatus === status
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Helpful Notes / Stop Tips (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Bus fills quickly at Central Stand. Board from Platform 3."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
