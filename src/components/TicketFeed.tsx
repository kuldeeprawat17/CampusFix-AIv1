import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  CheckCircle2,
  ThumbsUp,
  Building2,
  Sparkles,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Ticket, TicketCategory, TicketStatus, CAMPUS_BUILDINGS, CATEGORY_LABELS } from '../types';
import { TicketCard } from './TicketCard';
import { User } from 'firebase/auth';
import { downloadTicketsCsv } from '../utils/exportCsv';

interface TicketFeedProps {
  tickets: Ticket[];
  currentUser: User | null;
  isAdminMode: boolean;
  onSupportTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus, notes?: string, technician?: string) => void;
  onVerifyResolution: (ticketId: string, confirmed: boolean, note?: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onOpenReportForm: () => void;
}

export const TicketFeed: React.FC<TicketFeedProps> = ({
  tickets,
  currentUser,
  isAdminMode,
  onSupportTicket,
  onUpdateStatus,
  onVerifyResolution,
  onDeleteTicket,
  onOpenReportForm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'impact' | 'affected' | 'safety' | 'newest'>('impact');

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.building.toLowerCase().includes(q) ||
            t.room.toLowerCase().includes(q) ||
            (t.assignedTechnician && t.assignedTechnician.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Building filter
        if (selectedBuilding !== 'all' && t.building !== selectedBuilding) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter === 'active') {
          return t.status === 'reported' || t.status === 'in_progress';
        }
        if (statusFilter === 'resolved') {
          return t.status === 'resolved';
        }
        if (statusFilter === 'closed') {
          return t.status === 'verified_closed';
        }
        if (statusFilter === 'safety') {
          return t.safetySeverity >= 4 || t.category === 'safety';
        }
        if (statusFilter === 'all') {
          return true;
        }
        return t.status === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'impact') {
          return b.impactScore - a.impactScore;
        }
        if (sortBy === 'affected') {
          return b.affectedCount - a.affectedCount;
        }
        if (sortBy === 'safety') {
          return b.safetySeverity - a.safetySeverity;
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [tickets, searchQuery, selectedBuilding, selectedCategory, statusFilter, sortBy]);

  // Aggregate stats
  const totalAffected = useMemo(() => {
    return tickets.reduce((acc, t) => acc + (t.affectedCount || 1), 0);
  }, [tickets]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Total Tickets Logged</span>
          <span className="text-2xl font-black text-white mt-1 block">{tickets.length}</span>
          <span className="text-[11px] text-emerald-400 font-medium mt-0.5 block">Centralized facility tracking</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Community Impact</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{totalAffected}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Students affected / supported</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Duplicates Prevented</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {Math.max(0, totalAffected - tickets.length)}
          </span>
          <span className="text-[11px] text-amber-300/80 mt-0.5 block">One Problem, One Ticket</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-medium block">Pending Verification</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">
            {tickets.filter((t) => t.status === 'resolved').length}
          </span>
          <span className="text-[11px] text-purple-300/80 mt-0.5 block">Student confirm required</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment, problem, room (e.g. C-204, fan, water, Wi-Fi)..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Building Selector */}
          <div className="w-full md:w-60">
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Campus Buildings</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-56 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="impact">Highest Impact Score (0-100)</option>
              <option value="affected">Most Students Affected</option>
              <option value="safety">Highest Safety Risk</option>
              <option value="newest">Recently Reported</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Active & In Progress ({tickets.filter((t) => t.status === 'reported' || t.status === 'in_progress').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('safety')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              statusFilter === 'safety'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Safety Hazards ({tickets.filter((t) => t.safetySeverity >= 4 || t.category === 'safety').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'resolved'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pending Verification ({tickets.filter((t) => t.status === 'resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'closed'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Verified Closed ({tickets.filter((t) => t.status === 'verified_closed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All ({tickets.length})
          </button>

          {/* Download CSV Action for Admin / Maintenance Staff */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadTicketsCsv(filteredTickets, 'campusfix_tickets_export')}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] shadow-sm"
              title="Export all currently filtered tickets as CSV with Impact Scores, priority factors, and resolution status"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV ({filteredTickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              currentUser={currentUser}
              isAdminMode={isAdminMode}
              onSupportTicket={onSupportTicket}
              onUpdateStatus={onUpdateStatus}
              onVerifyResolution={onVerifyResolution}
              onDeleteTicket={onDeleteTicket}
            />
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">No tickets match your filters</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Everything in this view is either resolved or no new reports have been logged.
            </p>
            <button
              type="button"
              onClick={onOpenReportForm}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              + Report a New Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
