import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertOctagon, Boxes, Truck, ArrowRight, Building2 } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { SEED_PRODUCTS, SEED_WAREHOUSES, SEED_SUPPLIERS } from '../../lib/seed-data';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIncident: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectIncident,
}) => {
  const { incidents } = useRealtime();
  const [query, setQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const matchedIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase()) || 
    i.incident_number.toLowerCase().includes(query.toLowerCase()) ||
    i.description?.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProducts = SEED_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const matchedSuppliers = SEED_SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(query.toLowerCase()) ||
    s.email.toLowerCase().includes(query.toLowerCase())
  );

  const matchedWarehouses = SEED_WAREHOUSES.filter(w =>
    w.name.toLowerCase().includes(query.toLowerCase()) ||
    w.code.toLowerCase().includes(query.toLowerCase()) ||
    w.status.toLowerCase().includes(query.toLowerCase())
  );

  const totalMatches = matchedIncidents.length + matchedProducts.length + matchedSuppliers.length + matchedWarehouses.length;

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      <div 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl relative rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden space-y-3 p-4 sm:p-5 animate-in zoom-in-95 duration-200"
      >
        {/* Search Bar Header */}
        <div className="relative flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-emerald-500" />
          </div>
          
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search incidents, inventory, suppliers, hubs..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-metadata)] font-normal focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[var(--text-metadata)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded-md hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Results Feed */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 pt-1">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] space-y-2">
              <p>Quick jump to live records, SKUs, or active critical incidents</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-metadata)] text-[10px] font-mono border border-[var(--border-hairline)]">
                  Try: "TX-9", "Critical", "Pune", "Foxconn"
                </span>
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching enterprise operational records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Incidents Section */}
              {matchedIncidents.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-metadata)] font-bold px-1">
                    Operational Incidents ({matchedIncidents.length})
                  </div>
                  {matchedIncidents.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-emerald-500/10 border border-[var(--border-hairline)] hover:border-emerald-500/40 text-xs cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <AlertOctagon className={`h-4 w-4 ${inc.priority === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
                        <div>
                          <div className="font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                            {inc.title}
                          </div>
                          <div className="text-[10px] text-[var(--text-metadata)] font-mono mt-0.5">
                            {inc.incident_number} • {inc.status}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--text-metadata)] group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {/* Products Section */}
              {matchedProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-metadata)] font-bold px-1">
                    Inventory & SKUs ({matchedProducts.length})
                  </div>
                  {matchedProducts.map(p => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Boxes className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{p.name}</div>
                          <div className="text-[10px] text-[var(--text-metadata)] font-mono">
                            SKU: {p.sku} • {p.category}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Reorder: {p.reorder_point} units
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suppliers Section */}
              {matchedSuppliers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-metadata)] font-bold px-1">
                    Suppliers & Vendors ({matchedSuppliers.length})
                  </div>
                  {matchedSuppliers.map(s => (
                    <div
                      key={s.id}
                      className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="h-4 w-4 text-emerald-500" />
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{s.name}</div>
                          <div className="text-[10px] text-[var(--text-metadata)]">
                            {s.contact_name} • {s.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {s.rating} ★ Rating
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warehouses Section */}
              {matchedWarehouses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-metadata)] font-bold px-1">
                    Logistics Hubs ({matchedWarehouses.length})
                  </div>
                  {matchedWarehouses.map(w => (
                    <div
                      key={w.id}
                      className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-violet-500" />
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{w.name}</div>
                          <div className="text-[10px] text-[var(--text-metadata)] font-mono">
                            {w.code} • {w.status}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        Cap: {w.max_capacity.toLocaleString()} Units
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
