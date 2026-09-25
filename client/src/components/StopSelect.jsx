import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Accessibility } from 'lucide-react';

export default function StopSelect({ 
  label, 
  stops = [], 
  value, 
  onChange, 
  placeholder = 'Select bus stop...',
  iconColor = 'text-blue-600',
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedStop = stops.find(s => s.id === value || s.name === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Button triggering dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left text-sm transition-all bg-white shadow-xs ${
          error 
            ? 'border-red-300 ring-2 ring-red-100' 
            : isOpen 
              ? 'border-blue-500 ring-3 ring-blue-100' 
              : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin className={`w-4 h-4 shrink-0 ${iconColor}`} />
          {selectedStop ? (
            <div className="truncate">
              <span className="font-semibold text-slate-900">{selectedStop.name}</span>
              <span className="text-xs text-slate-500 ml-1.5">({selectedStop.locality})</span>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
          {/* Search Input */}
          <div className="px-3 pb-2 border-b border-slate-100">
            <input
              type="text"
              autoFocus
              placeholder="Search by stop name, locality, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Stops List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredStops.length > 0 ? (
              filteredStops.map((stop) => {
                const isSelected = selectedStop?.id === stop.id;
                return (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => {
                      onChange(stop.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-blue-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">{stop.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                          {stop.code}
                        </span>
                        {stop.wheelchair_accessible && (
                          <Accessibility className="w-3 h-3 text-slate-400" title="Wheelchair accessible" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{stop.locality} {stop.landmark ? `• ${stop.landmark}` : ''}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No stops found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
