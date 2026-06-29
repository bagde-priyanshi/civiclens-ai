import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, MapPin, User, Shield, HelpCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('Demo User');
  const [city, setCity] = useState('Bhopal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      city: city.trim(),
      trustScore: 73,
      reportCount: 3,
      hasCompletedOnboarding: true,
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Animated Abstract Background with gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-300/30 to-teal-300/20 blur-[120px] animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-teal-300/30 to-indigo-300/20 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute inset-0 animated-grid opacity-60" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        {step === 1 ? (
          /* Screen 1: Hero Pitch */
          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-2xl transition-all duration-500 transform scale-100 hover:shadow-indigo-100/40">
            {/* Visual Icon Header */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur-md opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md">
                  <span className="text-3xl font-bold tracking-tight font-display">⬡</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-teal-50 text-blue-600 border border-blue-100/50">
                <Shield className="w-3.5 h-3.5" /> Next-Gen Civic Platform
              </span>
              <h1 className="text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
                Report. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Validate.</span> Resolve.
              </h1>
              <p className="text-slate-600 font-medium text-base px-2">
                AI-powered civic issue reporting and community validation platform for your neighborhood.
              </p>
            </div>

            <div className="space-y-4">
              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="block text-lg font-bold text-slate-800 font-display">AI</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Detection</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="block text-lg font-bold text-slate-800 font-display">Voted</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Validation</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="block text-lg font-bold text-slate-800 font-display">70+</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Trust Score</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-indigo-200 shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* Screen 2: User Details Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-2xl transition-all duration-500"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                Complete Your Profile
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Help us customize your CivicLens local dashboard.
              </p>
            </div>

            <div className="space-y-5 mb-8">
              {/* Name input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all duration-200"
                  />
                </div>
              </div>

              {/* City input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  City / Region
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city (e.g. Bhopal)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all duration-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Note: Default mock reports are pre-loaded in Bhopal, but you can explore any area!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-1.5"
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
