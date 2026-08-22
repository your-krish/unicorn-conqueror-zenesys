import React, { useState } from 'react';
import { 
  AlertOctagon, AlertTriangle, ShieldAlert, Activity, RefreshCw,
  Filter, CheckCircle2, ArrowRight, ArrowUpRight, ArrowDownRight,
  TrendingDown, DollarSign, Boxes, Clock, Network
} from 'lucide-react';
import { useAiAnalytics } from '../../context/AiAnalyticsContext';
import { AiAnomaly, AnomalySeverity } from '../../types/ai';

export const AiAnomalyDetectionView: React.FC = () => {
  const { analysis, loading, refreshAnalysis } = useAiAnalytics();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const anomalies = analysis?.anomalies || [];

  const filteredAnomalies = anomalies.filter(anom => {
    if (selectedSeverity !== 'ALL' && anom.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse">
            <AlertOctagon className="h-3.5 w-3.5" />
            CRITICAL ANOMALY
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-3.5 w-3.5" />
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            MEDIUM VARIANCE
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Activity className="h-3.5 w-3.5" />
            LOW DEVIATION
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INVENTORY':
        return <Boxes className="h-4 w-4 text-rose-500" />;
      case 'FINANCIAL':
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      case 'OPERATIONS':
        return <Activity className="h-4 w-4 text-cyan-500" />;
      case 'SUPPLY_CHAIN':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Network className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                AI Anomaly & Outlier Detection
              </h2>
              <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Multivariate Baseline Variance
              </span>
            </div>
            <p className="text-xs text-[var(--text-metadata)] mt-0.5">
              Continuous scan isolating statistically abnormal shifts beyond standard operating thresholds.
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshAnalysis()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning Telemetry...' : 'Run Anomaly Scan'}</span>
        </button>
      </div>

      {/* Severity Filter */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-mono text-[var(--text-metadata)] flex items-center gap-1 mr-2">
          <Filter className="h-3.5 w-3.5" /> Severity Filter:
        </span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedSeverity === sev
                ? 'bg-rose-500 text-neutral-950 shadow-sm'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
            }`}
          >
            {sev === 'ALL' ? 'All Anomalies' : sev}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map(anom => (
          <div
            key={anom.id}
            className={`p-6 rounded-3xl bg-[var(--bg-surface)] border transition-all shadow-sm ${
              anom.severity === 'CRITICAL'
                ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-[var(--bg-surface)] to-[var(--bg-surface)]'
                : 'border-[var(--border-subtle)] hover:border-rose-500/30'
            }`}
          >
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                    {getCategoryIcon(anom.category)}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold">
                      {anom.category} VECTOR
                    </span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {anom.metric}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[var(--text-metadata)]">
                    Detected: {new Date(anom.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {getSeverityBadge(anom.severity)}
                </div>
              </div>

              {/* Metric Delta Grid: Current vs Baseline vs Difference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                    Current Observed Value
                  </span>
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                    {anom.current_value}
                  </span>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                    Historical Nominal Baseline
                  </span>
                  <span className="text-sm font-mono font-medium text-[var(--text-secondary)]">
                    {anom.expected_value}
                  </span>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                    Statistical Variance / Delta
                  </span>
                  <span className="text-sm font-mono font-bold text-rose-500 flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    {anom.difference}
                  </span>
                </div>
              </div>

              {/* Possible Explanation */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                  Root Cause Explanation:
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {anom.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
