import React from 'react';
import { 
  AlertOctagon, Lightbulb, TrendingUp, ArrowRight, ShieldAlert, 
  Sparkles, CheckCircle2, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { useAiAnalytics } from '../../context/AiAnalyticsContext';

interface AiConnectedPipelineViewProps {
  onNavigateSubTab?: (tab: 'insights' | 'predictions' | 'anomalies') => void;
}

export const AiConnectedPipelineView: React.FC<AiConnectedPipelineViewProps> = ({
  onNavigateSubTab,
}) => {
  const { analysis, activeConnectedChain, setActiveConnectedChain, loading, refreshAnalysis } = useAiAnalytics();

  if (!analysis) return null;

  const chains = analysis.connected_chains || [];
  const currentChain = activeConnectedChain || chains[0];

  const matchedAnomaly = analysis.anomalies.find(a => a.id === currentChain?.anomaly_id);
  const matchedInsight = analysis.insights.find(i => i.id === currentChain?.insight_id);
  const matchedPrediction = analysis.predictions.find(p => p.id === currentChain?.prediction_id);

  return (
    <div className="space-y-6">
      {/* Executive Briefing Banner */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Connected Operations Intelligence
              </span>
              <span className="text-xs font-mono text-[var(--text-metadata)]">
                Model: {analysis.model_used}
              </span>
            </div>
            <p className="text-xs text-[var(--text-primary)] font-medium max-w-3xl leading-relaxed">
              {analysis.executive_summary}
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshAnalysis()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Re-evaluating...' : 'Refresh Matrix'}</span>
        </button>
      </div>

      {/* Triad Chain Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono uppercase font-bold text-[var(--text-metadata)] flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-500" /> Active Operational Causal Chains:
          </span>
          <span className="text-xs font-mono text-[var(--text-metadata)]">
            Click chain to inspect end-to-end impact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {chains.map(chain => {
            const isSelected = currentChain?.id === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => setActiveConnectedChain(chain)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-[var(--text-primary)] shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-emerald-500/30 text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {chain.urgency.replace('_', ' ')}
                  </span>
                  <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-neutral-400'}`} />
                </div>
                <h4 className="text-xs font-bold line-clamp-1 text-[var(--text-primary)]">
                  {chain.title}
                </h4>
                <p className="text-[11px] text-[var(--text-metadata)] line-clamp-2 mt-1">
                  {chain.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 3-Stage Connected Pipeline Visualizer */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Integrated Operational Triad
            </h3>
            <p className="text-xs text-[var(--text-metadata)]">
              Real-time causal linkage: Empirical Anomaly → Business Root Cause → Predictive Horizon
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-emerald-500">
            Chain ID: {currentChain?.id}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
          {/* STEP 1: ANOMALY */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                  <AlertOctagon className="h-3 w-3" />
                  1. OPERATIONAL ANOMALY
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-500">
                  {matchedAnomaly?.severity || 'CRITICAL'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {matchedAnomaly?.metric || 'Safety Stock Depletion'}
              </h4>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-rose-500/20 space-y-1">
                <span className="text-[9px] font-mono uppercase text-[var(--text-metadata)] block">
                  Observed Variance:
                </span>
                <div className="text-xs font-mono font-bold text-rose-500">
                  {matchedAnomaly?.difference}
                </div>
                <div className="text-[11px] font-mono text-[var(--text-metadata)]">
                  {matchedAnomaly?.current_value} vs {matchedAnomaly?.expected_value}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {matchedAnomaly?.explanation}
              </p>
            </div>

            {onNavigateSubTab && (
              <button
                onClick={() => onNavigateSubTab('anomalies')}
                className="text-xs font-mono font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Full Anomaly Telemetry</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* STEP 2: BUSINESS INSIGHT */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Lightbulb className="h-3 w-3" />
                  2. BUSINESS INSIGHT
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-500">
                  {matchedInsight?.impact_level || 'HIGH'} IMPACT
                </span>
              </div>

              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {matchedInsight?.title}
              </h4>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/20 space-y-1">
                <span className="text-[9px] font-mono uppercase text-[var(--text-metadata)] block">
                  Recommended Action:
                </span>
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {matchedInsight?.recommended_action}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {matchedInsight?.explanation}
              </p>
            </div>

            {onNavigateSubTab && (
              <button
                onClick={() => onNavigateSubTab('insights')}
                className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View All Business Insights</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* STEP 3: PREDICTION */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/30 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  <TrendingUp className="h-3 w-3" />
                  3. PREDICTIVE FORECAST
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-500">
                  {matchedPrediction?.confidence_level || 94}% CONFIDENCE
                </span>
              </div>

              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {matchedPrediction?.metric}
              </h4>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-cyan-500/20 space-y-1">
                <span className="text-[9px] font-mono uppercase text-[var(--text-metadata)] block">
                  Projected Outcome ({matchedPrediction?.prediction_period}):
                </span>
                <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {matchedPrediction?.predicted_value}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {matchedPrediction?.explanation}
              </p>
            </div>

            {onNavigateSubTab && (
              <button
                onClick={() => onNavigateSubTab('predictions')}
                className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Forecast Horizons & Charts</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
