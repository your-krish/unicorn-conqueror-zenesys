import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AiAnalysisResult, AiConnectedChain } from '../types/ai';
import { aiService } from '../services/ai/aiService';
import { useRealtime } from './RealtimeContext';

interface AiAnalyticsContextType {
  analysis: AiAnalysisResult | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshAnalysis: () => Promise<void>;
  activeConnectedChain: AiConnectedChain | null;
  setActiveConnectedChain: (chain: AiConnectedChain | null) => void;
  highlightedElementId: string | null;
  setHighlightedElementId: (id: string | null) => void;
}

const AiAnalyticsContext = createContext<AiAnalyticsContextType | undefined>(undefined);

export const AiAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeConnectedChain, setActiveConnectedChain] = useState<AiConnectedChain | null>(null);
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);

  const { incidents, inventory } = useRealtime();

  const performAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.analyzeOperations();
      setAnalysis(result);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (result.connected_chains.length > 0 && !activeConnectedChain) {
        setActiveConnectedChain(result.connected_chains[0]);
      }
    } catch (err: any) {
      console.error('Failed to run AI operations analysis:', err);
      setError(err?.message || 'Failed to complete AI operational intelligence synthesis');
    } finally {
      setLoading(false);
    }
  }, [activeConnectedChain]);

  // Initial load
  useEffect(() => {
    performAnalysis();
  }, []);

  // When major operational incidents or stock changes occur, re-evaluate
  useEffect(() => {
    const timer = setTimeout(() => {
      if (analysis) {
        // Soft refresh when underlying operational telemetry changes
        aiService.analyzeOperations().then(res => {
          setAnalysis(res);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }).catch(() => {});
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [incidents.length, inventory.length]);

  return (
    <AiAnalyticsContext.Provider
      value={{
        analysis,
        loading,
        error,
        lastUpdated,
        refreshAnalysis: performAnalysis,
        activeConnectedChain,
        setActiveConnectedChain,
        highlightedElementId,
        setHighlightedElementId,
      }}
    >
      {children}
    </AiAnalyticsContext.Provider>
  );
};

export const useAiAnalytics = () => {
  const context = useContext(AiAnalyticsContext);
  if (!context) {
    throw new Error('useAiAnalytics must be used within an AiAnalyticsProvider');
  }
  return context;
};
