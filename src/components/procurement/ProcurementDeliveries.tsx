import React, { useState } from 'react';
import { 
  Truck, Building2, AlertTriangle, CheckCircle2, 
  Clock, Package, Search, ExternalLink, ShieldCheck, Zap 
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { SEED_SUPPLIERS } from '../../lib/seed-data';

export const ProcurementDeliveries: React.FC = () => {
  const { triggerSupplierDelayDemo } = useRealtime();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'suppliers' | 'orders'>('deliveries');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Supplier SLA & Inbound Freight Telemetry
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">PostgreSQL Deliveries Table</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Procurement & Freight Deliveries
          </h1>
        </div>

        <button
          onClick={triggerSupplierDelayDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-amber-950/80 hover:from-rose-900 hover:to-amber-900 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all shadow-lg shadow-rose-950/30"
        >
          <Zap className="h-4 w-4 text-rose-400 fill-rose-400 animate-pulse" />
          <span>Simulate Supplier Delay (DHL Freight)</span>
        </button>
      </div>

      {/* Primary Delayed PO Alert Banner (Requirement 33 & 45) */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-neutral-900/80 to-neutral-900 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-neutral-950 text-[10px] font-mono font-bold uppercase animate-pulse">
              DELAY DETECTED (+48H)
            </span>
            <span className="text-xs font-mono font-semibold text-rose-300">
              Tracking: DHL-EXPRESS-99281744-DE
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Carrier Status: Customs Hold (Frankfurt Hub)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Supplier</span>
            <div className="font-bold text-white text-xs mt-0.5">Nexus Microelectronics AG</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Purchase Order</span>
            <div className="font-bold text-amber-300 text-xs mt-0.5">PO #8942 (TX-9 MCU Units)</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Downstream Revenue Exposure</span>
            <div className="font-bold text-white text-xs mt-0.5">₹8.4L across 243 orders</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 text-xs font-medium">
        {[
          { id: 'deliveries', label: 'Active Inbound Shipments' },
          { id: 'suppliers', label: 'Approved Supplier Directory' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Inbound Deliveries Table */}
      {activeTab === 'deliveries' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/90 text-neutral-400 font-mono text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="p-3.5">Tracking Code</th>
                <th className="p-3.5">Purchase Order</th>
                <th className="p-3.5">Expected Delivery</th>
                <th className="p-3.5">Delay (Hours)</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="bg-rose-950/20">
                <td className="p-3.5 font-mono font-bold text-white">DHL-EXPRESS-99281744-DE</td>
                <td className="p-3.5">PO #8942 (Nexus AG)</td>
                <td className="p-3.5 font-mono text-neutral-300">Aug 21, 2026</td>
                <td className="p-3.5 font-mono font-bold text-rose-400">+48 Hours</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold">
                    DELAYED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono font-bold text-white">FEDEX-CARGO-77182901-TW</td>
                <td className="p-3.5">PO #8943 (Photonics Precision)</td>
                <td className="p-3.5 font-mono text-neutral-300">Aug 24, 2026</td>
                <td className="p-3.5 font-mono text-emerald-400">0 Hours</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                    IN TRANSIT
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Directory */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SEED_SUPPLIERS.map(sup => (
            <div key={sup.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{sup.name}</h3>
                  <p className="text-xs text-neutral-400">{sup.contact_name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  sup.status === 'AT_RISK' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {sup.status}
                </span>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Rating:</span>
                  <span className="font-mono text-amber-400 font-bold">{sup.rating} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Lead Time:</span>
                  <span className="font-mono text-white">{sup.lead_time_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Contact:</span>
                  <span className="text-neutral-300 truncate">{sup.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
