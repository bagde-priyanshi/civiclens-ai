import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Shield, Sparkles, LayoutDashboard, MapPin, Search, Loader2, ChevronDown, Compass, HelpCircle, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  profile: UserProfile;
  onProfileClick: () => void;
  activeCity: string;
  onDashboardClick: () => void;
  onCityChange: (cityName: string, lat: number, lng: number) => void;
  onHelpClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const PRESET_CITIES = [
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, label: 'Bhopal (Central)' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, label: 'Indore' },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
];

export default function Navbar({ profile, onProfileClick, activeCity, onDashboardClick, onCityChange, onHelpClick, theme, onThemeToggle }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geocode search with Nominatim (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&countrycodes=in` // prioritize India but general search works too
        );
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          display_name: item.display_name,
          name: item.name || item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
        setSuggestions(mapped);
      } catch (error) {
        console.error('Error fetching geocoding suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Get initials for profile avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelectCity = (name: string, lat: number, lng: number) => {
    onCityChange(name, lat, lng);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-[999] flex items-center justify-between px-6 py-3.5 bg-white/75 backdrop-blur-md border border-slate-100 shadow-lg rounded-2xl pointer-events-auto">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/10">
          <span className="text-lg font-bold font-display">⬡</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 font-display text-base tracking-tight leading-none flex items-center gap-1">
            CivicLens AI
            <span className="flex items-center justify-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-50 to-teal-50 text-blue-600 border border-blue-100">
              <Sparkles className="w-2 h-2 mr-0.5" /> AI
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            Report &middot; Validate &middot; Resolve
          </span>
        </div>
      </div>

      {/* Dynamic Location indicator / Search badge (Interactive) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 border border-slate-100 bg-white hover:border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
          <span className="hidden sm:inline text-slate-400 font-medium">Region: </span>
          <span className="text-blue-600 font-extrabold max-w-[120px] sm:max-w-[160px] truncate">
            {activeCity}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isSearchOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Geocoding Panel */}
        {isSearchOpen && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[310px] sm:w-[350px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-[1000] flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-3 duration-200">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search city, neighborhood, region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-700 transition-all"
              />
              {isLoading && (
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Suggestions & Preset lists */}
            <div className="max-h-[220px] overflow-y-auto space-y-2.5 custom-scrollbar pr-0.5">
              {searchQuery.trim() !== '' ? (
                /* Geocoding Dynamic Suggestions */
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Search Results
                  </span>
                  {suggestions.length === 0 && !isLoading ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">No matching regions found in India</p>
                  ) : (
                    suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectCity(item.name, item.lat, item.lng)}
                        className="w-full text-left p-2 hover:bg-blue-50/50 rounded-xl transition-colors duration-150 flex items-start gap-2.5 group cursor-pointer border border-transparent hover:border-blue-100/50"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                            {item.display_name}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Preset Popular Cities Quick selection */
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-400" /> Popular Regions
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {PRESET_CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleSelectCity(city.name, city.lat, city.lng)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${
                          activeCity === city.name
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-xs">📍</span>
                        <span className="truncate">{city.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-50 pt-2 text-[10px] text-slate-400 font-medium leading-normal italic px-1">
              Selecting a new region instantly shifts the live report validation grid.
            </div>
          </div>
        )}
      </div>

      {/* Action triggers group */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={onThemeToggle}
          className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-100 transition-all duration-200 active:scale-95 shadow-xs shrink-0 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Help / App Guide Button */}
        <button
          onClick={onHelpClick}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100/40 transition-all duration-200 active:scale-95 shadow-xs shrink-0 cursor-pointer"
          title="App Guide & Features"
        >
          <HelpCircle className="w-4 h-4 text-indigo-600 animate-bounce" />
          <span className="hidden sm:inline">App Guide</span>
        </button>

        {/* Dashboard Toggle Button */}
        <button
          onClick={onDashboardClick}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-100/40 transition-all duration-200 active:scale-95 shadow-xs shrink-0 cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Audit Board</span>
        </button>

        {/* Profile section */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all duration-200 active:scale-95 group shrink-0"
        >
          <div className="flex flex-col items-end text-right hidden sm:flex">
            <span className="text-xs font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
              {profile.name}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1 mt-0.5">
              <Shield className="w-2.5 h-2.5 text-blue-500" /> Trust: {profile.trustScore}
            </span>
          </div>

          {/* Initials Circle */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200/50 shadow-inner group-hover:shadow-md transition-shadow">
            {getInitials(profile.name)}
          </div>
        </button>
      </div>
    </nav>
  );
}
