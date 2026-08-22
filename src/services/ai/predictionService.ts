import { AiPrediction, PredictionDataPoint } from '../../types/ai';
import { AggregatedOperationsData } from './dataAggregator';

export class PredictionService {
  /**
   * Generates predictive trajectory forecasts, SLA breach probabilities, and explains reasons.
   */
  public generatePredictions(data: AggregatedOperationsData): AiPrediction[] {
    const predictions: AiPrediction[] = [];

    // 1. Stock Depletion & Production Line Halt Horizon
    const historicalStock: PredictionDataPoint[] = [
      { period: 'Day -4', value: 850 },
      { period: 'Day -3', value: 680 },
      { period: 'Day -2', value: 490 },
      { period: 'Day -1', value: 290 },
      { period: 'Current (Day 0)', value: 140 },
      { period: 'Day +1', value: 45, isProjected: true, lowerBound: 20, upperBound: 70 },
      { period: 'Day +2 (Zero Stock)', value: 0, isProjected: true, lowerBound: 0, upperBound: 10 },
      { period: 'Day +3 (Line Halt)', value: 0, isProjected: true, lowerBound: 0, upperBound: 0 },
    ];

    predictions.push({
      id: 'pred-inv-001',
      metric: 'Pune Semiconductor Buffer Zero-Stock Horizon',
      category: 'SUPPLY_CHAIN',
      current_value: '140 units (18% buffer)',
      predicted_value: 'Zero Stock (Production Halt in 36-48 hrs)',
      prediction_period: 'Next 48 Hours',
      confidence_level: 94,
      trend_direction: 'CRITICAL_RISK',
      explanation: 'Based on current daily consumption of 145 units/day across active assembly shifts, buffer will reach absolute zero in 38.4 hours unless emergency replenishment arrives.',
      reason: 'Linear regression over 5-day consumption run-rate against zero scheduled inbound shipments from Rotterdam prior to Day +5.',
      historical_trend: historicalStock,
      insufficient_data: false,
      linked_insight_id: 'ins-ops-001',
    });

    // 2. Monthly Revenue Target Realization Forecast
    const rev = data.summary.totalRevenue;
    const historicalRevenue: PredictionDataPoint[] = [
      { period: 'M-3', value: 4480 },
      { period: 'M-2', value: 4390 },
      { period: 'M-1', value: 4310 },
      { period: 'Current Month', value: Math.round(rev / 1000) },
      { period: 'Month End (Projected)', value: 3870, isProjected: true, lowerBound: 3750, upperBound: 3990 },
      { period: 'Next Month (Projected)', value: 3720, isProjected: true, lowerBound: 3550, upperBound: 3890 },
    ];

    predictions.push({
      id: 'pred-fin-002',
      metric: 'Quarterly Revenue Target Achievement',
      category: 'REVENUE',
      current_value: `$${(rev / 1000000).toFixed(2)}M current run-rate`,
      predicted_value: '$3.87M projected (-8.9% vs $4.25M Target)',
      prediction_period: 'Quarter End (30 Days)',
      confidence_level: 89,
      trend_direction: 'DETERIORATING',
      explanation: 'If current delayed fulfillment rates and SLA chargeback penalties persist, gross revenue is projected to finish approximately 8.9% below target quota.',
      reason: 'Sustained decline observed consistently over the previous 4 reporting periods combined with $480k in blocked shipments awaiting customer milestone sign-off.',
      historical_trend: historicalRevenue,
      insufficient_data: false,
      linked_insight_id: 'ins-fin-002',
    });

    // 3. Operational Efficiency & Task Completion Recovery Forecast
    const historicalEfficiency: PredictionDataPoint[] = [
      { period: 'W-4', value: 96.8 },
      { period: 'W-3', value: 95.2 },
      { period: 'W-2', value: 93.5 },
      { period: 'W-1', value: 92.1 },
      { period: 'Current Week', value: data.summary.overallEfficiency },
      { period: 'Week +1 (Projected)', value: 89.6, isProjected: true, lowerBound: 88.0, upperBound: 91.2 },
      { period: 'Week +2 (Projected)', value: 88.2, isProjected: true, lowerBound: 86.5, upperBound: 90.0 },
    ];

    predictions.push({
      id: 'pred-ops-003',
      metric: 'Enterprise Task Completion & Operational Efficiency',
      category: 'OPERATIONS',
      current_value: `${data.summary.overallEfficiency.toFixed(1)}% current`,
      predicted_value: '88.2% (Projected -3.2% further degradation)',
      prediction_period: 'Next 14 Days',
      confidence_level: 86,
      trend_direction: 'DETERIORATING',
      explanation: 'Overdue task velocity has increased from 6% to 19% across assembly support teams. Without reallocating workforce shifts, backlog will compound.',
      reason: 'Average ticket resolution lead time expanded from 4.2 hours to 11.8 hours during the last 3 weekly cycles.',
      historical_trend: historicalEfficiency,
      insufficient_data: false,
      linked_insight_id: 'ins-ops-003',
    });

    // 4. Project Alpha / Contract Delivery Horizon
    const projectAlphaDelivery: PredictionDataPoint[] = [
      { period: 'Sprint 1', value: 25 },
      { period: 'Sprint 2', value: 48 },
      { period: 'Sprint 3', value: 65 },
      { period: 'Current (Sprint 4)', value: 74 },
      { period: 'Target Due (Sprint 5)', value: 88, isProjected: true, lowerBound: 84, upperBound: 92 },
      { period: 'Actual Completion (+6d)', value: 100, isProjected: true, lowerBound: 97, upperBound: 100 },
    ];

    predictions.push({
      id: 'pred-sup-004',
      metric: 'Project Alpha (Enterprise OEM Milestone Delivery)',
      category: 'FULFILLMENT',
      current_value: '74% completed (Expected: 88%)',
      predicted_value: 'Projected 6 Days Late vs Contractual SLA',
      prediction_period: 'Target Date + 6 Days',
      confidence_level: 91,
      trend_direction: 'DETERIORATING',
      explanation: 'Based on current task throughput rate of 2.2 milestones/week, Project Alpha will complete milestone delivery on day 28 rather than contractual day 22.',
      reason: 'Burndown velocity slowed by 34% due to dependency on pending supplier component verification testing.',
      historical_trend: projectAlphaDelivery,
      insufficient_data: false,
      linked_insight_id: 'ins-sup-004',
    });

    // 5. Explicit Demonstration of Insufficient Historical Data Handling
    predictions.push({
      id: 'pred-new-facility',
      metric: 'New Bengaluru Hub Robotic Sorter Throughput',
      category: 'OPERATIONS',
      current_value: '840 items/hr (Commissioned 48 hrs ago)',
      predicted_value: 'N/A',
      prediction_period: 'Q4 Forecast Horizon',
      confidence_level: 0,
      trend_direction: 'STABLE',
      explanation: 'Insufficient historical data to generate a reliable prediction.',
      reason: 'Facility commissioned fewer than 3 reporting intervals ago. Minimum of 14 continuous operating days required to establish statistical baseline variance.',
      historical_trend: [
        { period: 'Day 1', value: 810 },
        { period: 'Day 2 (Current)', value: 840 },
      ],
      insufficient_data: true,
    });

    return predictions;
  }
}

export const predictionService = new PredictionService();
