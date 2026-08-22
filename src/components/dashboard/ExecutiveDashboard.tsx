import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, TrendingUp, DollarSign, 
  Boxes, Users, Clock, ArrowRight, CheckCircle2, ChevronRight, 
  MapPin, Activity, Network
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
  const { incidents, metrics, auditLogs, triggerSupplierDelayDemo } = useRealtime();

  // Find the primary critical incident
  const criticalIncident = incidents.find(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED');

  // SLA Timer Countdown State
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
      
      {/* Top Header with Editorial Precision */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Operational Command Matrix
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">PostgreSQL RLS Active</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Enterprise Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[var(--text-muted)]">Session Role</div>
            <div className="text-xs font-semibold text-[var(--text-primary)] font-mono">{role?.name}</div>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] hover:border-emerald-500/40 text-[var(--text-primary)] text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span>Executive Report</span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
          </button>
        </div>
      </div>

      {/* CRITICAL INCIDENT HIGHLIGHT BANNER */}
      {criticalIncident ? (
        <div className="relative rounded-3xl bg-gradient-to-r from-rose-950/40 via-[var(--bg-surface)] to-amber-950/30 border border-rose-500/30 p-5 sm:p-6 shadow-xl shadow-rose-950/15 overflow-hidden transition-all">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 shadow-md shadow-rose-500/30 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 fill-white" />
                  CRITICAL INCIDENT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-mono border border-rose-500/30">
                  {criticalIncident.incident_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] text-xs font-mono border border-[var(--border-hairline)]">
                  Pune Warehouse (WH-PUN-01)
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {criticalIncident.title}
              </h2>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-3xl leading-relaxed">
                {criticalIncident.description}
              </p>
            </div>

            {/* Impact Metric Chips & SLA Counter */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-surface-elevated)] p-4 rounded-3xl border border-rose-500/20 shadow-inner">
              <div className="px-3 py-1 text-center border-r border-[var(--border-hairline)]">
                <div className="text-[10px] uppercase font-mono text-[var(--text-metadata)] font-semibold">Affected Orders</div>
                <div className="text-xl font-bold text-rose-500 dark:text-rose-400 font-mono-num">{affectedOrders}</div>
              </div>

              <div className="px-3 py-1 text-center border-r border-[var(--border-hairline)]">
                <div className="text-[10px] uppercase font-mono text-rose-500 font-bold">Revenue At Risk</div>
                <div className="text-xl font-extrabold text-[var(--text-primary)] font-mono-num">{revenueAtRiskFormatted}</div>
              </div>

              <div className="px-3 py-1 text-center">
                <div className="text-[10px] uppercase font-mono text-amber-500 font-bold flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> SLA Countdown
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-wider animate-pulse">
                  {formatTimer()}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 pt-4 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Assigned Lead: <strong className="text-[var(--text-primary)]">Aarav Deshmukh (Operations Manager)</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenIncidentDetail(criticalIncident.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Network className="h-4 w-4" />
                <span>Dependency Graph</span>
              </button>

              <button
                onClick={onOpenTransferModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-[var(--text-primary)] font-semibold text-xs transition-all cursor-pointer shadow-sm"
              >
                <span>Stock Transfer Dispatch</span>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normalized State Banner */
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/30 p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">All Operational Pipelines Normal</h3>
              <p className="text-xs text-[var(--text-muted)]">Zero active critical blockers across 5 national logistics facilities.</p>
            </div>
          </div>
          <button
            onClick={triggerSupplierDelayDemo}
            className="px-4 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            Simulate Delay Scenario
          </button>
        </div>
      )}

      {/* Primary KPI Grid with Spotlight Physics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Enterprise Health Score (Emerald) */}
        <div className="spotlight-card p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Enterprise Health</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{metrics.enterprise_health}%</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Stable
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.enterprise_health >= 90 ? 'bg-emerald-500' :
                metrics.enterprise_health >= 75 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.enterprise_health}%` }}
            />
          </div>
          <div className="text-[11px] text-[var(--text-metadata)] font-mono">
            Across 6 departmental vectors
          </div>
        </div>

        {/* KPI 2: Revenue At Risk (Crimson / Neutral) */}
        <div className={`spotlight-card p-5 rounded-3xl space-y-3 transition-all shadow-sm ${
          criticalIncident ? 'border-rose-500/40' : ''
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Revenue At Risk</span>
            <DollarSign className={`h-4 w-4 ${criticalIncident ? 'text-rose-500' : 'text-[var(--text-metadata)]'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${
              criticalIncident ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-primary)]'
            }`}>
              {revenueAtRiskFormatted}
            </span>
            {criticalIncident && (
              <span className="text-xs font-mono text-rose-600 dark:text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                243 Orders
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-metadata)] font-mono">
            Direct customer order delivery exposure
          </div>
        </div>

        {/* KPI 3: Inventory Capacity & Health (Electric Indigo / Blue) */}
        <div className="spotlight-card p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Inventory Health</span>
            <Boxes className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{metrics.inventory_health}%</span>
            <span className="text-xs font-mono text-[var(--text-metadata)]">128.4k Units</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>Buffer Threshold: <strong className="text-emerald-600 dark:text-emerald-400">Optimal</strong></span>
            <span className="text-amber-500 font-mono font-semibold">1 Alert</span>
          </div>
        </div>

        {/* KPI 4: Workforce Availability (Violet AI & Ops) */}
        <div className="spotlight-card p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Workforce Availability</span>
            <Users className="h-4 w-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{metrics.workforce_availability}%</span>
            <span className="text-xs font-mono text-violet-600 dark:text-violet-400 font-bold">48 / 50 Active</span>
          </div>
          <div className="text-[11px] text-[var(--text-metadata)] font-mono">
            Across 5 operational locations
          </div>
        </div>

      </div>

      {/* Two-Column Layout: Department Health Matrix + Operational Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Departmental Governance Matrix */}
        <div className="lg:col-span-2 spotlight-card rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Departmental Health Grid
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Real-time status calculated from operational telemetry</p>
            </div>
            <button 
              onClick={() => onNavigateTab('incidents')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Incidents</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {SEED_DEPARTMENTS.map(dept => {
              const isAlert = dept.health_score < 75;
              return (
                <div 
                  key={dept.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAlert 
                      ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15' 
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-hairline)] hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold border border-[var(--border-hairline)]">
                      {dept.code}
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      dept.health_score >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                      dept.health_score >= 75 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {dept.health_score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-2.5 truncate">
                    {dept.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-metadata)] mt-1 font-mono">
                    Budget: ₹{(dept.budget / 10000000).toFixed(1)} Cr
                  </div>
                </div>
              );
            })}
          </div>

          {/* Realtime Audit Event Stream Mini */}
          <div className="pt-3 border-t border-[var(--border-hairline)]">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Recent System Actions (Audit Stream)</span>
              <button onClick={() => onNavigateTab('audit')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer">
                Full Audit Trail
              </button>
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] text-xs border border-[var(--border-hairline)]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/20">
                      {log.action}
                    </span>
                    <span className="text-[var(--text-primary)] truncate font-medium">
                      {log.entity_type} {log.entity_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-metadata)] font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Key Strategic Facilities / Locations */}
        <div className="spotlight-card rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Facilities & Hubs
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-metadata)]">5 Active</span>
          </div>

          <div className="space-y-3">
            {SEED_LOCATIONS.map(loc => {
              const isCrit = loc.id === 'loc-pune-wh' && criticalIncident;
              return (
                <div
                  key={loc.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    isCrit 
                      ? 'bg-rose-500/10 border-rose-500/30' 
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-hairline)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] truncate">{loc.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{loc.city} • {loc.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      isCrit ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isCrit ? 'CRITICAL RISK' : 'OPERATIONAL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-hairline)] text-[10px] text-[var(--text-metadata)] font-mono">
                    <span>Capacity: {loc.capacity.toLocaleString()} sq.ft</span>
                    <span>{loc.latitude.toFixed(2)}° N, {loc.longitude.toFixed(2)}° E</span>
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
