import React, { useState } from 'react';
import { 
  Sparkles, Lightbulb, TrendingUp, AlertOctagon, RefreshCw, 
  Layers, ShieldAlert, Cpu, Download, Zap, Compass, CheckCircle2
} from 'lucide-react';
import { useAiAnalytics } from '../../context/AiAnalyticsContext';
import { useRealtime } from '../../context/RealtimeContext';
import { AiBusinessInsightsView } from './AiBusinessInsightsView';
import { AiPredictiveAnalyticsView } from './AiPredictiveAnalyticsView';
import { AiAnomalyDetectionView } from './AiAnomalyDetectionView';
import { AiConnectedPipelineView } from './AiConnectedPipelineView';

type AiSubTab = 'overview' | 'insights' | 'predictions' | 'anomalies';

export const AiAnalyticsCenter: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AiSubTab>('overview');
  const { analysis, loading, lastUpdated, refreshAnalysis } = useAiAnalytics();
  const { triggerSupplierDelayDemo } = useRealtime();

  const handleSimulateDisruption = () => {
    triggerSupplierDelayDemo();
    setTimeout(() => {
      refreshAnalysis();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top AI Suite Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                AI Operations Intelligence Suite
              </h1>
              <p className="text-xs text-[var(--text-metadata)]">
                Real-time operational reasoning, empirical anomaly isolation, and horizon forecasting powered by Gemini.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-[var(--text-metadata)] px-2.5 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              Last Evaluated: {lastUpdated}
            </span>
          )}

          <button
            onClick={handleSimulateDisruption}
            title="Inject real-time Rotterdam logistics delay & semiconductor stock drop to test live AI adaptation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Live Disruption</span>
          </button>

          <button
            onClick={() => refreshAnalysis()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Re-run Full Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Executive Synthesis & Causal Triad</span>
        </button>

        <button
          onClick={() => setActiveSubTab('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'insights'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span>1. AI Business Insights</span>
          {analysis && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'insights' ? 'bg-neutral-950 text-emerald-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}>
              {analysis.insights.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('predictions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'predictions'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>2. AI Predictive Analytics</span>
          {analysis && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'predictions' ? 'bg-neutral-950 text-emerald-400' : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
            }`}>
              {analysis.predictions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('anomalies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'anomalies'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          <span>3. AI Anomaly Detection</span>
          {analysis && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'anomalies' ? 'bg-neutral-950 text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}>
              {analysis.anomalies.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div>
        {activeSubTab === 'overview' && (
          <AiConnectedPipelineView onNavigateSubTab={(tab) => setActiveSubTab(tab)} />
        )}

        {activeSubTab === 'insights' && (
          <AiBusinessInsightsView />
        )}

        {activeSubTab === 'predictions' && (
          <AiPredictiveAnalyticsView />
        )}

        {activeSubTab === 'anomalies' && (
          <AiAnomalyDetectionView />
        )}
      </div>
    </div>
  );
};
