import React, { useState, useRef } from 'react';
import { IssueCategory, CivicIssue } from '../types';
import { X, Camera, Upload, Sparkles, Loader2, MapPin, Check, ChevronDown, Smartphone } from 'lucide-react';

interface ReportIssueSheetProps {
  mapCenter: { lat: number; lng: number };
  onClose: () => void;
  onSubmit: (issue: Partial<CivicIssue>) => void;
  onAddToast: (message: string, type: 'success' | 'location' | 'warning' | 'info') => void;
  activeCity?: string;
}

const SAMPLE_PHOTOS = [
  {
    name: 'Pothole',
    category: 'Pothole' as IssueCategory,
    confidence: 94,
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80',
    title: 'Severe Asphalt Crack & Pothole',
    desc: 'Deep dangerous pothole on the main transit lane, causing cars to swerve suddenly.'
  },
  {
    name: 'Garbage',
    category: 'Garbage' as IssueCategory,
    confidence: 89,
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80',
    title: 'Illegal Waste Dumping Pile',
    desc: 'Unchecked household waste bags and plastic containers piled up near the sidewalk.'
  },
  {
    name: 'Water Leak',
    category: 'Water Leak' as IssueCategory,
    confidence: 91,
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
    title: 'Subsurface Water Pipeline Leak',
    desc: 'Clean drinking water bubbling up through cracks in the pavement, flooding the storm drain.'
  },
  {
    name: 'Broken Sign',
    category: 'Broken Infrastructure' as IssueCategory,
    confidence: 95,
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=400&q=80',
    title: 'Toppled Stop Sign & Post',
    desc: 'Street warning sign hit by vehicle, completely flattened and blocking the pedestrian walk.'
  }
];

export default function ReportIssueSheet({ mapCenter, onClose, onSubmit, onAddToast, activeCity = 'Bhopal' }: ReportIssueSheetProps) {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [address, setAddress] = useState(`Near Main Transit Road, ${activeCity}`);
  
  // AI Simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: IssueCategory; confidence: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // LatLng pin position
  const [lat, setLat] = useState(mapCenter.lat);
  const [lng, setLng] = useState(mapCenter.lng);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated AI Analyzer
  const triggerAIAnalysis = (categorySelected: IssueCategory, customImgTitle?: string, customImgDesc?: string) => {
    setIsScanning(true);
    setAiResult(null);

    // Simulate haptic feedback on scan start
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }

    setTimeout(() => {
      setIsScanning(false);
      setAiResult({
        category: categorySelected,
        confidence: Math.floor(Math.random() * 8) + 88 // 88% - 95%
      });
      setCategory(categorySelected);
      
      // Auto-populate labels if a sample was clicked
      if (customImgTitle) {
        setTitle(customImgTitle);
      } else {
        setTitle(`Identified ${categorySelected} Issue`);
      }

      if (customImgDesc) {
        setDescription(customImgDesc);
      } else {
        setDescription(`A community-reported ${categorySelected.toLowerCase()} causing disruption. Needs inspection.`);
      }

      // Simulated haptic on finish
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 2000);
  };

  // Click handler for sample photo
  const handleSelectSample = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setImage(sample.url);
    triggerAIAnalysis(sample.category, sample.title, sample.desc);
  };

  // Custom File Uploader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      // Randomly pick a category for user custom photo to make simulation smart
      const randomSample = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
      triggerAIAnalysis(randomSample.category);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      const randomSample = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
      triggerAIAnalysis(randomSample.category);
    };
    reader.readAsDataURL(file);
  };

  // Submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !title.trim() || !category) {
      onAddToast('Please upload an image and fill out required fields', 'warning');
      return;
    }

    setIsSubmitting(true);

    // Simulated haptic feedback ticks on button submit
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        title: title.trim(),
        description: description.trim() || `Community reported ${category.toLowerCase()} at this location.`,
        category,
        status: 'Reported',
        latitude: lat + (Math.random() - 0.5) * 0.001, // add subtle variation
        longitude: lng + (Math.random() - 0.5) * 0.001,
        image,
        votesConfirm: 1,
        votesReject: 0,
        userVoted: 'confirm',
        aiConfidence: aiResult?.confidence || 91,
        address: address.trim(),
        timestamp: new Date().toISOString(),
        reportedBy: 'You (Demo User)'
      });
    }, 1500);
  };

  // Simulated Haptic button click helper
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(30); // 30ms subtle tick
    }
    // Show capture toast
    onAddToast('📍 GPS Coordinate locked', 'location');
    // Subtle randomize of location coordinates near map center
    setLat(mapCenter.lat + (Math.random() - 0.5) * 0.004);
    setLng(mapCenter.lng + (Math.random() - 0.5) * 0.004);
    setAddress(`Sector ${Math.floor(Math.random() * 8) + 1}, ${activeCity} Area`);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[1000] flex justify-center p-4 sm:p-6 font-sans pointer-events-none">
      {/* Semi-transparent dark background */}
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Slide Up Panel */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-3xl p-6 overflow-hidden flex flex-col pointer-events-auto max-h-[85vh] animate-slide-up">
        
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

        {/* Header Action row */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-display tracking-tight">
                Report Local Issue
              </h3>
              <p className="text-xs text-slate-400 font-medium">Create a community validation ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmitReport} className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
          
          {/* Section 1: Image Capture / Upload with AI Scan */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Issue Evidence (Photo)
            </label>

            {!image ? (
              /* Drag & Drop uploader */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-3 border border-slate-100">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Drag photo here or tap to upload</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wide">
                  JPG, PNG, WebP up to 10MB
                </p>

                {/* Quick select presets */}
                <div className="mt-5 w-full border-t border-slate-100 pt-4" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Or select a preset sample for instant AI testing:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_PHOTOS.map((sample) => (
                      <button
                        type="button"
                        key={sample.name}
                        onClick={() => handleSelectSample(sample)}
                        className="flex flex-col items-center gap-1.5 p-1 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 shadow-xs transition-all text-[10px] font-bold text-slate-700"
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Image display area with Scan Overlay */
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-slate-100 aspect-video flex items-center justify-center group">
                <img
                  src={image}
                  alt="Evidence"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Scanning Holographic Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-blue-500/10 flex flex-col items-center justify-center">
                    {/* Animated laser scanner bar */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6] animate-[scanner-bar_2s_infinite]" />
                    
                    <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-white border border-white/10 shadow-lg scale-95 animate-pulse">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-xs font-bold font-display tracking-wide uppercase">
                        🤖 AI Analyzing Anomalies...
                      </span>
                    </div>
                  </div>
                )}

                {/* Scan Completed Success Banner */}
                {aiResult && !isScanning && (
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Check className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                          AI Identification Engine
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5">
                          Detected: {aiResult.category} — {aiResult.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                      CONFIRMED
                    </span>
                  </div>
                )}

                {/* Redo Button */}
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setAiResult(null);
                    setCategory('');
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-slate-950/70 hover:bg-slate-950/80 text-white backdrop-blur-md rounded-xl border border-white/15 transition-all text-xs font-semibold flex items-center gap-1 hover:scale-105"
                >
                  <X className="w-4 h-4" /> Reset
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Category selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Issue Category
            </label>
            <div className="relative">
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-800 font-semibold text-sm appearance-none cursor-pointer transition-all"
              >
                <option value="" disabled>Select category manually</option>
                <option value="Pothole">🔴 Pothole</option>
                <option value="Garbage">🟢 Garbage Pile</option>
                <option value="Water Leak">🔵 Water Pipe Leak</option>
                <option value="Broken Infrastructure">🟠 Broken Infrastructure</option>
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4.5 h-4.5" />
              </span>
            </div>
          </div>

          {/* Section 3: Text fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="Give a brief title (e.g. Broken pavement on Sector A)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-800 text-sm font-medium transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                placeholder="Explain the hazard, potential impact, and details for community inspectors..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-800 text-sm font-medium transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 4: Location Capture & Pin */}
          <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-500" /> Dispatch Location Coordinates
              </span>
              <button
                type="button"
                onClick={triggerHapticFeedback}
                className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors flex items-center gap-1 shrink-0"
              >
                <Smartphone className="w-3 h-3 text-blue-500 animate-pulse" /> Mock Haptic Ping
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Latitude
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">{lat.toFixed(5)}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Longitude
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">{lng.toFixed(5)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                Approximate Location Address
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="border-t border-slate-100 pt-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !image || !category || isScanning}
              className="flex-[2] py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Filing Report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-blue-200 group-hover:rotate-12 transition-transform" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Scan animation style */}
      <style>{`
        @keyframes scanner-bar {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
