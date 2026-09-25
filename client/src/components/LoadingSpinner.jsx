import React from 'react';
import { Bus, Sparkles } from 'lucide-react';

export default function LoadingSpinner({ message = 'Finding best bus routes with AI...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 animate-bounce">
          <Bus className="w-8 h-8" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-spin">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{message}</h3>
      <p className="text-xs text-slate-500 max-w-sm">
        Analyzing schedules, bus interchange points, passenger fares, and real-time connectivity.
      </p>
    </div>
  );
}
