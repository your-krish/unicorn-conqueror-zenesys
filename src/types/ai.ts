export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InsightImpact = 'LOW' | 'MEDIUM' | 'HIGH';
export type InsightType = 'POSITIVE_TREND' | 'NEGATIVE_TREND' | 'KPI_CHANGE' | 'PERFORMANCE_SHIFT' | 'BUSINESS_PATTERN';
export type PredictionTrend = 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'CRITICAL_RISK';

export interface AiAnomaly {
  id: string;
  metric: string;
  category: 'INVENTORY' | 'FINANCIAL' | 'SUPPLY_CHAIN' | 'OPERATIONS' | 'WORKFORCE';
  current_value: string;
  expected_value: string;
  difference: string;
  severity: AnomalySeverity;
  explanation: string;
  detected_at: string;
  linked_insight_id?: string;
  linked_prediction_id?: string;
}

export interface AiBusinessInsight {
  id: string;
  title: string;
  type: InsightType;
  explanation: string;
  relevant_metric: string;
  impact_level: InsightImpact;
  possible_causes: string[];
  recommended_action: string;
  department_code?: string;
  linked_anomaly_id?: string;
  linked_prediction_id?: string;
}

export interface PredictionDataPoint {
  period: string;
  value: number;
  isProjected?: boolean;
  lowerBound?: number;
  upperBound?: number;
}

export interface AiPrediction {
  id: string;
  metric: string;
  category: 'KPI' | 'REVENUE' | 'FULFILLMENT' | 'SUPPLY_CHAIN' | 'WORKFORCE' | 'OPERATIONS';
  current_value: string;
  predicted_value: string;
  prediction_period: string;
  confidence_level: number; // 0 to 100
  trend_direction: PredictionTrend;
  explanation: string;
  reason: string;
  historical_trend: PredictionDataPoint[];
  insufficient_data?: boolean;
  linked_insight_id?: string;
}

export interface AiConnectedChain {
  id: string;
  title: string;
  anomaly_id: string;
  insight_id: string;
  prediction_id: string;
  summary: string;
  urgency: 'IMMEDIATE_ACTION' | 'HIGH_PRIORITY' | 'MONITOR';
}

export interface AiAnalysisResult {
  anomalies: AiAnomaly[];
  insights: AiBusinessInsight[];
  predictions: AiPrediction[];
  connected_chains: AiConnectedChain[];
  executive_summary: string;
  model_used: string;
  analyzed_at: string;
}
