import React, { useState } from 'react';
import {
  PlayCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  AlertTriangle,
  Flame,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { Ticket } from '../types';

interface JudgeDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'tickets' | 'report' | 'hotspots') => void;
  onSetAdminMode: (admin: boolean) => void;
  onSupportTicket: (ticketId: string) => void;
  tickets: Ticket[];
}

interface Step {
  stepNumber: number;
  title: string;
  subheading: string;
  pitchSpeech: string;
  actionLabel: string;
  runAction: () => void;
}

export const JudgeDemoTour: React.FC<JudgeDemoTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSetAdminMode,
  onSupportTicket,
  tickets,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const blockBTicket = tickets.find(
    (t) => t.building.includes('Block B') && t.room.includes('C-204')
  ) || tickets[0];

  const steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Step 1: The Problem on Today’s Campus',
      subheading: '2,000 students, broken facilities, lost WhatsApp complaints',
      pitchSpeech:
        '“In any college with thousands of students, things break daily: fans, projectors, water leaks, Wi-Fi outages. Students complain verbally or on WhatsApp. Important tickets get lost, duplicate reports flood staff, and nobody knows if things actually get fixed.”',
      actionLabel: 'View Active Tickets Feed',
      runAction: () => {
        onSetAdminMode(false);
        onNavigateTab('tickets');
      },
    },
    {
      stepNumber: 2,
      title: 'Step 2: Create a Ticket (Block B, Room C-204 Fan)',
      subheading: 'Student reports that the fan in back row is not spinning',
      pitchSpeech:
        '“A student enters the problem title, description, building, room number, and category. Notice how the Campus Impact Score and safety indicators update in real-time.”',
      actionLabel: 'Open Report Issue Form',
      runAction: () => {
        onSetAdminMode(false);
        onNavigateTab('report');
      },
    },
    {
      stepNumber: 3,
      title: 'Step 3: Real-Time Duplicate Detection',
      subheading: '“One Problem, One Ticket” prevents complaint spam',
      pitchSpeech:
        '“If another student starts reporting the same broken fan in Room C-204, CampusFix AI flags the existing unresolved report and suggests: ‘1 Problem, 1 Ticket: We found an open report. Instead of duplicate clutter, support it with 1 click!’”',
      actionLabel: 'Demo Duplicate Detection',
      runAction: () => {
        onSetAdminMode(false);
        onNavigateTab('report');
      },
    },
    {
      stepNumber: 4,
      title: 'Step 4: Measure Community Impact',
      subheading: '“I’m Affected Too” turns individual voices into collective priority',
      pitchSpeech:
        '“Other affected students click ‘I’m affected too.’ Their support is counted on the single shared ticket, proving to administration how many students are impacted without creating 10 duplicate tickets.”',
      actionLabel: 'Add Support to Block B Fan Ticket',
      runAction: () => {
        onSetAdminMode(false);
        onNavigateTab('tickets');
        if (blockBTicket) {
          onSupportTicket(blockBTicket.id);
        }
      },
    },
    {
      stepNumber: 5,
      title: 'Step 5: Prioritization via Campus Impact Score',
      subheading: 'Transparent formula: S + A + R + T = 0 to 100 Score',
      pitchSpeech:
        '“Each complaint receives a score from 0–100 using Safety (S), Affected Students (A), Recurrence in the area (R), and Time Unresolved (T). The interface explains exactly why an electrical hazard jumps ahead of a broken chair.”',
      actionLabel: 'Inspect Score Factors',
      runAction: () => {
        onSetAdminMode(false);
        onNavigateTab('tickets');
      },
    },
    {
      stepNumber: 6,
      title: 'Step 6: Staff Resolution & Student Verification',
      subheading: 'Verify Before Closing: Students must confirm it is fixed',
      pitchSpeech:
        '“Maintenance staff updates tickets to In Progress and then Resolved with repair notes. But here is our differentiator: the ticket is not closed yet! Students on site can click ‘Confirm Fixed’ or ‘Problem Still Exists’ before it is archived.”',
      actionLabel: 'Switch to Staff Mode',
      runAction: () => {
        onSetAdminMode(true);
        onNavigateTab('tickets');
      },
    },
    {
      stepNumber: 7,
      title: 'Step 7: Campus Problem Hotspots Dashboard',
      subheading: 'Systemic insights instead of isolated incidents',
      pitchSpeech:
        '“Finally, the college administration dashboard aggregates incidents to show chronic problem areas — like Block B having repeated electrical failures. CampusFix AI enables preventive maintenance!”',
      actionLabel: 'Open Hotspots Dashboard',
      runAction: () => {
        onNavigateTab('hotspots');
      },
    },
  ];

  const currentStep = steps[currentStepIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[500px] z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900/95 border-2 border-indigo-500/80 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden text-white">
        {/* Top Header */}
        <div className="bg-indigo-600/90 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-200" />
            <span className="font-extrabold text-sm uppercase tracking-wider">
              Judge Pitch Demo Mode • Step {currentStep.stepNumber} of 7
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              {currentStep.subheading}
            </span>
            <h4 className="text-base font-bold text-white mt-0.5">
              {currentStep.title}
            </h4>
          </div>

          {/* What to Say Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-xs text-indigo-100 italic leading-relaxed">
            <span className="text-[10px] font-bold text-indigo-400 uppercase not-italic block mb-1">
              🎤 Pitch Script (What to say to judges):
            </span>
            {currentStep.pitchSpeech}
          </div>

          {/* Interactive Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={currentStep.runAction}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentStep.actionLabel}</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                if (currentStepIndex > 0) {
                  const newIdx = currentStepIndex - 1;
                  setCurrentStepIndex(newIdx);
                  steps[newIdx].runAction();
                }
              }}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    steps[idx].runAction();
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStepIndex ? 'bg-indigo-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentStepIndex < steps.length - 1) {
                  const newIdx = currentStepIndex + 1;
                  setCurrentStepIndex(newIdx);
                  steps[newIdx].runAction();
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
            >
              {currentStepIndex < steps.length - 1 ? (
                <>Next <ChevronRight className="w-4 h-4" /></>
              ) : (
                'Finish Tour'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
