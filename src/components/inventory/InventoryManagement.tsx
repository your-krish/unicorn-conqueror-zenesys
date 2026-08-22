import React, { useState } from 'react';
import { 
  Boxes, Warehouse, ArrowLeftRight, AlertTriangle, 
  TrendingDown, TrendingUp, Search, Plus, CheckCircle2, History 
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Relational Stock Balances & Facility Capacities
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">Auto Movement Logging (Trigger active)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Inventory & Warehouse Hubs
          </h1>
        </div>

        <button
          onClick={onOpenTransferModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
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
              className={`glass-panel p-4 rounded-2xl border transition-all ${
                isCritical 
                  ? 'bg-rose-950/20 border-rose-500/40' 
                  : 'bg-neutral-900/60 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">{wh.code}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{wh.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  isCritical ? 'bg-rose-500 text-neutral-950 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {isCritical ? 'STOCK DEFICIT' : 'OPTIMAL'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Occupancy</span>
                  <span className="font-mono text-white font-bold">{wh.current_capacity.toLocaleString()} / {wh.max_capacity.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${capPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter product SKU, name..."
            className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedWarehouse('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedWarehouse === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-neutral-900 text-neutral-400 border border-white/5'
            }`}
          >
            All Facilities
          </button>
          {SEED_WAREHOUSES.map(wh => (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouse(wh.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedWarehouse === wh.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-neutral-900 text-neutral-400 border border-white/5'
              }`}
            >
              {wh.code}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table (Requirement 10 & 11) */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/90 text-neutral-400 font-mono text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="p-3.5">Product SKU & Name</th>
                <th className="p-3.5">Facility</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Min / Max Buffer</th>
                <th className="p-3.5">Reserved</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Unit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.map(inv => {
                const isLow = inv.current_stock < inv.minimum_stock;
                const isCrit = inv.current_stock < inv.minimum_stock * 0.3;

                return (
                  <tr key={inv.id} className={`hover:bg-white/[0.02] transition-colors ${
                    isCrit ? 'bg-rose-950/20' : ''
                  }`}>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{inv.product?.name}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{inv.product?.sku} • {inv.product?.category}</div>
                    </td>
                    <td className="p-3.5 font-medium text-neutral-200">
                      {inv.warehouse?.name}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={isCrit ? 'text-rose-400 text-sm' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                        {inv.current_stock.toLocaleString()} Units
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-400">
                      {inv.minimum_stock} / {inv.maximum_stock}
                    </td>
                    <td className="p-3.5 font-mono text-neutral-300">
                      {inv.reserved_stock} Units
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' :
                        isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {isCrit ? 'CRITICAL DEFICIT' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-white">
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
