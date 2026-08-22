import React, { useState } from 'react';
import { 
  History, Search, Filter, ShieldCheck, 
  ArrowRight, User, Clock, CheckCircle2, ChevronDown, 
  ChevronRight, Code, Eye, Layers, Sparkles, PlusCircle, 
  Edit3, Trash2, ArrowLeftRight, Check, AlertCircle
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { AuditLog } from '../../types';

// Helper to format field names nicely (e.g., lead_time_days -> Lead Time Days)
function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Helper to format values nicely (e.g., numbers with currency or formatting)
function formatValue(val: any, key: string): string {
  if (val === null || val === undefined) return 'None';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') {
    if (key.includes('price') || key.includes('amount') || key.includes('revenue') || key.includes('cost')) {
      return `$${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  }
  if (typeof val === 'object') {
    if (Array.isArray(val)) return `[${val.length} items]`;
    return JSON.stringify(val);
  }
  return String(val);
}

// Helper to get friendly action name & theme
function getActionMeta(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('ADD') || upper.includes('REGISTER')) {
    return {
      label: action.replace(/^ADMIN_/, '').replace(/_/g, ' '),
      icon: PlusCircle,
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      type: 'CREATE',
    };
  }
  if (upper.includes('UPDATE') || upper.includes('MODIFY') || upper.includes('EDIT')) {
    return {
      label: action.replace(/^ADMIN_/, '').replace(/_/g, ' '),
      icon: Edit3,
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      type: 'UPDATE',
    };
  }
  if (upper.includes('DELETE') || upper.includes('REMOVE')) {
    return {
      label: action.replace(/^ADMIN_/, '').replace(/_/g, ' '),
      icon: Trash2,
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      type: 'DELETE',
    };
  }
  if (upper.includes('TRANSFER')) {
    return {
      label: action.replace(/_/g, ' '),
      icon: ArrowLeftRight,
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      type: 'TRANSFER',
    };
  }
  if (upper.includes('APPROVE')) {
    return {
      label: action.replace(/_/g, ' '),
      icon: Check,
      badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      type: 'APPROVE',
    };
  }
  return {
    label: action.replace(/_/g, ' '),
    icon: History,
    badgeClass: 'bg-neutral-800 text-neutral-300 border-white/10',
    type: 'OTHER',
  };
}

// Visual State Changes Component (Clean UI instead of raw code)
const StateChangesView: React.FC<{ log: AuditLog }> = ({ log }) => {
  const [showCode, setShowCode] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  const prev = log.previous_state;
  const curr = log.new_state;

  if (!prev && !curr) return null;

  // Case 1: UPDATE (both previous and new state exist)
  if (prev && curr) {
    const allKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(curr)]));
    
    // Filter out internal non-visual keys from primary diff
    const changedKeys: string[] = [];
    const unchangedKeys: string[] = [];

    allKeys.forEach(k => {
      const prevVal = prev[k];
      const currVal = curr[k];
      const isDiff = JSON.stringify(prevVal) !== JSON.stringify(currVal);
      if (isDiff) {
        changedKeys.push(k);
      } else {
        unchangedKeys.push(k);
      }
    });

    return (
      <div className="space-y-3 pt-2">
        {/* Toggle between clean UI and Code */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>Modified Properties ({changedKeys.length})</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-0.5 rounded bg-neutral-950/60 border border-white/5"
          >
            {showCode ? (
              <>
                <Eye className="h-3 w-3 text-amber-400" />
                <span>Switch to Visual UI</span>
              </>
            ) : (
              <>
                <Code className="h-3 w-3 text-neutral-400" />
                <span>View Raw JSON</span>
              </>
            )}
          </button>
        </div>

        {showCode ? (
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/5 text-xs grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1 font-semibold">Previous State</span>
              <pre className="text-[11px] text-rose-300/90 whitespace-pre-wrap overflow-x-auto p-2 bg-neutral-900/50 rounded-lg">
                {JSON.stringify(prev, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1 font-semibold">Committed State</span>
              <pre className="text-[11px] text-emerald-300/90 whitespace-pre-wrap overflow-x-auto p-2 bg-neutral-900/50 rounded-lg">
                {JSON.stringify(curr, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual Diffs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {changedKeys.map(key => {
                const oldVal = prev[key];
                const newVal = curr[key];
                return (
                  <div 
                    key={key} 
                    className="p-2.5 rounded-xl bg-neutral-950/60 border border-white/10 hover:border-amber-500/30 transition-all text-xs"
                  >
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{formatFieldName(key)}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        MODIFIED
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 line-through text-[11px] max-w-[140px] truncate" title={String(oldVal)}>
                        {formatValue(oldVal, key)}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <div className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] max-w-[140px] truncate" title={String(newVal)}>
                        {formatValue(newVal, key)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unchanged Properties Accordion */}
            {unchangedKeys.length > 0 && (
              <div className="pt-1">
                <button
                  onClick={() => setShowAllFields(!showAllFields)}
                  className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <ChevronRight className={`h-3 w-3 transition-transform ${showAllFields ? 'rotate-90' : ''}`} />
                  <span>{showAllFields ? 'Hide' : 'Show'} {unchangedKeys.length} unchanged record attributes</span>
                </button>

                {showAllFields && (
                  <div className="mt-2 p-3 bg-neutral-950/40 border border-white/5 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {unchangedKeys.map(k => (
                      <div key={k} className="p-1.5 bg-neutral-900/40 rounded-lg">
                        <div className="text-[10px] text-neutral-500">{formatFieldName(k)}</div>
                        <div className="text-[11px] text-neutral-300 font-medium truncate" title={String(curr[k])}>
                          {formatValue(curr[k], k)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Case 2: CREATION (only new_state exists)
  if (!prev && curr) {
    const keys = Object.keys(curr).filter(k => !k.includes('id') && !k.includes('created_at') && !k.includes('organization_id'));
    const displayKeys = keys.slice(0, 6);

    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Record Created — Initial Attributes</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-0.5 rounded bg-neutral-950/60 border border-white/5"
          >
            {showCode ? (
              <>
                <Eye className="h-3 w-3 text-amber-400" />
                <span>Visual UI</span>
              </>
            ) : (
              <>
                <Code className="h-3 w-3 text-neutral-400" />
                <span>Raw JSON</span>
              </>
            )}
          </button>
        </div>

        {showCode ? (
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/5 text-xs font-mono">
            <pre className="text-[11px] text-emerald-300/90 whitespace-pre-wrap overflow-x-auto p-2 bg-neutral-900/50 rounded-lg">
              {JSON.stringify(curr, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {displayKeys.map(key => (
              <div key={key} className="p-2 bg-neutral-900/60 rounded-lg border border-white/5">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">{formatFieldName(key)}</div>
                <div className="text-[12px] text-white font-medium mt-0.5 truncate" title={String(curr[key])}>
                  {formatValue(curr[key], key)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Case 3: DELETION (only previous_state exists)
  if (prev && !curr) {
    const keys = Object.keys(prev).filter(k => !k.includes('id') && !k.includes('organization_id')).slice(0, 4);

    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-rose-400">
            <Trash2 className="h-3.5 w-3.5" />
            <span>Record Purged / Deleted</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-0.5 rounded bg-neutral-950/60 border border-white/5"
          >
            {showCode ? 'Visual UI' : 'Raw JSON'}
          </button>
        </div>

        {showCode ? (
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/5 text-xs font-mono">
            <pre className="text-[11px] text-rose-300/90 whitespace-pre-wrap overflow-x-auto p-2 bg-neutral-900/50 rounded-lg">
              {JSON.stringify(prev, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-rose-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {keys.map(key => (
              <div key={key} className="p-1.5 bg-neutral-900/60 rounded-lg border border-white/5">
                <div className="text-[10px] text-neutral-400">{formatFieldName(key)}</div>
                <div className="text-[11px] text-neutral-200 line-through truncate" title={String(prev[key])}>
                  {formatValue(prev[key], key)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const AuditTrailViewer: React.FC = () => {
  const { auditLogs } = useRealtime();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (selectedEntity !== 'ALL' && log.entity_type !== selectedEntity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        log.entity_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCreations = auditLogs.filter(l => l.action.includes('CREATE') || (!l.previous_state && l.new_state)).length;
  const totalUpdates = auditLogs.filter(l => l.action.includes('UPDATE') || (l.previous_state && l.new_state)).length;
  const totalDeletes = auditLogs.filter(l => l.action.includes('DELETE') || (l.previous_state && !l.new_state)).length;

  return (
    <div className="space-y-6">
      
      {/* Header & Metric Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Immutable System Telemetry & State Changes
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">PostgreSQL Audit Logs Table</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Audit Trail & Compliance Ledger
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-white/10 text-xs">
            <span className="text-neutral-400">Total: </span>
            <strong className="text-white font-bold">{auditLogs.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
            <span>Creations: </span>
            <strong className="font-bold">{totalCreations}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-300">
            <span>Updates: </span>
            <strong className="font-bold">{totalUpdates}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-300">
            <span>Deletions: </span>
            <strong className="font-bold">{totalDeletes}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search action code, entity ID..."
            className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'INCIDENT', 'PRODUCT', 'INVENTORY', 'SUPPLIER', 'PURCHASE_ORDER', 'WAREHOUSE', 'PROFILE', 'INVENTORY_TRANSFER', 'APPROVAL'].map(ent => (
            <button
              key={ent}
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                selectedEntity === ent
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:bg-neutral-800'
              }`}
            >
              {ent.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 text-neutral-400 text-xs">
            No audit records found matching your filters.
          </div>
        ) : (
          filteredLogs.map(log => {
            const meta = getActionMeta(log.action);
            const Icon = meta.icon;

            return (
              <div
                key={log.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 bg-neutral-900/80 hover:border-white/20 transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border flex items-center gap-1.5 ${meta.badgeClass}`}>
                      <Icon className="h-3 w-3" />
                      <span>{meta.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {log.entity_type} • <span className="text-neutral-400 font-mono">{log.entity_id}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-neutral-500" />
                      {log.user?.full_name || 'Automated Orchestrator'}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-neutral-500" />
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* State Diffs (Human-Readable UI instead of raw JSON code) */}
                <StateChangesView log={log} />
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

