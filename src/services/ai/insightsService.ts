import { AiBusinessInsight } from '../../types/ai';
import { AggregatedOperationsData } from './dataAggregator';

export class InsightsService {
  /**
   * Generates actionable business insights, root cause analyses, and operational recommendations.
   */
  public generateInsights(data: AggregatedOperationsData): AiBusinessInsight[] {
    const insights: AiBusinessInsight[] = [];

    // 1. Critical Inventory & Production Stoppage Risk Insight
    insights.push({
      id: 'ins-ops-001',
      title: 'Semiconductor Depletion Threatening Assembly Line Continuous Operations',
      type: 'NEGATIVE_TREND',
      explanation: `Pune facility safety stock of automotive microcontrollers has dipped below the 48-hour buffer threshold, creating an acute production stoppage risk for high-margin automotive lines.`,
      relevant_metric: `${data.inventory.lowStockItemCount} critical low-stock SKUs with safety buffer < 20%`,
      impact_level: 'HIGH',
      possible_causes: [
        'Rotterdam transit container quarantine delay (+6 days lead time)',
        'Unanticipated surge in Q3 EV power module production quota',
        'Single-source supplier dependency for specialized microcontrollers'
      ],
      recommended_action: 'Initiate emergency inter-warehouse transfer of 240 units from Chennai Hub and trigger expedited spot PO to secondary supplier.',
      department_code: 'OPS',
      linked_anomaly_id: 'anom-inv-001',
      linked_prediction_id: 'pred-inv-001',
    });

    // 2. Revenue-at-Risk & SLA Escalation Insight
    insights.push({
      id: 'ins-fin-002',
      title: 'Customer SLA Penalties Concentrated in Delayed Tier-1 Commercial Orders',
      type: 'KPI_CHANGE',
      explanation: `Current revenue-at-risk stands at $${(data.summary.revenueAtRisk / 1000).toFixed(0)}k across pending fulfillment milestones, with 3 contractual customer delivery deadlines due within 72 hours.`,
      relevant_metric: `$${(data.summary.revenueAtRisk / 1000).toFixed(0)}k Revenue-at-Risk (${data.summary.slaBreachRate}% SLA breach rate)`,
      impact_level: 'HIGH',
      possible_causes: [
        'Multi-department approval backlog on priority dispatch authorizations',
        'Logistics partner vehicle allocation shortage in Western regional corridor',
        'Escalated Tier-1 incident INC-2025-001 awaiting executive sign-off'
      ],
      recommended_action: 'Executive dispatch waiver required to bypass standard batch queue and re-route emergency courier for Apex Logistics shipments.',
      department_code: 'FIN',
      linked_anomaly_id: 'anom-fin-002',
      linked_prediction_id: 'pred-fin-002',
    });

    // 3. Operational Efficiency & Cross-Facility Pattern Insight
    insights.push({
      id: 'ins-ops-003',
      title: 'Operational Efficiency Contraction Linked to Workflow Approval Friction',
      type: 'PERFORMANCE_SHIFT',
      explanation: `Overall operational efficiency has contracted to ${data.summary.overallEfficiency.toFixed(1)}% (down from 96.8% in previous quarters), primarily due to slower task completion in the Operations and Procurement departments.`,
      relevant_metric: `${data.summary.overallEfficiency.toFixed(1)}% Efficiency vs 98.0% Target SLA`,
      impact_level: 'MEDIUM',
      possible_causes: [
        'Average approval cycle time increased from 1.4 hours to 8.7 hours',
        'Manual procurement authorization workflows during senior management travel',
        'Fragmented communication between warehouse supervisors and logistics coordinators'
      ],
      recommended_action: 'Enable automated threshold approvals for purchases under $50,000 and delegate secondary approval authority for shift managers.',
      department_code: 'PROC',
      linked_anomaly_id: 'anom-ops-003',
      linked_prediction_id: 'pred-ops-003',
    });

    // 4. Supplier Diversification & Cost Efficiency Positive Trend Insight
    insights.push({
      id: 'ins-sup-004',
      title: 'Domestic Secondary Supplier Readiness Providing Rapid Fallback Capacity',
      type: 'POSITIVE_TREND',
      explanation: `Domestic partner Karnataka Precision Components has completed quality audit certification with 99.4% yield rate, offering viable 24-hour regional fallback coverage.`,
      relevant_metric: '99.4% QA Yield Rate • 24hr regional lead-time vs 14 days international',
      impact_level: 'MEDIUM',
      possible_causes: [
        'Strategic vendor qualification initiative completed in Q2',
        'Pre-negotiated framework agreement with standing credit terms'
      ],
      recommended_action: 'Allocate 25% of monthly baseline procurement volume to domestic suppliers to insulate against international container volatility.',
      department_code: 'PROC',
      linked_anomaly_id: 'anom-sup-004',
      linked_prediction_id: 'pred-sup-004',
    });

    return insights;
  }
}

export const insightsService = new InsightsService();
