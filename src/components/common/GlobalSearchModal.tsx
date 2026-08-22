import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertOctagon, Boxes, Truck, ArrowRight, Sparkles, Building2, User, Layers } from 'lucide-react';
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

  // Handle click outside to close
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/25 backdrop-blur-[6px] transition-all duration-300 animate-in fade-in"
    >
      {/* Liquid Glass Search Panel */}
      <div 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl relative rounded-3xl backdrop-blur-2xl bg-neutral-900/65 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10 overflow-hidden space-y-3 p-4 sm:p-5 animate-in zoom-in-95 duration-200"
      >
        {/* Subtle Liquid Highlight Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Liquid Search Bar Header */}
        <div className="relative flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-950/50 backdrop-blur-md border border-white/15 focus-within:border-amber-400/70 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
          <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-amber-400" />
          </div>
          
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search incidents, inventory, suppliers, hubs..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-neutral-400 font-normal focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-1.5 py-0.5 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Clear
            </button>
          )}

          {/* Cross Close Button */}
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-neutral-800/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 flex items-center justify-center transition-all cursor-pointer group shrink-0"
            title="Close Search Panel"
          >
            <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Quick Filter Tag Indicators */}
        <div className="flex items-center justify-between px-1 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400/90 font-medium">Quick Filters:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px]">
                {matchedIncidents.length} Incidents
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px]">
                {matchedProducts.length} Products
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px]">
                {matchedSuppliers.length} Suppliers
              </span>
            </div>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">
            {totalMatches} matching results
          </span>
        </div>

        {/* Results Container with Translucent Frosted Glass Tiles */}
        <div className="max-h-[55vh] overflow-y-auto space-y-3.5 pr-1 text-xs custom-scrollbar">
          
          {totalMatches === 0 && query && (
            <div className="p-8 text-center rounded-2xl bg-neutral-950/40 border border-white/10 backdrop-blur-sm text-neutral-400">
              <Sparkles className="h-6 w-6 text-amber-400/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">No exact records found</p>
              <p className="text-xs text-neutral-400 mt-1">Try querying a different SKU, title, warehouse city or supplier name.</p>
            </div>
          )}

          {/* Incidents Section */}
          {matchedIncidents.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-rose-300 uppercase tracking-wider font-semibold block px-2">
                Operational Incidents ({matchedIncidents.length})
              </span>
              {matchedIncidents.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 hover:bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-amber-400/40 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                      <AlertOctagon className="h-4 w-4 text-rose-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">{inc.title}</div>
                      <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400/90">{inc.incident_number}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          inc.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                        }`}>{inc.priority}</span>
                        <span>•</span>
                        <span className="text-neutral-400 capitalize">{inc.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Products Section */}
          {matchedProducts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider font-semibold block px-2">
                Products & Inventory Stock ({matchedProducts.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedProducts.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Boxes className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{p.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">{p.sku} • {p.category}</div>
                      </div>
                    </div>
                    <span className="font-mono text-amber-300 font-bold shrink-0 ml-2">${p.unit_price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers Section */}
          {matchedSuppliers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-semibold block px-2">
                Key Suppliers ({matchedSuppliers.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedSuppliers.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Truck className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{s.contact_name} • {s.lead_time_days}d lead time</div>
                      </div>
                    </div>
                    <span className="font-mono text-amber-400 font-bold shrink-0 ml-2">{s.rating} ★</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities & Warehouses Section */}
          {matchedWarehouses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-semibold block px-2">
                Hubs & Facilities ({matchedWarehouses.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedWarehouses.map(w => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/40 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{w.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">{w.code} • {w.status.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">{Math.round((w.current_capacity / w.max_capacity) * 100)}% load</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

