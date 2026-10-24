import React from 'react';
import {
  ShieldAlert,
  Flame,
  Wrench,
  Sparkles,
  Bot,
  PlayCircle,
  UserCheck,
  Building2,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenChat: () => void;
  onStartDemoTour: () => void;
  activeTab: 'tickets' | 'report' | 'hotspots';
  setActiveTab: (tab: 'tickets' | 'report' | 'hotspots') => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  stats: {
    totalOpen: number;
    criticalCount: number;
    duplicatesPrevented: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminMode,
  onToggleAdminMode,
  onOpenChat,
  onStartDemoTour,
  activeTab,
  setActiveTab,
  currentUser,
  onLogin,
  onLogout,
  stats,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tickets')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    CampusFix<span className="text-emerald-400 font-extrabold">.AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Report Less. Resolve Smarter.
                </p>
              </div>
            </button>

            {/* Quick Metrics Ticker */}
            <div className="hidden lg:flex items-center gap-3 ml-6 pl-6 border-l border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">{stats.totalOpen} Active Issues</span>
              </div>
              {stats.criticalCount > 0 && (
                <div className="flex items-center gap-1.5 bg-rose-950/40 text-rose-300 px-2.5 py-1 rounded-full border border-rose-800/40">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-medium">{stats.criticalCount} Critical Hazards</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <span className="font-medium">1 Problem, 1 Ticket:</span>
                <span className="font-bold text-emerald-200">{stats.duplicatesPrevented} Duplicates Saved</span>
              </div>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              + Report Issue
            </button>
            <button
              onClick={() => setActiveTab('hotspots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'hotspots'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Hotspots
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Judge Demo Tour Launcher */}
            <button
              onClick={onStartDemoTour}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all border border-indigo-400/30"
              title="Interactive 7-step presentation pitch demo for judges"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Judge Pitch Demo</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Ask AI Copilot</span>
            </button>

            {/* Role Switcher: Student vs Admin */}
            <button
              onClick={onToggleAdminMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAdminMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'
              }`}
              title={isAdminMode ? 'Switch to Student View' : 'Switch to Maintenance Staff / Admin Mode'}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAdminMode ? 'Staff Mode' : 'Student Mode'}</span>
            </button>

            {/* Google Authentication */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-emerald-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Google Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
