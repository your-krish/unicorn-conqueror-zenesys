import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, ArrowUpRight, TrendingUp, DollarSign, 
  Boxes, Users, Clock, ArrowRight, CheckCircle2, ChevronRight, 
  MapPin, Shield, Activity, RefreshCw, Network
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { SEED_DEPARTMENTS, SEED_LOCATIONS } from '../../lib/seed-data';

interface ExecutiveDashboardProps {
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenTransferModal: () => void;
  onNavigateTab: (tabName: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onOpenIncidentDetail,
  onOpenTransferModal,
  onNavigateTab,
}) => {
  const { role } = useAuth();
  const { incidents, metrics, auditLogs, inventory, triggerSupplierDelayDemo } = useRealtime();

  // Find the primary critical incident for the hackathon demo
  const criticalIncident = incidents.find(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED');

  // SLA Timer Countdown State (Requirement 19 & 45: Live 02:14:28 SLA countdown!)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 14,
    seconds: 28,
  });

  useEffect(() => {
    if (!criticalIncident) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [criticalIncident]);

  const formatTimer = () => {
    const h = String(timeLeft.hours).padStart(2, '0');
    const m = String(timeLeft.minutes).padStart(2, '0');
    const s = String(timeLeft.seconds).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const revenueAtRiskFormatted = criticalIncident ? '₹8.4L' : '₹0.0';
  const affectedOrders = criticalIncident?.affected_orders || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header with Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Operational Command Matrix
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">PostgreSQL RLS Active</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1 font-editorial">
            Enterprise Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-neutral-400">Session Role</div>
            <div className="text-xs font-semibold text-white font-mono">{role?.name}</div>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-medium transition-all"
          >
            <span>Executive Report</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* CRITICAL INCIDENT HIGHLIGHT BANNER (Requirement 30, 33, 44, 45) */}
      {criticalIncident ? (
        <div className="relative rounded-2xl glass-panel bg-gradient-to-r from-rose-950/70 via-neutral-900/90 to-amber-950/60 border border-rose-500/40 p-5 sm:p-6 shadow-2xl shadow-rose-950/40 overflow-hidden">
          {/* Background subtle radar effect */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-neutral-950 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-500/30 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 fill-neutral-950" />
                  CRITICAL INCIDENT
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30">
                  {criticalIncident.incident_number}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs font-mono">
                  Pune Warehouse (WH-PUN-01)
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {criticalIncident.title}
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                {criticalIncident.description}
              </p>
            </div>

            {/* Impact Metric Chips & SLA Counter */}
            <div className="flex flex-wrap items-center gap-4 bg-neutral-950/70 p-3.5 rounded-2xl border border-rose-500/30">
              <div className="px-3 py-1 text-center border-r border-white/10">
                <div className="text-[10px] uppercase font-mono text-neutral-400">Affected Orders</div>
                <div className="text-xl font-bold text-rose-300 font-mono-num">{affectedOrders}</div>
              </div>

              <div className="px-3 py-1 text-center border-r border-white/10">
                <div className="text-[10px] uppercase font-mono text-rose-400 font-semibold">Revenue At Risk</div>
                <div className="text-xl font-extrabold text-white font-mono-num">{revenueAtRiskFormatted}</div>
              </div>

              <div className="px-3 py-1 text-center">
                <div className="text-[10px] uppercase font-mono text-amber-400 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> SLA Countdown
                </div>
                <div className="text-xl font-bold text-amber-300 font-mono tracking-wider animate-pulse">
                  {formatTimer()}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-200/80">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Assigned Lead: <strong>Aarav Deshmukh (Operations Manager)</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenIncidentDetail(criticalIncident.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Network className="h-4 w-4" />
                <span>Open Incident & Dependency Graph</span>
              </button>

              <button
                onClick={onOpenTransferModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/20 text-white font-semibold text-xs transition-all"
              >
                <span>Initiate Stock Transfer</span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normalized State Banner */
        <div className="rounded-2xl glass-panel bg-neutral-900/60 border border-emerald-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">All Operational Pipelines Normal</h3>
              <p className="text-xs text-neutral-400">Zero active critical blockers across 5 national logistics facilities.</p>
            </div>
          </div>
          <button
            onClick={triggerSupplierDelayDemo}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium transition-all"
          >
            Simulate Delay Scenario
          </button>
        </div>
      )}

      {/* Primary KPI Grid (Requirement 24, 34, 35) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Enterprise Health Score */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Enterprise Health</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics.enterprise_health}%</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Stable
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.enterprise_health >= 90 ? 'bg-emerald-500' :
                metrics.enterprise_health >= 75 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.enterprise_health}%` }}
            />
          </div>
          <div className="text-[11px] text-neutral-400">
            Calculated across 6 departmental vectors
          </div>
        </div>

        {/* KPI 2: Revenue At Risk */}
        <div className={`glass-panel p-4 rounded-2xl border space-y-3 transition-all ${
          criticalIncident ? 'border-rose-500/40 bg-rose-950/15' : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Revenue At Risk</span>
            <DollarSign className={`h-4 w-4 ${criticalIncident ? 'text-rose-400' : 'text-neutral-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${
              criticalIncident ? 'text-rose-300' : 'text-white'
            }`}>
              {revenueAtRiskFormatted}
            </span>
            {criticalIncident && (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                243 Orders
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-400">
            Direct customer order delivery exposure
          </div>
        </div>

        {/* KPI 3: Inventory Capacity & Health */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Inventory Health</span>
            <Boxes className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics.inventory_health}%</span>
            <span className="text-xs font-mono text-neutral-400">128.4k Units</span>
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Buffer Threshold: <strong>Optimal</strong></span>
            <span className="text-amber-400">1 Warning</span>
          </div>
        </div>

        {/* KPI 4: Workforce Availability */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Workforce Availability</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics.workforce_availability}%</span>
            <span className="text-xs font-mono text-cyan-400">48 / 50 Active</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Across 5 operational locations
          </div>
        </div>

      </div>

      {/* Two-Column Layout: Department Health Matrix + Operational Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Departmental Governance Matrix */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Departmental Health Grid
              </h3>
              <p className="text-xs text-neutral-400">Real-time status calculated from relational operational events</p>
            </div>
            <button 
              onClick={() => onNavigateTab('incidents')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>View Incidents</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SEED_DEPARTMENTS.map(dept => {
              const isAlert = dept.health_score < 75;
              return (
                <div 
                  key={dept.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isAlert 
                      ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30' 
                      : 'bg-neutral-900/60 border-white/5 hover:bg-neutral-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-semibold">
                      {dept.code}
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      dept.health_score >= 90 ? 'text-emerald-400' :
                      dept.health_score >= 75 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {dept.health_score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-2 truncate">
                    {dept.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Budget: ₹{(dept.budget / 10000000).toFixed(1)} Cr
                  </div>
                </div>
              );
            })}
          </div>

          {/* Realtime Audit Event Stream Mini */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Recent System Actions (Audit Stream)</span>
              <button onClick={() => onNavigateTab('audit')} className="text-amber-400 hover:underline">
                Full Audit Trail
              </button>
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/40 text-xs border border-white/5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-[9px] text-neutral-300">
                      {log.action}
                    </span>
                    <span className="text-neutral-300 truncate">
                      {log.entity_type} {log.entity_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Key Strategic Facilities / Locations (Requirement 9) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Facilities & Hubs
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">5 Active</span>
          </div>

          <div className="space-y-2.5">
            {SEED_LOCATIONS.map(loc => {
              const isCrit = loc.id === 'loc-pune-wh' && criticalIncident;
              return (
                <div
                  key={loc.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isCrit 
                      ? 'bg-rose-950/30 border-rose-500/40' 
                      : 'bg-neutral-900/60 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white truncate">{loc.name}</div>
                      <div className="text-[11px] text-neutral-400">{loc.city} • {loc.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      isCrit ? 'bg-rose-500 text-neutral-950 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {isCrit ? 'CRITICAL RISK' : 'OPERATIONAL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                    <span>Capacity: {loc.capacity.toLocaleString()} sq.ft</span>
                    <span className="font-mono">{loc.latitude.toFixed(2)}° N, {loc.longitude.toFixed(2)}° E</span>
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
