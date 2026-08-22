import React, { useState } from 'react';
import { 
  AlertOctagon, Search, User, MapPin, 
  Network, AlertTriangle 
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-rose-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <AlertOctagon className="h-3.5 w-3.5" />
              Realtime SLA & Blocker Management
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">{incidents.length} Registered Events</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Incident Command Matrix
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={triggerSupplierDelayDemo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>Simulate Supplier Delay</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="spotlight-card p-4 rounded-3xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[var(--text-metadata)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident number, title..."
            className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-metadata)] focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                priorityFilter === p
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          {['ALL', 'ACTION_REQUIRED', 'INVESTIGATING', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Incidents Cards Grid */}
      <div className="space-y-4">
        {filteredIncidents.map(inc => {
          const isCritical = inc.priority === 'CRITICAL';
          const isResolved = inc.status === 'RESOLVED';

          return (
            <div
              key={inc.id}
              className={`spotlight-card rounded-3xl p-6 transition-all duration-200 shadow-sm ${
                isCritical && !isResolved
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/25 via-[var(--bg-surface)] to-[var(--bg-surface)]'
                  : isResolved
                  ? 'border-emerald-500/30 opacity-85'
                  : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Incident Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isCritical ? 'bg-rose-500 text-white font-bold animate-pulse' :
                      inc.priority === 'HIGH' ? 'bg-amber-500 text-neutral-950 font-bold' :
                      'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]'
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                      {inc.incident_number}
                    </span>
                    <span className="text-[11px] text-[var(--text-metadata)] font-mono">
                      • {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                      isResolved ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 max-w-3xl leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-metadata)] pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      Pune Assembly Facility
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[var(--text-metadata)]" />
                      Lead: {inc.owner?.full_name || 'Aarav Deshmukh'}
                    </span>
                  </div>
                </div>

                {/* Right: Revenue Risk, Affected Orders, & Action Buttons */}
                <div className="flex flex-wrap items-center gap-5 lg:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-[var(--border-hairline)]">
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-metadata)] uppercase block">Affected Orders</span>
                      <span className="text-sm font-bold font-mono text-rose-500 dark:text-rose-400">{inc.affected_orders}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-metadata)] uppercase block">Revenue At Risk</span>
                      <span className="text-base font-bold font-mono text-[var(--text-primary)]">
                        {inc.revenue_impact > 0 ? `₹${(inc.revenue_impact / 100000).toFixed(1)}L` : '₹0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenIncidentDetail(inc.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Network className="h-3.5 w-3.5" />
                      <span>Inspect Topology</span>
                    </button>

                    {!isResolved && (
                      <button
                        onClick={onOpenTransferModal}
                        className="px-3.5 py-2 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-emerald-500 hover:text-neutral-950 border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] font-semibold transition-all cursor-pointer"
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
          <div className="p-8 text-center spotlight-card rounded-3xl text-[var(--text-muted)] text-xs">
            No incidents matching current criteria.
          </div>
        )}
      </div>

    </div>
  );
};
