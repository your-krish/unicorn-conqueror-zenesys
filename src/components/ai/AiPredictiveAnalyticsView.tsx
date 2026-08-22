import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle2, 
  HelpCircle, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2,
  Gauge, Calendar, Sparkles, AlertOctagon
} from 'lucide-react';
import { useAiAnalytics } from '../../context/AiAnalyticsContext';
import { AiPrediction, PredictionTrend } from '../../types/ai';
import { AiPredictionChart } from './AiPredictionChart';

export const AiPredictiveAnalyticsView: React.FC = () => {
  const { analysis, loading, refreshAnalysis } = useAiAnalytics();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const predictions = analysis?.predictions || [];

  const filteredPredictions = predictions.filter(pred => {
    if (selectedCategory !== 'ALL' && pred.category !== selectedCategory) return false;
    return true;
  });

  const getTrendBadge = (trend: PredictionTrend) => {
    switch (trend) {
      case 'CRITICAL_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertOctagon className="h-3 w-3" />
            CRITICAL RISK TRAJECTORY
          </span>
        );
      case 'DETERIORATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <ArrowDownRight className="h-3 w-3" />
            DIVERGING FROM SLA
          </span>
        );
      case 'IMPROVING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <ArrowUpRight className="h-3 w-3" />
            IMPROVING TREND
          </span>
        );
      case 'STABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            <Clock className="h-3 w-3" />
            STABLE BASELINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                AI Predictive Analytics & Horizon Forecasting
              </h2>
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Multi-Horizon Time Series
              </span>
            </div>
            <p className="text-xs text-[var(--text-metadata)] mt-0.5">
              Empirical regression models evaluating stock depletion horizons, revenue achievement, and project milestones.
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshAnalysis()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Simulating Forecasts...' : 'Re-calculate Forecasts'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-mono text-[var(--text-metadata)] mr-2">Category:</span>
        {['ALL', 'SUPPLY_CHAIN', 'REVENUE', 'OPERATIONS', 'FULFILLMENT'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] shadow-sm'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
            }`}
          >
            {cat === 'ALL' ? 'All Projections' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPredictions.map(pred => (
          <div
            key={pred.id}
            className={`flex flex-col justify-between p-6 rounded-3xl bg-[var(--bg-surface)] border transition-all shadow-sm ${
              pred.insufficient_data 
                ? 'border-neutral-500/30 bg-neutral-500/5' 
                : pred.trend_direction === 'CRITICAL_RISK'
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : 'border-[var(--border-subtle)] hover:border-cyan-500/40'
            }`}
          >
            <div className="space-y-4">
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-metadata)]">
                      {pred.category} FORECAST
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-metadata)]">
                      • Horizon: {pred.prediction_period}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {pred.metric}
                  </h3>
                </div>
                {getTrendBadge(pred.trend_direction)}
              </div>

              {/* Distinguish Current Value vs Predicted Value */}
              {!pred.insufficient_data ? (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                      Current Value (T0)
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {pred.current_value}
                    </span>
                  </div>
                  <div className="space-y-0.5 border-l border-[var(--border-subtle)] pl-3">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block">
                      Predicted Horizon Value
                    </span>
                    <span className={`text-sm font-mono font-bold ${
                      pred.trend_direction === 'CRITICAL_RISK' ? 'text-rose-500' : 'text-cyan-500'
                    }`}>
                      {pred.predicted_value}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
                      Insufficient historical data to generate a reliable prediction
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {pred.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Visual Historical -> Current -> Projected Chart */}
              {!pred.insufficient_data && pred.historical_trend && (
                <div className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <AiPredictionChart
                    data={pred.historical_trend}
                    metricName={pred.metric}
                    trendDirection={pred.trend_direction}
                  />
                </div>
              )}

              {/* Confidence Level & Explanation */}
              <div className="space-y-2">
                {!pred.insufficient_data && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-[var(--text-metadata)] flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5" /> Model Confidence:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${pred.confidence_level}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                        {pred.confidence_level}%
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {pred.explanation}
                </p>
              </div>

              {/* Explainable Reason */}
              {!pred.insufficient_data && (
                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)] font-semibold block mb-1">
                    Predictive Causality Reason:
                  </span>
                  <p className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                    {pred.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
