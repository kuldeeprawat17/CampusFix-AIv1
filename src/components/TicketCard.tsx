import React, { useState } from 'react';
import {
  ShieldAlert,
  ThumbsUp,
  MapPin,
  Clock,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  MessageSquare,
  Flame,
  Check,
  X,
  Share2
} from 'lucide-react';
import { Ticket, TicketStatus, CATEGORY_LABELS } from '../types';
import { User } from 'firebase/auth';

interface TicketCardProps {
  ticket: Ticket;
  currentUser: User | null;
  isAdminMode: boolean;
  onSupportTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus, notes?: string, technician?: string) => void;
  onVerifyResolution: (ticketId: string, confirmed: boolean, note?: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  currentUser,
  isAdminMode,
  onSupportTicket,
  onUpdateStatus,
  onVerifyResolution,
  onDeleteTicket,
}) => {
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminNotes, setAdminNotes] = useState(ticket.resolutionNotes || '');
  const [adminTech, setAdminTech] = useState(ticket.assignedTechnician || '');
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [showVerifyInput, setShowVerifyInput] = useState(false);

  const isUserAffected = currentUser
    ? ticket.affectedUserIds?.includes(currentUser.uid)
    : false;

  const categoryMeta = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS.other;

  // Format time elapsed
  const formatTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'reported':
        return { text: 'Reported', bg: 'bg-amber-950/50 text-amber-300 border-amber-800/50' };
      case 'in_progress':
        return { text: 'In Progress', bg: 'bg-blue-950/50 text-blue-300 border-blue-800/50' };
      case 'resolved':
        return { text: 'Pending Student Verification', bg: 'bg-purple-950/50 text-purple-300 border-purple-800/50' };
      case 'verified_closed':
        return { text: 'Verified Closed', bg: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' };
    }
  };

  const statusBadge = getStatusBadge(ticket.status);

  // Score color styling
  const scoreColor =
    ticket.impactScore >= 75
      ? 'from-rose-500 to-red-600 text-rose-100'
      : ticket.impactScore >= 55
      ? 'from-amber-500 to-orange-500 text-amber-950'
      : 'from-emerald-500 to-teal-500 text-emerald-950';

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all duration-200">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Category tag */}
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {categoryMeta.label}
            </span>

            {/* Lifecycle Status */}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusBadge.bg}`}>
              {statusBadge.text}
            </span>

            {/* Safety Alert Badge */}
            {ticket.safetySeverity >= 4 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Hazard
              </span>
            )}

            <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(ticket.createdAt)}
            </span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
            {ticket.title}
          </h3>
        </div>

        {/* Campus Impact Score Badge */}
        <div className="shrink-0 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scoreColor} flex flex-col items-center justify-center shadow-md font-black hover:scale-105 transition-transform`}
            title="Click to view explainable Campus Impact Score calculation"
          >
            <span className="text-lg leading-none">{ticket.impactScore}</span>
            <span className="text-[9px] uppercase tracking-tighter opacity-80 font-bold">Impact</span>
          </button>
          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-0.5 font-medium">
            {ticket.impactBreakdown?.priorityLevel || 'Score'}
            {showScoreBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </div>
      </div>

      {/* Location Bar */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-semibold text-slate-200">{ticket.building}</span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-300 font-medium">{ticket.room}</span>
        {ticket.isAnonymous ? (
          <span className="ml-auto text-[11px] text-slate-500 italic">Anonymous Reporter</span>
        ) : (
          <span className="ml-auto text-[11px] text-slate-400">By {ticket.authorName || 'Student'}</span>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-slate-300 leading-relaxed">
        {ticket.description}
      </p>

      {/* Resolution Notes (if available) */}
      {ticket.resolutionNotes && (
        <div className="mt-3 p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200">
          <div className="flex items-center gap-1.5 font-semibold text-purple-300 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            Repair Resolution Recorded:
          </div>
          <p className="text-slate-300">{ticket.resolutionNotes}</p>
          {ticket.resolvedBy && (
            <p className="text-[11px] text-purple-400/80 mt-1">Technician: {ticket.resolvedBy}</p>
          )}
        </div>
      )}

      {/* Explainable Impact Score Accordion (Feature 2) */}
      {showScoreBreakdown && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-1.5">
            <span>Campus Impact Score Breakdown</span>
            <span className="text-emerald-400">{ticket.impactScore} / 100</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] py-1">
            <div className="p-2 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block">Safety & Hazard (S)</span>
              <span className="font-bold text-rose-400">+{ticket.impactBreakdown?.safetyScore || 15} pts</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block">Affected Students (A)</span>
              <span className="font-bold text-emerald-400">+{ticket.impactBreakdown?.affectedScore || 12} pts</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block">Recurrence (R)</span>
              <span className="font-bold text-amber-400">+{ticket.impactBreakdown?.recurrenceScore || 0} pts</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block">Time Unresolved (T)</span>
              <span className="font-bold text-indigo-400">+{ticket.impactBreakdown?.timeScore || 6} pts</span>
            </div>
          </div>
          {ticket.impactBreakdown?.reasons && ticket.impactBreakdown.reasons.length > 0 && (
            <div className="space-y-1 pt-1 text-[11px] text-slate-400">
              <span className="text-slate-300 font-semibold block">Contributing Factors:</span>
              {ticket.impactBreakdown.reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feature 4: Verify Before Closing (Student Verification Prompt) */}
      {ticket.status === 'resolved' && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/40">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Verify Before Closing
          </div>
          <p className="text-xs text-slate-300">
            Maintenance staff marked this repaired. Are you on site? Please confirm whether the issue is actually resolved.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onVerifyResolution(ticket.id, true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Yes, Confirmed Fixed ({ticket.verifiedCount})
            </button>

            <button
              type="button"
              onClick={() => setShowVerifyInput(!showVerifyInput)}
              className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Problem Still Exists ({ticket.unresolvedCount})
            </button>
          </div>

          {showVerifyInput && (
            <div className="mt-2.5 pt-2 border-t border-purple-800/30 flex gap-2">
              <input
                type="text"
                placeholder="What is still not working? (e.g. Fan still humming, leak started again)"
                value={verifyFeedback}
                onChange={(e) => setVerifyFeedback(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => {
                  onVerifyResolution(ticket.id, false, verifyFeedback);
                  setShowVerifyInput(false);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-xs"
              >
                Submit Flag
              </button>
            </div>
          )}
        </div>
      )}

      {/* Verified closed summary */}
      {ticket.status === 'verified_closed' && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Community Verified Fixed ({ticket.verifiedCount} student confirmations)</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium">Issue Closed</span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
        {/* Step 3: Measure Community Impact ("I'm affected too") */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSupportTicket(ticket.id)}
            disabled={ticket.status === 'verified_closed'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              isUserAffected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 active:scale-95'
            }`}
            title="Indicate that you are also affected by this maintenance problem"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUserAffected ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
            <span>{isUserAffected ? "You're Supported" : "I'm Affected Too"}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 text-[11px] font-bold text-slate-300">
              {ticket.affectedCount}
            </span>
          </button>
          <span className="text-slate-500 hidden sm:inline text-[11px]">
            {ticket.affectedCount === 1 ? '1 student reported' : `${ticket.affectedCount} students affected`}
          </span>
        </div>

        {/* Admin / Staff Controls toggle */}
        {isAdminMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl font-medium transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Actions</span>
            </button>
            {onDeleteTicket && (
              <button
                type="button"
                onClick={() => onDeleteTicket(ticket.id)}
                className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1"
                title="Delete ticket"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Action Drawer / Editor */}
      {isAdminMode && showAdminPanel && (
        <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span>Maintenance Staff Dispatch & Resolution</span>
            <span className="text-slate-400 font-normal">Ticket #{ticket.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Update Status:</label>
              <select
                value={ticket.status}
                onChange={(e) => onUpdateStatus(ticket.id, e.target.value as TicketStatus, adminNotes, adminTech)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="reported">Reported (New)</option>
                <option value="in_progress">In Progress (Assigned)</option>
                <option value="resolved">Resolved (Awaiting Student Verification)</option>
                <option value="verified_closed">Verified Closed</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Assigned Technician:</label>
              <input
                type="text"
                value={adminTech}
                onChange={(e) => setAdminTech(e.target.value)}
                placeholder="e.g. Rajesh (Electrical), IT Ops..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Repair Notes & Actions Taken:</label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Replaced capacitor on motor, tested at 220V, verified rotation speed."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, ticket.status, adminNotes, adminTech)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-colors"
            >
              Save Dispatch Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
