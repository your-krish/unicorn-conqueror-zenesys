import React, { useState } from 'react';
import { 
  ArrowLeftRight, Search
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { SEED_WAREHOUSES } from '../../lib/seed-data';

interface InventoryManagementProps {
  onOpenTransferModal: () => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ onOpenTransferModal }) => {
  const { inventory } = useRealtime();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');

  const filteredInventory = inventory.filter(inv => {
    if (selectedWarehouse !== 'ALL' && inv.warehouse_id !== selectedWarehouse) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.product?.name.toLowerCase().includes(q) ||
        inv.product?.sku.toLowerCase().includes(q) ||
        inv.warehouse?.name.toLowerCase().includes(q)
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
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Relational Stock Balances & Facility Capacities
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">Auto Movement Logging</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Inventory & Warehouse Hubs
          </h1>
        </div>

        <button
          onClick={onOpenTransferModal}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Initiate Stock Transfer</span>
        </button>
      </div>

      {/* Warehouse Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SEED_WAREHOUSES.map(wh => {
          const isCritical = wh.id === 'wh-pune-01';
          const capPercent = Math.round((wh.current_capacity / wh.max_capacity) * 100);

          return (
            <div
              key={wh.id}
              className={`spotlight-card p-5 rounded-3xl transition-all ${
                isCritical 
                  ? 'border-rose-500/40' 
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-metadata)] uppercase font-semibold">{wh.code}</span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{wh.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                  isCritical ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isCritical ? 'STOCK DEFICIT' : 'OPTIMAL'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Occupancy</span>
                  <span className="font-mono text-[var(--text-primary)] font-bold">{wh.current_capacity.toLocaleString()} / {wh.max_capacity.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${capPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="spotlight-card p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[var(--text-metadata)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter product SKU, name..."
            className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-metadata)] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedWarehouse('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedWarehouse === 'ALL'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Facilities
          </button>
          {SEED_WAREHOUSES.map(wh => (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouse(wh.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                selectedWarehouse === wh.id
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
              }`}
            >
              {wh.code}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="spotlight-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-muted)]">
            <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-metadata)] font-mono text-[10px] uppercase border-b border-[var(--border-hairline)]">
              <tr>
                <th className="p-4">Product SKU & Name</th>
                <th className="p-4">Facility</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min / Max Buffer</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Unit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredInventory.map(inv => {
                const isLow = inv.current_stock < inv.minimum_stock;
                const isCrit = inv.current_stock < inv.minimum_stock * 0.3;

                return (
                  <tr key={inv.id} className={`hover:bg-[var(--bg-surface-elevated)]/50 transition-colors ${
                    isCrit ? 'bg-rose-500/5' : ''
                  }`}>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{inv.product?.name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-metadata)]">{inv.product?.sku} • {inv.product?.category}</div>
                    </td>
                    <td className="p-4 font-medium text-[var(--text-primary)]">
                      {inv.warehouse?.name}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span className={isCrit ? 'text-rose-500 text-sm' : isLow ? 'text-amber-500' : 'text-emerald-500'}>
                        {inv.current_stock.toLocaleString()} Units
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[var(--text-metadata)]">
                      {inv.minimum_stock} / {inv.maximum_stock}
                    </td>
                    <td className="p-4 font-mono text-[var(--text-muted)]">
                      {inv.reserved_stock} Units
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        isCrit ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse' :
                        isLow ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isCrit ? 'CRITICAL DEFICIT' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-[var(--text-primary)]">
                      ₹{inv.product?.unit_price.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
