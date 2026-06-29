import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, 
  Shield, 
  Award, 
  MapPin, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Lock, 
  Unlock, 
  ChevronRight,
  LogOut,
  ThumbsUp
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ profile, isOpen, onClose, onLogout }: ProfileModalProps) {
  const [modalTab, setModalTab] = useState<'credentials' | 'handbook'>('credentials');

  if (!isOpen) return null;

  // Deterministic trust score components based on trust score & reports count
  const reportsVerified = Math.min(100, Math.max(0, Math.round(70 + (profile.trustScore - 50) * 0.4 + (profile.reportCount * 2))));
  const communityVotes = Math.min(100, Math.max(0, Math.round(60 + (profile.trustScore - 50) * 0.5 + (profile.reportCount * 3))));
  const consistencyRating = Math.min(100, Math.max(0, Math.round(55 + (profile.trustScore - 50) * 0.3 + (profile.reportCount * 4))));

  // Radar coordinates parameters
  const cx = 120;
  const cy = 110;
  const R = 60;

  const x1 = cx;
  const y1Val = cy - R * (reportsVerified / 100);

  const x2Val = cx + R * (communityVotes / 100) * 0.866;
  const y2Val = cy + R * (communityVotes / 100) * 0.5;

  const x3Val = cx - R * (consistencyRating / 100) * 0.866;
  const y3Val = cy + R * (consistencyRating / 100) * 0.5;

  // Get initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const badges = [
    {
      id: 'pioneer',
      name: 'Civic Pioneer',
      emoji: '🌱',
      colorClass: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/50',
      description: 'Completed citizen profile onboarding.',
      benefit: 'Unlocks public voting rights & initial audit validation score (+1 voting weight).',
      unlocked: true,
      requirementText: 'Complete onboarding profile',
      currentProgress: 1,
      targetProgress: 1,
    },
    {
      id: 'spotter',
      name: 'Street Spotter',
      emoji: '🔍',
      colorClass: 'from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/50',
      description: 'Spotted and submitted your first civic concern.',
      benefit: 'Adds a +1 trust multiplier to submissions & unlocks 20% faster AI review priority.',
      unlocked: profile.reportCount >= 1,
      requirementText: 'Submit at least 1 civic report',
      currentProgress: profile.reportCount,
      targetProgress: 1,
    },
    {
      id: 'guardian',
      name: 'Guardian of the Gates',
      emoji: '🛡️',
      colorClass: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/50',
      description: 'Earned high community trust and accuracy.',
      benefit: 'Unlocks automatic bypass verification on standard, simple reports with 95%+ confidence.',
      unlocked: profile.trustScore >= 60,
      requirementText: 'Reach a Community Trust Score of 60',
      currentProgress: profile.trustScore,
      targetProgress: 60,
    },
    {
      id: 'ambassador',
      name: 'Community Ambassador',
      emoji: '👑',
      colorClass: 'from-purple-500/10 to-fuchsia-500/10 text-purple-700 border-purple-200/50',
      description: 'Elite citizen audit leader and supervisor.',
      benefit: 'Bypasses standard triage; escalates reports directly into local municipality emergency channels.',
      unlocked: profile.trustScore >= 85 && profile.reportCount >= 3,
      requirementText: 'Reach 85+ Trust Score & file 3+ reports',
      currentProgress: (profile.trustScore >= 85 ? 1 : 0) + (profile.reportCount >= 3 ? 1 : 0),
      targetProgress: 2,
    },
  ];

  // Count unlocked badges
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end font-sans">
      {/* Dark overlay backdrop with fade in */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-slide-in-right border-l border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="font-bold text-slate-800 font-display text-lg tracking-tight">Citizen Audit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="px-5 pt-3 bg-slate-50/50 border-b border-slate-100 flex gap-4 shrink-0">
          <button
            onClick={() => setModalTab('credentials')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              modalTab === 'credentials'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            My Credentials
          </button>
          <button
            onClick={() => setModalTab('handbook')}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              modalTab === 'handbook'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Benefits Handbook
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/20">
          {modalTab === 'credentials' ? (
            <>
              {/* User Hero Section */}
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
                <div className="relative">
                  {/* Outer pulsing ring for level/trust */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur opacity-25" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg border border-white">
                    {getInitials(profile.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">{profile.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" /> Active Citizen &middot; {profile.city}
                  </p>
                </div>
              </div>

              {/* Trust Score Radial Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-blue-50/20 border border-slate-100 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Community Trust Score
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                    <Sparkles className="w-2.5 h-2.5" /> Level {unlockedCount} Reporter
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 tracking-tight font-display">
                    {profile.trustScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/ 100 PTS</span>
                </div>

                {/* Slider/Progress bar styled with custom gradient */}
                <div className="space-y-1.5">
                  <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000 ease-out"
                      style={{ width: `${profile.trustScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Novice</span>
                    <span>Active</span>
                    <span>Leader</span>
                  </div>
                </div>

                <p className="text-[11px] leading-normal text-slate-500 font-medium">
                  Earn trust points by filing issues and receiving validations from fellow citizens. High trust scores unlock robust system perks and auto-validation.
                </p>
              </div>

              {/* Trust Score Visual Radar & Progress Components */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Trust Balance Radar
                  </h4>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                    Multi-Dimensional Audit
                  </span>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {/* Radar Chart Visual */}
                  <div className="w-full flex justify-center py-2 bg-slate-50/50 rounded-xl border border-slate-100/40 relative group overflow-hidden">
                    <svg viewBox="0 0 240 220" className="w-48 h-44 drop-shadow-xs">
                      {/* Concentric Triangles for grid */}
                      {[25, 50, 75, 100].map((g) => {
                        const r = R * (g / 100);
                        const yGrid1 = cy - r;
                        const xGrid2 = cx + r * 0.866;
                        const yGrid2 = cy + r * 0.5;
                        const xGrid3 = cx - r * 0.866;
                        const yGrid3 = cy + r * 0.5;
                        return (
                          <g key={g}>
                            <polygon
                              points={`${cx},${yGrid1} ${xGrid2},${yGrid2} ${xGrid3},${yGrid3}`}
                              fill="none"
                              stroke={g === 100 ? "rgba(148, 163, 184, 0.4)" : "rgba(148, 163, 184, 0.18)"}
                              strokeWidth={g === 100 ? "1.5" : "1"}
                              strokeDasharray={g < 100 ? "3,3" : "none"}
                            />
                            {/* Grid labels */}
                            <text
                              x={cx}
                              y={yGrid1 + 8}
                              textAnchor="middle"
                              className="text-[7.5px] font-mono font-bold fill-slate-300 select-none"
                            >
                              {g}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Radar Spokes */}
                      <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                      <line x1={cx} y1={cy} x2={cx + R * 0.866} y2={cy + R * 0.5} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                      <line x1={cx} y1={cy} x2={cx - R * 0.866} y2={cy + R * 0.5} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />

                      {/* User Value Area polygon */}
                      <polygon
                        points={`${x1},${y1Val} ${x2Val},${y2Val} ${x3Val},${y3Val}`}
                        fill="rgba(59, 130, 246, 0.18)"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        className="transition-all duration-700 ease-out"
                      />

                      {/* Values overlay centers */}
                      <circle cx={x1} cy={y1Val} r="5" fill="rgb(59, 130, 246)" stroke="#fff" strokeWidth="1.5" className="transition-all duration-700 ease-out shadow-xs" />
                      <circle cx={x2Val} cy={y2Val} r="5" fill="rgb(59, 130, 246)" stroke="#fff" strokeWidth="1.5" className="transition-all duration-700 ease-out shadow-xs" />
                      <circle cx={x3Val} cy={y3Val} r="5" fill="rgb(59, 130, 246)" stroke="#fff" strokeWidth="1.5" className="transition-all duration-700 ease-out shadow-xs" />

                      {/* Vertex Text Labels */}
                      <text x={cx} y={cy - R - 12} textAnchor="middle" className="text-[9.5px] font-extrabold fill-slate-500 tracking-wider">
                        Accuracy
                      </text>
                      <text x={cx + R * 0.866 + 8} y={cy + R * 0.5 + 8} textAnchor="start" className="text-[9.5px] font-extrabold fill-slate-500 tracking-wider">
                        Votes
                      </text>
                      <text x={cx - R * 0.866 - 8} y={cy + R * 0.5 + 8} textAnchor="end" className="text-[9.5px] font-extrabold fill-slate-500 tracking-wider">
                        Consistency
                      </text>
                    </svg>
                  </div>

                  {/* Components Progress Bars */}
                  <div className="w-full space-y-3.5">
                    {/* Component 1: Reports Verified */}
                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                          <span>Reports Verified</span>
                        </span>
                        <span className="font-mono text-[11px] text-blue-600 font-extrabold">{reportsVerified}%</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${reportsVerified}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Percentage of your submitted issues successfully confirmed by other active citizens.</p>
                    </div>

                    {/* Component 2: Community Votes */}
                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Community Votes</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-600 font-extrabold">{communityVotes}%</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                          style={{ width: `${communityVotes}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Your active engagement rate in validating and voting on community issues.</p>
                    </div>

                    {/* Component 3: Consistency Rating */}
                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                          <span>Consistency Rating</span>
                        </span>
                        <span className="font-mono text-[11px] text-purple-600 font-extrabold">{consistencyRating}%</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                          style={{ width: `${consistencyRating}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Measurement of your regular civic auditing frequency and activity patterns.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white border border-slate-100 rounded-xl flex items-center gap-3 shadow-xs hover:scale-[1.01] transition-transform">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
                    <span className="text-base font-bold text-slate-800 leading-tight">
                      {profile.reportCount}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-100 rounded-xl flex items-center gap-3 shadow-xs hover:scale-[1.01] transition-transform">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
                    <span className="text-base font-bold text-slate-800 leading-tight">100%</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Badges List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Your Civic Milestones ({unlockedCount}/{badges.length})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {badges.map((badge) => {
                    const pct = Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100));
                    return (
                      <div 
                        key={badge.id}
                        className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                          badge.unlocked 
                            ? 'bg-white border-slate-100 shadow-xs' 
                            : 'bg-slate-50/60 border-slate-100 text-slate-500'
                        }`}
                      >
                        {/* Progress watermarked bar for locked badges */}
                        {!badge.unlocked && (
                          <div 
                            className="absolute bottom-0 left-0 top-0 bg-slate-200/20 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        <div className="flex items-start gap-3 relative z-10">
                          {/* Badge Avatar Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border shadow-xs ${
                            badge.unlocked 
                              ? `bg-gradient-to-tr ${badge.colorClass}`
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {badge.emoji}
                          </div>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {badge.name}
                              </h5>
                              {badge.unlocked ? (
                                <span className="text-[9px] font-extrabold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wide">
                                  ✓ Unlocked
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wide">
                                  🔒 Locked
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              {badge.description}
                            </p>

                            {/* Reward Perk Description */}
                            <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                              <p className="text-[10px] text-slate-600 font-medium leading-tight">
                                <span className="font-bold text-slate-700">Perk:</span> {badge.benefit}
                              </p>
                            </div>

                            {/* Unlock criteria helper */}
                            {!badge.unlocked && (
                              <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                                <span>Require: {badge.requirementText}</span>
                                <span className="font-bold text-slate-500">
                                  {badge.currentProgress}/{badge.targetProgress} ({pct}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Handbook explaining the rewards engine */
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Trust Score & Gamification System
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  CivicLens AI promotes clean, highly accurate civic reports by rewarding authentic actions. Your trust score is direct evidence of your community helpfulness.
                </p>
              </div>

              {/* Score breakdown rule list */}
              <div className="space-y-3.5">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  How Trust Points Accumulate
                </h5>

                <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-xs">
                  <div className="p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">File a Civic Concern</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Submit an issue with location, picture and title</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                      +1 Point
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Earn Peer Validation</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">When another user votes "Confirm" on your issue</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                      +2 Points
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Verify Others' Submissions</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Vote or write review on pending community issues</p>
                    </div>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg shrink-0">
                      +1 Point
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">Submitting False Reports</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">When issues get rejected or marked as spam by peers</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg shrink-0">
                      -5 Points
                    </span>
                  </div>
                </div>
              </div>

              {/* Explaining Perks section */}
              <div className="space-y-3.5">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Why Unlock Milestones?
                </h5>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1">
                    <h6 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      🎟️ Auto-Escalation Weight
                    </h6>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Municipal boards receive thousands of fake items weekly. Verified reporters with high trust scores get their issues processed immediately with visual highlight tags.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-1">
                    <h6 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      🦾 AI Core Bypassing
                    </h6>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      High-status community validation counts as absolute truth in our network, reducing administrative delays and triggering repair dispatch workflows instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 shrink-0">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 hover:text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Civic Ledger</span>
          </button>
          <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>⬡ CivicLens AI Ledger Verified</span>
          </div>
        </div>
      </div>

      {/* CSS slide in keyframes */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
