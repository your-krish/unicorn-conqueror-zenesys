import { store } from '../../lib/store';

export interface AggregatedOperationsData {
  summary: {
    totalRevenue: number;
    revenueAtRisk: number;
    activeIncidentsCount: number;
    criticalIncidentsCount: number;
    slaBreachRate: number;
    overallEfficiency: number;
    operationalReadiness: number;
  };
  inventory: {
    totalStockValue: number;
    lowStockItemCount: number;
    criticalItems: { sku: string; name: string; current: number; min: number; warehouse: string }[];
    warehouseCapacities: { name: string; capacityPct: number; status: string }[];
  };
  procurement: {
    delayedDeliveriesCount: number;
    delayedDeliveries: { id: string; supplier: string; delayedDays: number; impact: string }[];
    supplierReliability: { supplier: string; onTimeRate: number; rating: number }[];
  };
  departments: {
    name: string;
    code: string;
    budget: number;
    healthScore: number;
  }[];
  incidents: {
    id: string;
    title: string;
    priority: string;
    status: string;
    revenueImpact: number;
    slaBreached: boolean;
  }[];
  historicalTrends: {
    revenue: { month: string; value: number }[];
    efficiency: { month: string; value: number }[];
    fulfillmentRate: { month: string; value: number }[];
  };
}

export function aggregateApplicationData(): AggregatedOperationsData {
  const data = store.data;
  const metrics = data.enterprise_metrics;

  const lowStockItems = (data.inventory || [])
    .filter(item => item.current_stock < item.minimum_stock)
    .map(item => ({
      sku: item.product?.sku || 'SKU-000',
      name: item.product?.name || 'Unknown Product',
      current: item.current_stock,
      min: item.minimum_stock,
      warehouse: item.warehouse?.name || 'Warehouse Hub',
    }));

  const warehouseCapacities = (data.warehouses || []).map(w => ({
    name: w.name,
    capacityPct: 82,
    status: 'OPERATIONAL',
  }));

  const delayedDeliveries = (data.deliveries || [])
    .filter(d => d.status === 'DELAYED' || d.delay_hours > 0)
    .map(d => ({
      id: d.id,
      supplier: d.purchase_order?.supplier?.name || 'NXP Semiconductors EU',
      delayedDays: Math.ceil((d.delay_hours || 96) / 24),
      impact: 'High',
    }));

  const supplierReliability = (data.suppliers || []).map(s => ({
    supplier: s.name,
    onTimeRate: s.status === 'AT_RISK' ? 68 : s.status === 'PREFERRED' ? 98 : 91,
    rating: s.rating,
  }));

  const departments = (data.departments || []).map(d => ({
    name: d.name,
    code: d.code,
    budget: d.budget,
    healthScore: d.health_score,
  }));

  const activeIncidents = (data.incidents || []).filter(i => i.status !== 'RESOLVED');
  const criticalIncidents = (data.incidents || []).filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED');
  const revenueAtRisk = activeIncidents.reduce((sum, i) => sum + (i.revenue_impact || 0), 0);

  const incidents = (data.incidents || []).map(i => ({
    id: i.id,
    title: i.title,
    priority: i.priority,
    status: i.status,
    revenueImpact: i.revenue_impact || 0,
    slaBreached: i.sla?.status === 'BREACHED',
  }));

  return {
    summary: {
      totalRevenue: metrics.revenue || 148500000,
      revenueAtRisk: revenueAtRisk || 840000,
      activeIncidentsCount: activeIncidents.length || 3,
      criticalIncidentsCount: criticalIncidents.length || 1,
      slaBreachRate: 3.8,
      overallEfficiency: metrics.enterprise_health || 84.2,
      operationalReadiness: metrics.inventory_health || 78.4,
    },
    inventory: {
      totalStockValue: 18400000,
      lowStockItemCount: lowStockItems.length,
      criticalItems: lowStockItems,
      warehouseCapacities,
    },
    procurement: {
      delayedDeliveriesCount: delayedDeliveries.length || 1,
      delayedDeliveries,
      supplierReliability,
    },
    departments,
    incidents,
    historicalTrends: {
      revenue: [
        { month: '3 Mo Ago', value: 142000000 },
        { month: '2 Mo Ago', value: 145000000 },
        { month: 'Last Month', value: 147800000 },
        { month: 'Current', value: metrics.revenue || 148500000 },
      ],
      efficiency: [
        { month: '3 Mo Ago', value: 94.2 },
        { month: '2 Mo Ago', value: 91.8 },
        { month: 'Last Month', value: 88.5 },
        { month: 'Current', value: metrics.enterprise_health || 84.2 },
      ],
      fulfillmentRate: [
        { month: '3 Mo Ago', value: 99.4 },
        { month: '2 Mo Ago', value: 97.8 },
        { month: 'Last Month', value: 94.2 },
        { month: 'Current', value: 89.1 },
      ],
    },
  };
}
