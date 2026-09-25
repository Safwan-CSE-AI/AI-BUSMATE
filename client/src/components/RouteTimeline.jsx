import React from 'react';
import { Bus, ArrowDown, MapPin, Shuffle, CheckCircle2, Clock } from 'lucide-react';

export default function RouteTimeline({ steps = [], intermediateStops = [] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="py-4">
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-emerald-500">
        {steps.map((step, idx) => {
          let badgeColor = 'bg-blue-600 text-white';
          let icon = <Bus className="w-4 h-4" />;
          let containerBg = 'bg-blue-50/50 border-blue-100';

          if (step.type === 'board') {
            badgeColor = 'bg-blue-600 text-white shadow-md shadow-blue-500/30';
            icon = <Bus className="w-4 h-4" />;
            containerBg = 'bg-blue-50/60 border-blue-200/80';
          } else if (step.type === 'travel') {
            badgeColor = 'bg-slate-200 text-slate-700';
            icon = <Clock className="w-3.5 h-3.5" />;
            containerBg = 'bg-slate-50/70 border-slate-200';
          } else if (step.type === 'transfer') {
            badgeColor = 'bg-amber-500 text-white shadow-md shadow-amber-500/30 animate-pulse';
            icon = <Shuffle className="w-4 h-4" />;
            containerBg = 'bg-amber-50/70 border-amber-200';
          } else if (step.type === 'arrive') {
            badgeColor = 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30';
            icon = <CheckCircle2 className="w-4 h-4" />;
            containerBg = 'bg-emerald-50/60 border-emerald-200/80';
          }

          return (
            <div key={idx} className="relative flex items-start gap-4 group">
              {/* Timeline Node Badge */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${badgeColor}`}>
                {icon}
              </div>

              {/* Step Content Card */}
              <div className={`flex-1 p-4 rounded-2xl border transition-all ${containerBg}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {step.title}
                    {step.busNumber && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-blue-600 text-white">
                        Bus {step.busNumber}
                      </span>
                    )}
                  </h4>
                  {step.durationMins && (
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-500" />
                      ~{step.durationMins} mins
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {step.details}
                </p>

                {step.stop && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Stop: <strong className="text-slate-800">{step.stop}</strong> {step.locality ? `(${step.locality})` : ''}</span>
                  </div>
                )}

                {/* Transfer Callout */}
                {step.type === 'transfer' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[11px] text-amber-900 font-medium flex items-center gap-2">
                    <span className="font-bold">Transfer Advice:</span>
                    <span>Change from Bus <strong>{step.fromBus}</strong> to Bus <strong>{step.toBus}</strong> at <strong>{step.stop}</strong>.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
