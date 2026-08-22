import React, { useState } from 'react';
import { 
  AlertOctagon, Plus, Filter, Search, Clock, 
  ArrowUpRight, User, MapPin, Building, CheckCircle2, 
  Network, AlertTriangle, ShieldAlert 
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { Incident, IncidentPriority, IncidentStatus } from '../../types';

interface IncidentCommandCenterProps {
  onOpenIncidentDetail: (id: string) => void;
  onOpenTransferModal: () => void;
}

export const IncidentCommandCenter: React.FC<IncidentCommandCenterProps> = ({
  onOpenIncidentDetail,
  onOpenTransferModal,
}) => {
  const { incidents, triggerSupplierDelayDemo } = useRealtime();
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incident_number.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <AlertOctagon className="h-3.5 w-3.5" />
              Realtime SLA & Blocker Management
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">{incidents.length} Registered Events</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Incident Command Matrix
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={triggerSupplierDelayDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Simulate Supplier Delay</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident number, title..."
            className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                priorityFilter === p
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Dropdown/Pills */}
        <div className="flex items-center gap-1.5">
          {['ALL', 'ACTION_REQUIRED', 'INVESTIGATING', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                statusFilter === st
                  ? 'bg-neutral-800 text-white font-bold border border-white/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Incidents Cards Grid */}
      <div className="space-y-3">
        {filteredIncidents.map(inc => {
          const isCritical = inc.priority === 'CRITICAL';
          const isResolved = inc.status === 'RESOLVED';

          return (
            <div
              key={inc.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-200 ${
                isCritical && !isResolved
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-neutral-900/90 to-neutral-900 shadow-xl shadow-rose-950/20'
                  : isResolved
                  ? 'border-emerald-500/20 bg-neutral-900/40 opacity-80'
                  : 'border-white/10 bg-neutral-900/70 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Incident Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isCritical ? 'bg-rose-500 text-neutral-950 font-bold animate-pulse' :
                      inc.priority === 'HIGH' ? 'bg-amber-500 text-neutral-950 font-bold' :
                      'bg-neutral-800 text-neutral-300'
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">
                      {inc.incident_number}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      • {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                      isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-neutral-300 line-clamp-2 max-w-3xl">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      Pune Assembly Facility
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      Lead: {inc.owner?.full_name || 'Aarav Deshmukh'}
                    </span>
                  </div>
                </div>

                {/* Right: Revenue Risk, Affected Orders, & Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block">Affected Orders</span>
                      <span className="text-sm font-bold font-mono text-rose-300">{inc.affected_orders}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block">Revenue At Risk</span>
                      <span className="text-base font-bold font-mono text-white">
                        {inc.revenue_impact > 0 ? `₹${(inc.revenue_impact / 100000).toFixed(1)}L` : '₹0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenIncidentDetail(inc.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                    >
                      <Network className="h-3.5 w-3.5" />
                      <span>Inspect Topology</span>
                    </button>

                    {!isResolved && (
                      <button
                        onClick={onOpenTransferModal}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-xs text-neutral-200 transition-all"
                      >
                        Transfer Stock
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {filteredIncidents.length === 0 && (
          <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 text-neutral-400 text-xs">
            No incidents matching current criteria.
          </div>
        )}
      </div>

    </div>
  );
};
