import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, ThumbsUp, ThumbsDown, CheckCircle2, 
  ShieldAlert, Sparkles, MapPin, Award, ArrowRight, 
  HelpCircle, Check, Info, HeartHandshake, Eye
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  playHaptic?: (type: 'light' | 'medium' | 'success' | 'warning') => void;
}

type TabType = 'overview' | 'reporting' | 'voting' | 'trust';

export default function HelpGuideModal({ isOpen, onClose, playHaptic }: HelpGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Interactive mini-simulator state
  const [simMarkerOpen, setSimMarkerOpen] = useState(false);
  const [simVotes, setSimVotes] = useState({ confirm: 12, reject: 4 });
  const [simUserVoted, setSimUserVoted] = useState<'confirm' | 'reject' | null>(null);
  const [simStatus, setSimStatus] = useState<'Reported' | 'Verified'>('Reported');

  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning') => {
    if (playHaptic) {
      playHaptic(type);
    }
  };

  if (!isOpen) return null;

  const handleSimVote = (type: 'confirm' | 'reject') => {
    if (simUserVoted) return;
    triggerHaptic('success');
    setSimUserVoted(type);
    
    setSimVotes(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));

    // If confirmed and hits a threshold, simulate promotion to Verified!
    if (type === 'confirm') {
      setTimeout(() => {
        setSimStatus('Verified');
        triggerHaptic('success');
      }, 800);
    }
  };

  const resetSimulator = () => {
    triggerHaptic('light');
    setSimMarkerOpen(false);
    setSimVotes({ confirm: 12, reject: 4 });
    setSimUserVoted(null);
    setSimStatus('Reported');
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Welcome', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'reporting', label: 'How to Report', icon: <MapPin className="w-4 h-4" /> },
    { id: 'voting', label: 'Marker Voting', icon: <ThumbsUp className="w-4 h-4" /> },
    { id: 'trust', label: 'Trust & Reputation', icon: <Award className="w-4 h-4" /> },
  ];

  const totalSimVotes = simVotes.confirm + simVotes.reject;
  const simConfidence = Math.round((simVotes.confirm / totalSimVotes) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 sm:p-6 font-sans select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md pointer-events-auto"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh] overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 font-display tracking-tight leading-none">
                  App Guide & Features
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Master the Community Ledger
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 overflow-x-auto py-3 shrink-0 scrollbar-none border-b border-slate-100">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-102' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-5 pr-1 min-h-0 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-800 font-display leading-tight flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-indigo-500" /> Welcome to CivicLens!
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      CivicLens is a decentralized, AI-driven civic audit ledger. We empower citizens to directly audit municipal environments, record localized issues, and collectively verify infrastructure health.
                    </p>
                  </div>

                  {/* High Level Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                    <div className="p-4 bg-gradient-to-tr from-blue-50/60 to-indigo-50/30 border border-blue-100/55 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/10">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider block">1. Spot & Lock</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-normal">
                          Witness a civic error? Lock GPS, submit a picture, and publish an audit record.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-tr from-emerald-50/60 to-teal-50/30 border border-emerald-100/55 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">2. Peer Validate</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-normal">
                          The community acts as a jury! Vote on local map markers to build a trust system.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-tr from-amber-50/60 to-orange-50/30 border border-amber-100/55 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/10">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">3. Gain Reputation</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-normal">
                          Your profile's Civic Trust Score shifts based on the integrity of your actions.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-tr from-purple-50/60 to-pink-50/30 border border-purple-100/55 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-purple-500 text-white rounded-xl shadow-md shadow-purple-500/10">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wider block">4. Civic Welfare</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-normal">
                          Watch your municipal region's score dynamically rise on the Active Scorecard.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reporting' && (
                <motion.div
                  key="reporting"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-800 font-display leading-tight">
                      Filing a Valid Civic Audit
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Filing an audit requires precision to prevent false reports. Follow these dynamic steps:
                    </p>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-extrabold text-xs shrink-0 mt-0.5">1</span>
                      <p className="text-xs text-slate-600 font-medium leading-normal">
                        <strong className="text-slate-800">Pinpoint Coordinates:</strong> Tap the <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-md font-bold text-[10px]">📍 Capture Location</span> button. This locks high-precision satellite coordinates on the map.
                      </p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-extrabold text-xs shrink-0 mt-0.5">2</span>
                      <p className="text-xs text-slate-600 font-medium leading-normal">
                        <strong className="text-slate-800">Visual Evidence:</strong> Select or snap an issue image (Potholes, Water leak, Garbage pile). Our server-side **Google Gemini Vision model** analyzes the photo in real-time to confirm category and location.
                      </p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-extrabold text-xs shrink-0 mt-0.5">3</span>
                      <p className="text-xs text-slate-600 font-medium leading-normal">
                        <strong className="text-slate-800">Automatic Metadata:</strong> The AI scores the validation confidence (e.g. 🤖 AI: 94%). Once submitted, your issue is listed live on the public ledger map!
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-slate-500">
                    <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold leading-normal text-slate-600">
                      Reports automatically begin in a <span className="text-amber-600 font-bold">Reported</span> status and await peer review from other users on the map to become fully <span className="text-emerald-600 font-bold">Verified</span>.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'voting' && (
                <motion.div
                  key="voting"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-800 font-display leading-tight">
                      What are Map Markers & How to Vote?
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Every icon on the map represents a real-world citizen report. The public map is kept accurate through **direct user auditing and voting**. 
                    </p>
                  </div>

                  {/* Simulator container */}
                  <div className="border border-indigo-100 bg-gradient-to-tr from-slate-50 to-indigo-50/20 rounded-2xl p-4.5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-indigo-100/40 pb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 animate-pulse" /> Live Practice Simulator
                      </span>
                      {simUserVoted && (
                        <button 
                          onClick={resetSimulator} 
                          className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 underline transition-colors"
                        >
                          Reset Demo
                        </button>
                      )}
                    </div>

                    {!simMarkerOpen ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-white/70 backdrop-blur border border-slate-100 rounded-xl text-center">
                        <p className="text-xs font-bold text-slate-500 max-w-xs px-2">
                          Tap the simulated map marker below to open its ledger sheet and test-vote!
                        </p>
                        
                        {/* Pulse map marker */}
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            setSimMarkerOpen(true);
                          }}
                          className="relative flex items-center justify-center w-12 h-12 bg-rose-500 text-white rounded-full shadow-lg shadow-rose-500/25 hover:scale-110 active:scale-95 transition-transform"
                        >
                          <span className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
                          <MapPin className="w-6 h-6 shrink-0 relative z-10" />
                        </button>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 border border-slate-100 rounded-xl space-y-3 shadow-md"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Pothole
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 leading-tight mt-1">
                              Simulated Giant Pit near Link Road
                            </h5>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                            simStatus === 'Verified' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {simStatus}
                          </span>
                        </div>

                        {/* Interactive gauge */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Community Ledger Confidence</span>
                            <span className="text-slate-800">{simConfidence}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${simConfidence}%` }} />
                            <div className="bg-rose-400 h-full transition-all duration-500" style={{ width: `${100 - simConfidence}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 leading-none">
                            <span>👍 {simVotes.confirm} Confirms</span>
                            <span>👎 {simVotes.reject} Rejects</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-50">
                          {simUserVoted ? (
                            <div className="flex items-center justify-between text-[10px] font-bold bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100">
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Demo Vote Registered!
                              </span>
                              <span>+2 Trust Score</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Is this pothole really there?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSimVote('confirm')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Confirm (👍)
                                </button>
                                <button
                                  onClick={() => handleSimVote('reject')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/50 rounded-lg text-[11px] transition-colors"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" /> Reject (👎)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    🔑 <strong className="text-slate-700">What is the outcome?</strong> Confirmed reports gain peer validity and turn from yellow/amber markers into <strong className="text-emerald-600">emerald Verified markers</strong> on the map, urging municipal action. Rejecting spam or duplicate issues filters clean data into the Live Audit Scorecard!
                  </p>
                </motion.div>
              )}

              {activeTab === 'trust' && (
                <motion.div
                  key="trust"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-800 font-display leading-tight">
                      Trust Ratings & Citizen Ranks
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Every citizen is backed by a dynamic cryptographic **Trust Score (35% to 100%)**. It defines your authority on the ledger network.
                    </p>
                  </div>

                  {/* Reputation Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="grid grid-cols-3 bg-slate-50/70 border-b border-slate-100 p-2.5 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                      <span>Activity</span>
                      <span>Trust Impact</span>
                      <span>Reputation Rank</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-center text-xs">
                      <div className="grid grid-cols-3 p-2.5 items-center">
                        <span className="font-bold text-slate-700 text-left pl-2">Submit Verified Issue</span>
                        <span className="text-emerald-600 font-extrabold">+3 Score</span>
                        <span className="text-indigo-600 font-bold bg-indigo-50/70 py-0.5 px-2 rounded-lg mx-auto">Citizen Guard</span>
                      </div>
                      <div className="grid grid-cols-3 p-2.5 items-center">
                        <span className="font-bold text-slate-700 text-left pl-2">Participate in Voting</span>
                        <span className="text-emerald-500 font-extrabold">+2 Score</span>
                        <span className="text-blue-600 font-bold bg-blue-50/70 py-0.5 px-2 rounded-lg mx-auto">Peer Inspector</span>
                      </div>
                      <div className="grid grid-cols-3 p-2.5 items-center">
                        <span className="font-bold text-slate-700 text-left pl-2">Filing Spam/Fake Report</span>
                        <span className="text-rose-500 font-extrabold">-10 Score</span>
                        <span className="text-amber-600 font-bold bg-amber-50/70 py-0.5 px-2 rounded-lg mx-auto">Suspended Guard</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-slate-600 leading-normal">
                      A high **Trust Score** increases the weight of your votes and qualifies you for automated fast-track submissions, bypasses manual verification limits, and lets you flag priority civic issues.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Action Row */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400">
              CivicLens Ledger Index • v1.4
            </span>
            <button
              onClick={() => {
                triggerHaptic('success');
                onClose();
              }}
              className="flex items-center gap-1.5 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
            >
              <span>Got it, Let's Audits!</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
