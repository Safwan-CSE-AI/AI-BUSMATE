import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  Shuffle, 
  MapPin, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Compass
} from 'lucide-react';
import StopSelect from '../components/StopSelect';
import api from '../services/api';

export default function LandingPage() {
  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [preference, setPreference] = useState('Balanced');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStops() {
      try {
        const res = await api.get('/stops');
        if (res.data?.success && res.data?.stops) {
          setStops(res.data.stops);
          // Set default popular selections for instant demo
          if (res.data.stops.length >= 4) {
            setFromStop(res.data.stops[0].id); // Central Bus Stand
            setToStop(res.data.stops[3].id);   // Kottara Chowki
          }
        }
      } catch (err) {
        console.warn('Could not load stops:', err.message);
      }
    }
    loadStops();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!fromStop || !toStop) {
      navigate('/search');
      return;
    }
    navigate(`/results?from=${fromStop}&to=${toStop}&pref=${preference}`);
  };

  const swapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-POWERED COMMUTER & STUDENT TRANSIT ASSISTANT</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Don’t Know Which Bus to Take? <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
              Let AI Guide You.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Never miss a bus or take the wrong transfer again. Enter your starting point and destination to get instant, verified bus recommendations with clear step-by-step boarding instructions.
          </p>

          {/* Interactive Quick Search Box */}
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-blue-500/10 text-left">
            <form onSubmit={handleHeroSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div>
                  <StopSelect
                    label="Boarding Stop (From)"
                    stops={stops}
                    value={fromStop}
                    onChange={setFromStop}
                    placeholder="Choose starting bus stop..."
                    iconColor="text-blue-600"
                  />
                </div>

                {/* Swap button between stops */}
                <button
                  type="button"
                  onClick={swapStops}
                  title="Swap stops"
                  className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:scale-110 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                <div>
                  <StopSelect
                    label="Destination Stop (To)"
                    stops={stops}
                    value={toStop}
                    onChange={setToStop}
                    placeholder="Choose destination..."
                    iconColor="text-emerald-600"
                  />
                </div>
              </div>

              {/* Preference Pills & CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Preference:</span>
                  {['Balanced', 'Fastest', 'Cheapest', 'Fewest Transfers'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreference(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                        preference === p
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Main CTA */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Bus className="w-4 h-4" />
                  Find My Bus
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats / Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              100% Verified Routes & Fares
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              Student Concessions Supported
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Zero AI Hallucinations
            </span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Solving Daily Transit Confusion</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Built For Students & Everyday Commuters</h2>
          <p className="text-sm text-slate-600 mt-2">
            AI BusMate removes the stress of public transportation with intelligent recommendations grounded exclusively in official timetable data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Step-by-Step Boarding Guidance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear visual journey timeline showing where to board, which platform to stand at, how many stops to ride, and the exact station to alight.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI-Driven Route Reasoning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Google Gemini, the assistant provides plain-language explanations tailored to your preference: fastest speed, cheapest fare, or fewest transfers.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Student Pass & Fares Integrated</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatic 50% fare discounts for students, dedicated campus shuttle routes, and bookmarking for frequent university routes.
            </p>
          </div>
        </div>
      </section>

      {/* SAMPLE ROUTE SHOWCASE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                LIVE DEMO PREVIEW
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                From Statebank to University Campus in 45 Minutes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take Bus 11B direct or connect via Kottara Chowki with Bus 24A. Save your frequent trips and view crowd levels before boarding.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/search"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Explore All Routes
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            </div>

            {/* Mock Route Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-500 text-white">
                  Bus 11B Direct
                </span>
                <span className="text-xs font-bold text-emerald-400">₹20 Student Fare</span>
              </div>
              <p className="text-xs font-semibold text-white">Central Bus Stand ➔ University Campus North</p>
              
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <span>⏱️ ~45 mins</span>
                <span>🛑 4 intermediate stops</span>
                <span>🔄 0 Transfers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Ready to find your best bus?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
          Join hundreds of students and daily passengers traveling faster, smarter, and with zero confusion.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-105"
        >
          <Bus className="w-4 h-4" />
          Find My Bus Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

    </div>
  );
}
