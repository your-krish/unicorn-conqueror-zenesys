import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, TrendingDown, Activity, AlertCircle, 
  CheckCircle2, ArrowRight, RefreshCw, Filter, ShieldAlert,
  Layers, Lightbulb, Compass, Zap
} from 'lucide-react';
import { useAiAnalytics } from '../../context/AiAnalyticsContext';
import { AiBusinessInsight, InsightImpact, InsightType } from '../../types/ai';

interface AiBusinessInsightsViewProps {
  compact?: boolean;
}

export const AiBusinessInsightsView: React.FC<AiBusinessInsightsViewProps> = ({ compact = false }) => {
  const { analysis, loading, refreshAnalysis, setHighlightedElementId } = useAiAnalytics();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');

  const insights = analysis?.insights || [];

  const filteredInsights = insights.filter(ins => {
    if (selectedType !== 'ALL' && ins.type !== selectedType) return false;
    if (selectedImpact !== 'ALL' && ins.impact_level !== selectedImpact) return false;
    return true;
  });

  const getImpactBadge = (impact: InsightImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            <ShieldAlert className="h-3 w-3" />
            HIGH IMPACT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <AlertCircle className="h-3 w-3" />
            MEDIUM IMPACT
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            <Activity className="h-3 w-3" />
            LOW IMPACT
          </span>
        );
    }
  };

  const getTypeIcon = (type: InsightType) => {
    switch (type) {
      case 'POSITIVE_TREND':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'NEGATIVE_TREND':
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      case 'KPI_CHANGE':
        return <Activity className="h-4 w-4 text-amber-500" />;
      case 'PERFORMANCE_SHIFT':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'BUSINESS_PATTERN':
        return <Compass className="h-4 w-4 text-cyan-500" />;
    }
  };

  const formatTypeName = (type: InsightType) => {
    switch (type) {
      case 'POSITIVE_TREND':
        return 'Positive Trend';
      case 'NEGATIVE_TREND':
        return 'Negative Trend';
      case 'KPI_CHANGE':
        return 'KPI Variance';
      case 'PERFORMANCE_SHIFT':
        return 'Performance Shift';
      case 'BUSINESS_PATTERN':
        return 'Operational Pattern';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                AI Business Insights
              </h2>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Gemini Operations Intelligence
              </span>
            </div>
            <p className="text-xs text-[var(--text-metadata)] mt-0.5">
              Automated pattern discovery, root cause causality, and actionable executive recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAnalysis()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Operations...' : 'Generate / Refresh Insights'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Only if not compact) */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-metadata)] flex items-center gap-1.5 mr-2">
              <Filter className="h-3.5 w-3.5" /> Filter by Type:
            </span>
            {['ALL', 'POSITIVE_TREND', 'NEGATIVE_TREND', 'KPI_CHANGE', 'PERFORMANCE_SHIFT'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedType === t
                    ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] shadow-sm'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                }`}
              >
                {t === 'ALL' ? 'All Types' : formatTypeName(t as InsightType)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-[var(--text-metadata)] mr-1">Impact:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedImpact(lvl)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  selectedImpact === lvl
                    ? 'bg-emerald-500 text-neutral-950'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-metadata)] border border-[var(--border-subtle)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 animate-pulse">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Synthesizing Operational Business Insights
          </h3>
          <p className="text-xs text-[var(--text-metadata)] max-w-md mx-auto">
            Gemini is evaluating real-time cross-facility inventories, delayed PO milestones, SLA breach timers, and efficiency ratios...
          </p>
        </div>
      )}

      {/* Insight Cards Grid */}
      {!loading && filteredInsights.length === 0 && (
        <div className="p-10 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <Layers className="h-8 w-8 text-[var(--text-metadata)] mx-auto mb-2 opacity-50" />
          <p className="text-sm text-[var(--text-secondary)]">No insights match the selected filter criteria.</p>
        </div>
      )}

      {!loading && filteredInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInsights.map(insight => (
            <div
              key={insight.id}
              className="flex flex-col justify-between p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all shadow-sm group"
            >
              <div className="space-y-3.5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                      {getTypeIcon(insight.type)}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-metadata)] uppercase font-semibold">
                      {formatTypeName(insight.type)}
                    </span>
                    {insight.department_code && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-500/10 text-[var(--text-secondary)] border border-neutral-500/20">
                        {insight.department_code}
                      </span>
                    )}
                  </div>
                  {getImpactBadge(insight.impact_level)}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-emerald-500 transition-colors">
                  {insight.title}
                </h3>

                {/* Explanation */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {insight.explanation}
                </p>

                {/* Relevant Metric / Grounded Data */}
                <div className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                    Grounded Operations Metric:
                  </span>
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {insight.relevant_metric}
                  </div>
                </div>

                {/* Possible Causes */}
                {insight.possible_causes && insight.possible_causes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                      Contributing Root Causes:
                    </span>
                    <ul className="space-y-1">
                      {insight.possible_causes.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Action */}
              <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Recommended Action:
                </div>
                <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/15">
                  {insight.recommended_action}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
