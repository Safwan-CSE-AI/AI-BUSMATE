import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Heart, Sparkles, Shield, MapPin, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">AI BusMate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart transit companion empowering students and daily commuters to navigate city buses with clear AI guidance and step-by-step boarding instructions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Transit Data & AI Engine Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="hover:text-blue-400 transition-colors">Find Bus Route</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors">Commuter Dashboard</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-blue-400 transition-colors">Saved Places & Routes</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-blue-400 transition-colors">Search History</Link>
              </li>
            </ul>
          </div>

          {/* Student Pass & Fares */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Student Benefits</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Up to 50% Concession on verified routes
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> University & Campus Shuttle links
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Crowd & Punctuality crowd-sourcing
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Direct interchange point guides
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Transit Helpline</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              For bus inquiries, lost items, or schedule confirmation:
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">Toll-Free: 1800-425-BUSMATE</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Central Bus Stand Interchange Bay 4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI BusMate. Built for students & everyday transit riders.</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            Powered by <Sparkles className="w-3.5 h-3.5 text-blue-400 inline" /> Google Gemini & Supabase PostgreSQL
          </div>
        </div>
      </div>
    </footer>
  );
}
