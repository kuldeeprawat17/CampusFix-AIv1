import React, { useMemo } from 'react';
import {
  Flame,
  Building,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  Download
} from 'lucide-react';
import { Ticket, CAMPUS_BUILDINGS, CATEGORY_LABELS } from '../types';
import { downloadTicketsCsv } from '../utils/exportCsv';

interface HotspotsDashboardProps {
  tickets: Ticket[];
  onSelectBuilding: (building: string) => void;
}

export const HotspotsDashboard: React.FC<HotspotsDashboardProps> = ({
  tickets,
  onSelectBuilding,
}) => {
  // Aggregate data by building
  const buildingStats = useMemo(() => {
    return CAMPUS_BUILDINGS.map((building) => {
      const buildingTickets = tickets.filter((t) => t.building === building);
      const openTickets = buildingTickets.filter((t) => t.status === 'reported' || t.status === 'in_progress');
      const resolvedTickets = buildingTickets.filter((t) => t.status === 'resolved' || t.status === 'verified_closed');
      const criticalTickets = buildingTickets.filter((t) => t.safetySeverity >= 4 || t.category === 'safety');
      const affectedSum = buildingTickets.reduce((acc, t) => acc + (t.affectedCount || 1), 0);

      // Find top problem category for this building
      const catCounts: Record<string, number> = {};
      buildingTickets.forEach((t) => {
        catCounts[t.category] = (catCounts[t.category] || 0) + 1;
      });
      let topCategory = 'None';
      let maxCatCount = 0;
      Object.entries(catCounts).forEach(([cat, count]) => {
        if (count > maxCatCount) {
          maxCatCount = count;
          topCategory = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]?.label || cat;
        }
      });

      return {
        building,
        total: buildingTickets.length,
        open: openTickets.length,
        resolved: resolvedTickets.length,
        critical: criticalTickets.length,
        affectedSum,
        topCategory,
        // Calculate heat index
        heatScore: openTickets.length * 15 + criticalTickets.length * 25 + affectedSum * 3,
      };
    }).sort((a, b) => b.heatScore - a.heatScore);
  }, [tickets]);

  // Aggregate by category
  const categoryStats = useMemo(() => {
    const counts: Record<string, { total: number; open: number; affected: number }> = {};
    Object.keys(CATEGORY_LABELS).forEach((cat) => {
      counts[cat] = { total: 0, open: 0, affected: 0 };
    });

    tickets.forEach((t) => {
      if (counts[t.category]) {
        counts[t.category].total++;
        if (t.status === 'reported' || t.status === 'in_progress') counts[t.category].open++;
        counts[t.category].affected += t.affectedCount || 1;
      }
    });

    return Object.entries(counts).sort((a, b) => b[1].total - a[1].total);
  }, [tickets]);

  // Find chronic room hotspots (rooms with >= 2 complaints)
  const chronicRooms = useMemo(() => {
    const roomMap: Record<string, { building: string; room: string; count: number; tickets: Ticket[] }> = {};
    tickets.forEach((t) => {
      const key = `${t.building}___${t.room.toLowerCase().trim()}`;
      if (!roomMap[key]) {
        roomMap[key] = { building: t.building, room: t.room, count: 0, tickets: [] };
      }
      roomMap[key].count++;
      roomMap[key].tickets.push(t);
    });

    return Object.values(roomMap)
      .filter((r) => r.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Overview Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5" />
              Feature 3: Campus Problem Hotspots
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Predictive Facilities & Hotspot Analytics
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Moving beyond one-off repairs. By aggregating repeat issues across campus zones, college administrators can identify chronic equipment failures and prevent future outages before they happen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/60 text-center w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Highest Active Hotspot</span>
              <span className="text-lg font-black text-amber-400 mt-1 block">
                {buildingStats[0]?.building.split('(')[0] || 'Campus'}
              </span>
              <span className="text-xs text-slate-300">
                {buildingStats[0]?.open} unresolved tickets • {buildingStats[0]?.affectedSum} students affected
              </span>
            </div>

            <button
              type="button"
              onClick={() => downloadTicketsCsv(tickets, 'campusfix_facilities_report')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-4 py-3 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] w-full sm:w-auto"
              title="Download full CSV report of all campus tickets with impact scores, resolution times, and technician notes"
            >
              <Download className="w-4 h-4" />
              <span>Download Full CSV Report ({tickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chronic Problem Areas Alert */}
      {chronicRooms.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Chronic Recurring Equipment / Room Hotspots Flagged:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {chronicRooms.map((roomItem, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      {roomItem.building} • Room {roomItem.room}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {roomItem.count} Recurring Incidents
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Issues: {roomItem.tickets.map((t) => t.title).join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectBuilding(roomItem.building)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold shrink-0"
                >
                  View Tickets →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campus Building Hotspot Cards */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-400" />
          Building Incident Breakdown & Heat Index
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildingStats.map((item) => {
            const hasActivity = item.total > 0;
            const isHighHeat = item.heatScore > 50;

            return (
              <div
                key={item.building}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all ${
                  isHighHeat ? 'border-amber-500/40' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm tracking-tight">
                      {item.building}
                    </h4>
                    {item.critical > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {item.critical} Hazard{item.critical > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Open vs Total */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Unresolved Issues</span>
                    <span className={`font-black ${item.open > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {item.open} / {item.total} total
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: item.total > 0 ? `${(item.resolved / item.total) * 100}%` : '0%',
                      }}
                      title="Resolved proportion"
                    ></div>
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{
                        width: item.total > 0 ? `${(item.open / item.total) * 100}%` : '0%',
                      }}
                      title="Open proportion"
                    ></div>
                  </div>

                  {/* Stats list */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Affected Students:</span>
                      <span className="font-bold text-white">{item.affectedSum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Issue Type:</span>
                      <span className="font-semibold text-emerald-300">{item.topCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Heat Index: {item.heatScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectBuilding(item.building)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    Inspect Zone <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Matrix */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Campus Incident Distribution by System Category
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryStats.map(([catKey, data]) => {
              const meta = CATEGORY_LABELS[catKey as keyof typeof CATEGORY_LABELS];
              if (!meta) return null;

              return (
                <div key={catKey} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{meta.label}</span>
                    <span className="text-xs font-bold text-emerald-400">{data.total} logged</span>
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-slate-400">
                    <span>Active: <strong className="text-amber-300">{data.open}</strong></span>
                    <span>Students Affected: <strong className="text-white">{data.affected}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
