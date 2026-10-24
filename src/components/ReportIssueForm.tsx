import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Building,
  MapPin,
  Tag,
  ShieldAlert,
  ArrowRight,
  EyeOff,
  Flame,
  ThumbsUp
} from 'lucide-react';
import { Ticket, TicketCategory, CAMPUS_BUILDINGS, CATEGORY_LABELS } from '../types';
import { findPotentialDuplicates, DuplicateMatch } from '../utils/duplicateDetector';
import { calculateImpactScore } from '../utils/scoring';
import { User } from 'firebase/auth';

interface ReportIssueFormProps {
  existingTickets: Ticket[];
  currentUser: User | null;
  onSubmitTicket: (newTicket: Partial<Ticket>) => Promise<void>;
  onSupportExistingTicket: (ticketId: string) => void;
  onCancel: () => void;
}

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  existingTickets,
  currentUser,
  onSubmitTicket,
  onSupportExistingTicket,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState<string>(CAMPUS_BUILDINGS[0]);
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState<TicketCategory>('electrical');
  const [safetySeverity, setSafetySeverity] = useState<number>(2);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissDuplicateId, setDismissDuplicateId] = useState<string | null>(null);

  // Real-time duplicate detection
  const duplicateMatches = useMemo(() => {
    if (!title && !room) return [];
    const matches = findPotentialDuplicates(
      {
        title,
        description,
        building,
        room,
        category,
      },
      existingTickets
    );
    return matches.filter((m) => m.ticket.id !== dismissDuplicateId);
  }, [title, description, building, room, category, existingTickets, dismissDuplicateId]);

  const topDuplicate: DuplicateMatch | undefined = duplicateMatches[0];

  // Prior tickets in location count for recurrence scoring preview
  const priorReportsInLocation = useMemo(() => {
    if (!room || !building) return 0;
    return existingTickets.filter(
      (t) =>
        t.building.toLowerCase() === building.toLowerCase() &&
        t.room.toLowerCase().trim() === room.toLowerCase().trim()
    ).length;
  }, [building, room, existingTickets]);

  // Preview Campus Impact Score in real time
  const liveImpactBreakdown = useMemo(() => {
    return calculateImpactScore(
      {
        safetySeverity,
        category,
        affectedCount: 1,
        priorReportsInLocation,
        createdAt: Date.now(),
      },
      Date.now(),
      `${title} ${description}`
    );
  }, [safetySeverity, category, priorReportsInLocation, title, description]);

  // AI Triage feature: calls server-side Gemini API
  const handleRunAiTriage = async () => {
    if (!title && !description) return;
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          building,
          room,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data);
        if (data.suggestedCategory && CATEGORY_LABELS[data.suggestedCategory as TicketCategory]) {
          setCategory(data.suggestedCategory as TicketCategory);
        }
        if (data.suggestedSeverity) {
          setSafetySeverity(Math.min(5, Math.max(1, data.suggestedSeverity)));
        }
      }
    } catch (err) {
      console.warn('AI Triage request failed, using local heuristics', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !room.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const newTicketPayload: Partial<Ticket> = {
        title: title.trim(),
        description: description.trim(),
        building,
        room: room.trim(),
        category,
        safetySeverity,
        affectedCount: 1,
        affectedUserIds: currentUser ? [currentUser.uid] : [],
        impactScore: liveImpactBreakdown.totalScore,
        impactBreakdown: liveImpactBreakdown,
        isAnonymous,
        authorName: isAnonymous ? 'Anonymous Student' : currentUser?.displayName || 'Campus Student',
        authorEmail: isAnonymous ? '' : currentUser?.email || '',
        status: 'reported',
        verifiedCount: 0,
        unresolvedCount: 0,
      };

      await onSubmitTicket(newTicketPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">Report Campus Issue</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              One Problem, One Ticket — submit new issues or support existing ones to accelerate resolution.
            </p>
          </div>

          {/* Impact preview pill */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicted Impact</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-lg font-black ${
                liveImpactBreakdown.totalScore >= 75 ? 'text-rose-400' :
                liveImpactBreakdown.totalScore >= 55 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {liveImpactBreakdown.totalScore} / 100
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                liveImpactBreakdown.priorityLevel === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                liveImpactBreakdown.priorityLevel === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {liveImpactBreakdown.priorityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2 Alert: Real-time Duplicate Detection ("One Problem, One Ticket") */}
        {topDuplicate && (
          <div className="bg-amber-950/40 border-b border-amber-800/60 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Duplicate Prevention Active • {topDuplicate.confidence}% Confidence Match
                  </span>
                  <button
                    type="button"
                    onClick={() => setDismissDuplicateId(topDuplicate.ticket.id)}
                    className="text-xs text-amber-400/80 hover:text-amber-300 underline"
                  >
                    Not a duplicate? Ignore
                  </button>
                </div>
                <h4 className="text-base font-semibold text-white mt-1">
                  Existing ticket already open: "{topDuplicate.ticket.title}"
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Location: <strong className="text-amber-200">{topDuplicate.ticket.building}, Room {topDuplicate.ticket.room}</strong> •
                  Currently supported by <strong className="text-amber-200">{topDuplicate.ticket.affectedCount} student{topDuplicate.ticket.affectedCount === 1 ? '' : 's'}</strong>.
                </p>
                <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                  {topDuplicate.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Instant Support CTA */}
                <div className="mt-3.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSupportExistingTicket(topDuplicate.ticket.id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    I'm affected too! Support this existing ticket
                  </button>
                  <span className="text-xs text-slate-400">
                    Prevents duplicate tickets and elevates priority for staff!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Auto-Fill / Scenario helper for Judges & Demo */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Demo Presets (Prompt Scenarios):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('Ceiling fan stopped working in back row');
                  setDescription('The ceiling fan in the rear corner does not rotate at all when switched on. Students are sweating during afternoon lectures.');
                  setBuilding('Block B (Science & Humanities)');
                  setRoom('C-204');
                  setCategory('electrical');
                  setSafetySeverity(2);
                }}
                className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              >
                1. Test Block B C-204 Fan (Duplicate)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Water leaking directly onto electrical socket strip');
                  setDescription('Heavy dripping from ceiling right above high-voltage power board in Lab 201. Sparks seen on socket!');
                  setBuilding('Block A (Engineering & Labs)');
                  setRoom('Lab 201');
                  setCategory('safety');
                  setSafetySeverity(5);
                }}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
              >
                2. Test Critical Hazard
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Problem Title *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ceiling fan not working, Wi-Fi disconnected in study room..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Location: Building & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Campus Building *
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Room / Area Identifier *
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. C-204, Lab 3, 2F Washroom, Cafeteria Bay A"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
              />
              {priorReportsInLocation > 0 && (
                <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Note: {priorReportsInLocation} prior maintenance issues in this exact location.
                </p>
              )}
            </div>
          </div>

          {/* Description & AI Triage Trigger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Problem Description *
              </label>
              <button
                type="button"
                onClick={handleRunAiTriage}
                disabled={isAnalyzingAI || (!title && !description)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingAI ? 'animate-spin' : 'text-emerald-400'}`} />
                {isAnalyzingAI ? 'AI Scanning...' : 'AI Auto-Classify & Safety Scan'}
              </button>
            </div>

            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, when you noticed it, and any hazards..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
            />

            {/* AI Triage Feedback Banner */}
            {aiAnalysisResult && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Facility Assessment: {aiAnalysisResult.detectedEquipment}
                  </span>
                  <span className="text-slate-400">Urgency: {aiAnalysisResult.urgency}</span>
                </div>
                <p className="text-slate-300">{aiAnalysisResult.hazardExplanation}</p>
                {aiAnalysisResult.suggestedAction && (
                  <p className="text-slate-400 italic">Technician protocol: {aiAnalysisResult.suggestedAction}</p>
                )}
              </div>
            )}
          </div>

          {/* Category & Safety Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((catKey) => {
                  const meta = CATEGORY_LABELS[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      type="button"
                      key={catKey}
                      onClick={() => setCategory(catKey)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Safety Severity: Level {safetySeverity}/5
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {safetySeverity === 5 ? 'Critical Emergency' :
                   safetySeverity >= 4 ? 'High Hazard' :
                   safetySeverity === 3 ? 'Moderate Disruption' : 'Minor Inconvenience'}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={safetySeverity}
                onChange={(e) => setSafetySeverity(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                <span>1 - Minor</span>
                <span>2 - Inconvenience</span>
                <span>3 - Disruptive</span>
                <span>4 - Hazardous</span>
                <span>5 - Emergency</span>
              </div>

              {/* Anonymous Submission Toggle */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 accent-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submit anonymously (identity hidden from peers)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Impact Score Transparency Card */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">
                Transparent Impact Score Formula: S + A + R + T = {liveImpactBreakdown.totalScore}/100
              </span>
              <span className="text-slate-400">Explainable Prioritization</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block">Safety (S)</span>
                <span className="font-bold text-rose-400">+{liveImpactBreakdown.safetyScore} pts</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block">Affected (A)</span>
                <span className="font-bold text-emerald-400">+{liveImpactBreakdown.affectedScore} pts</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block">Recurrence (R)</span>
                <span className="font-bold text-amber-400">+{liveImpactBreakdown.recurrenceScore} pts</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block">Time (T)</span>
                <span className="font-bold text-indigo-400">+{liveImpactBreakdown.timeScore} pts</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !room || !description}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span>Submitting Ticket...</span>
              ) : (
                <>
                  <span>Publish Campus Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
