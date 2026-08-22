import React, { useState } from 'react';
import { 
  Building2, FileText, Truck, Warehouse, Boxes, 
  ShoppingBag, DollarSign, ArrowRight, ShieldAlert
} from 'lucide-react';
import { IncidentDependencyGraph, DependencyNode } from '../../types';

interface DependencyGraphProps {
  graph: IncidentDependencyGraph;
  onSelectNode?: (node: DependencyNode) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ graph, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-sup');

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId) || graph.nodes[0];

  const getNodeIcon = (type: DependencyNode['type']) => {
    switch (type) {
      case 'SUPPLIER': return Building2;
      case 'PURCHASE_ORDER': return FileText;
      case 'DELIVERY': return Truck;
      case 'WAREHOUSE': return Warehouse;
      case 'INVENTORY': return Boxes;
      case 'SALES_ORDERS': return ShoppingBag;
      case 'REVENUE': return DollarSign;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Topology Header Summary */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase">
            <ShieldAlert className="h-4 w-4" />
            <span>Relational Supply Chain Dependency Trace</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 font-editorial">
            Root Cause Impact Map: {graph.summary.source_supplier} → {graph.summary.target_warehouse}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-right">
            <span className="text-[10px] text-[var(--text-metadata)] uppercase font-mono block">Delay Exposure</span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">+{graph.summary.delay_hours} Hours</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-right">
            <span className="text-[10px] text-rose-600 dark:text-rose-300 uppercase font-mono block font-medium">Revenue At Risk</span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">₹{(graph.summary.revenue_at_risk / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* Interactive Node Flow Diagram */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto shadow-sm">
        <div className="min-w-[850px] flex items-center justify-between gap-2 py-3">
          {graph.nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNodeId === node.id;
            const isCritical = node.status === 'CRITICAL';
            const isWarning = node.status === 'WARNING';

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <button
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    onSelectNode?.(node);
                  }}
                  className={`flex-1 min-w-[115px] p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10 scale-105'
                      : isCritical
                      ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-hairline)] hover:border-emerald-500/40'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <span className={`absolute top-2.5 right-2.5 h-2 w-2 rounded-full ${
                    isCritical ? 'bg-rose-500 animate-pulse' :
                    isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${
                      isCritical ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300' :
                      isWarning ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 
                      'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-hairline)]'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="text-[10px] font-mono uppercase text-[var(--text-metadata)] tracking-wider">
                    {node.type.replace('_', ' ')}
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate mt-1">
                    {node.metric || node.sublabel}
                  </div>
                </button>

                {/* Arrow Connector */}
                {index < graph.nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
                    <ArrowRight className={`h-4 w-4 ${
                      isCritical ? 'text-rose-500' : 'text-[var(--text-metadata)]'
                    }`} />
                    <span className="text-[9px] font-mono text-[var(--text-metadata)] mt-1 whitespace-nowrap hidden xl:block">
                      {graph.edges[index]?.label}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer / Card */}
      {selectedNode && (
        <div className="p-5 rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-3 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                {selectedNode.type}
              </span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{selectedNode.label}</h4>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              selectedNode.status === 'CRITICAL' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
              selectedNode.status === 'WARNING' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}>
              Status: {selectedNode.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
              <span className="text-[var(--text-metadata)] text-[10px] uppercase font-mono block">Primary Condition</span>
              <span className="text-[var(--text-primary)] font-medium mt-1 block">{selectedNode.sublabel}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
              <span className="text-[var(--text-metadata)] text-[10px] uppercase font-mono block">Key Metric</span>
              <span className="text-[var(--text-primary)] font-mono font-bold mt-1 block">{selectedNode.metric || 'N/A'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
              <span className="text-[var(--text-metadata)] text-[10px] uppercase font-mono block">Metadata Details</span>
              <div className="text-[var(--text-muted)] font-mono text-[11px] mt-1 truncate">
                {JSON.stringify(selectedNode.meta)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
