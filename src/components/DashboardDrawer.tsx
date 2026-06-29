import React, { useState } from 'react';
import { CivicIssue, IssueCategory, IssueStatus } from '../types';
import { X, Search, Clock, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, Filter, Eye, Sparkles, AlertTriangle } from 'lucide-react';

interface DashboardDrawerProps {
  issues: CivicIssue[];
  isOpen: boolean;
  onClose: () => void;
  onShowOnMap: (issue: CivicIssue) => void;
  activeCity: string;
}

export default function DashboardDrawer({ issues, isOpen, onClose, onShowOnMap, activeCity }: DashboardDrawerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Reported' | 'In Progress' | 'Resolved'>('All');

  if (!isOpen) return null;

  // Filter issues belonging only to the current active city
  const cityIssues = issues.filter(
    (issue) => (issue.city || 'Bhopal').toLowerCase() === activeCity.toLowerCase()
  );

  // Filter logic based on the current active city's issues
  const filteredIssues = cityIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase()) ||
      (issue.address && issue.address.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;

    // Map IssueStatus to tab
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Reported' && issue.status === 'Reported') ||
      (activeTab === 'In Progress' && (issue.status === 'In Progress' || issue.status === 'Verified')) ||
      (activeTab === 'Resolved' && issue.status === 'Resolved');

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Calculate high-level stats for the current active city
  const totalCount = cityIssues.length;
  const resolvedCount = cityIssues.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = cityIssues.filter((i) => i.status === 'In Progress' || i.status === 'Verified').length;
  const pendingCount = cityIssues.filter((i) => i.status === 'Reported').length;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Recent Date';
    }
  };

  const getCategoryEmoji = (cat: IssueCategory) => {
    switch (cat) {
      case 'Pothole': return '🔴';
      case 'Garbage': return '🟢';
      case 'Water Leak': return '🔵';
      case 'Broken Infrastructure': return '🟠';
      default: return '⚪';
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">✓ Verified</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">⚙ In Progress</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">🎉 Resolved</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">⏳ Reported</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[10002] flex justify-start font-sans pointer-events-none">
      {/* Semi-transparent Backdrop click-off */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      {/* Main Left Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col z-10 pointer-events-auto animate-slide-in-left border-r border-slate-100">
        
        {/* Header Block */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/10">
              📊
            </div>
            <div>
              <h2 className="font-bold text-slate-800 font-display text-lg tracking-tight leading-none">Civic Audit Ledger</h2>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">Cross-referencing real-time validation queues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Stats Dashboard Summary */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 shrink-0 grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            <span className="text-base font-bold text-slate-800">{totalCount}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            <span className="block text-xs font-semibold text-amber-500 uppercase tracking-wider">Reported</span>
            <span className="text-base font-bold text-amber-600">{pendingCount}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            <span className="block text-xs font-semibold text-blue-500 uppercase tracking-wider">In Work</span>
            <span className="text-base font-bold text-blue-600">{inProgressCount}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            <span className="block text-xs font-semibold text-teal-500 uppercase tracking-wider">Resolved</span>
            <span className="text-base font-bold text-teal-600">{resolvedCount}</span>
          </div>
        </div>

        {/* Filter Toolbar Container */}
        <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, desc or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-700 transition-all"
            />
          </div>

          <div className="flex gap-2 items-center">
            {/* Category selection */}
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as IssueCategory | 'All')}
                className="w-full pl-3 pr-8 py-2 bg-slate-50/80 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="All">📁 All Categories</option>
                <option value="Pothole">🔴 Potholes</option>
                <option value="Garbage">🟢 Garbage Piles</option>
                <option value="Water Leak">🔵 Water Pipeline Leaks</option>
                <option value="Broken Infrastructure">🟠 Broken Infrastructure</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick clean search */}
            {(search || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 rounded-lg transition-colors shrink-0"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600">
            {(['All', 'Reported', 'In Progress', 'Resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Issue Lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/20">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-xs">
                <AlertCircle className="w-7 h-7 text-slate-300" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700">
                  {search || selectedCategory !== 'All' || activeTab !== 'All'
                    ? 'No matching audit records'
                    : `No issues in ${activeCity} yet`}
                </p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
                  {search || selectedCategory !== 'All' || activeTab !== 'All'
                    ? 'Try adjusting your search queries, clearing category filters, or switching tabs.'
                    : `Be the first to log a pothole, litter pile, or road concern in ${activeCity}! Close this panel and tap the green plus button on the map.`}
                </p>
              </div>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const confirms = issue.votesConfirm;
              const rejects = issue.votesReject;
              const totalVotes = confirms + rejects;
              const percent = totalVotes > 0 ? Math.round((confirms / totalVotes) * 100) : 100;

              return (
                <div
                  key={issue.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between group gap-3.5 relative overflow-hidden"
                >
                  {/* Category Side-decor overlay line */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{
                      backgroundColor:
                        issue.category === 'Pothole' ? '#ef4444' :
                        issue.category === 'Garbage' ? '#10b981' :
                        issue.category === 'Water Leak' ? '#3b82f6' : '#f59e0b'
                    }}
                  />

                  <div className="flex gap-3 pl-1.5">
                    {/* Small preview avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0 shadow-inner">
                      <img
                        src={issue.image}
                        alt={issue.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {getCategoryEmoji(issue.category)} {issue.category}
                        </span>
                        {getStatusBadge(issue.status)}
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                        {issue.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body description excerpt */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed pl-1.5 line-clamp-2">
                    {issue.description}
                  </p>

                  {/* Timestamps & Locality */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400 border-t border-b border-slate-50 py-2.5 pl-1.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(issue.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-[11px] shrink-0 text-slate-400">📍</span>
                      <span className="truncate text-slate-500 font-semibold">{issue.address || 'Bhopal Region'}</span>
                    </div>
                  </div>

                  {/* Bottom validation metrics & navigation click */}
                  <div className="flex items-center justify-between pl-1.5 pt-0.5">
                    {/* Tiny stats representation */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        👍 {confirms}
                      </span>
                      {rejects > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          👎 {rejects}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">
                        ({percent}% Confirmed)
                      </span>
                    </div>

                    {/* Show on Map click action */}
                    <button
                      onClick={() => onShowOnMap(issue)}
                      className="flex items-center gap-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[10px] rounded-lg transition-all group-hover:shadow-sm"
                    >
                      <span>Show on Map</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Audit badge */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Civic Validation Engine Active
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
