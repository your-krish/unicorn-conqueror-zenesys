import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { SEED_SUPPLIERS } from '../../lib/seed-data';

export const ProcurementDeliveries: React.FC = () => {
  const { triggerSupplierDelayDemo } = useRealtime();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'suppliers' | 'orders'>('deliveries');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Supplier SLA & Inbound Freight Telemetry
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">PostgreSQL Deliveries Table</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Procurement & Freight Deliveries
          </h1>
        </div>

        <button
          onClick={triggerSupplierDelayDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-bold text-xs transition-all shadow-md shadow-rose-950/10 cursor-pointer"
        >
          <Zap className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>Simulate Supplier Delay (DHL Freight)</span>
        </button>
      </div>

      {/* Primary Delayed PO Alert Banner */}
      <div className="spotlight-card p-6 rounded-3xl border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-[var(--bg-surface)] to-[var(--bg-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold uppercase animate-pulse">
              DELAY DETECTED (+48H)
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-300">
              Tracking: DHL-EXPRESS-99281744-DE
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--text-metadata)]">
            Carrier Status: Customs Hold (Frankfurt Hub)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)]">Supplier</span>
            <div className="font-bold text-[var(--text-primary)] text-xs mt-0.5">Nexus Microelectronics AG</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-metadata)]">Purchase Order</span>
            <div className="font-bold text-amber-500 text-xs mt-0.5">PO #8942 (TX-9 MCU Units)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase text-rose-500 font-bold">Downstream Revenue Exposure</span>
            <div className="font-bold text-[var(--text-primary)] text-xs mt-0.5">₹8.4L across 243 orders</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] text-xs font-medium">
        {[
          { id: 'deliveries', label: 'Active Inbound Shipments' },
          { id: 'suppliers', label: 'Approved Supplier Directory' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Inbound Deliveries Table */}
      {activeTab === 'deliveries' && (
        <div className="spotlight-card rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs text-[var(--text-muted)]">
            <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-metadata)] font-mono text-[10px] uppercase border-b border-[var(--border-hairline)]">
              <tr>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Purchase Order</th>
                <th className="p-4">Expected Delivery</th>
                <th className="p-4">Delay (Hours)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              <tr className="bg-rose-500/5">
                <td className="p-4 font-mono font-bold text-[var(--text-primary)]">DHL-EXPRESS-99281744-DE</td>
                <td className="p-4 text-[var(--text-primary)]">PO #8942 (Nexus AG)</td>
                <td className="p-4 font-mono text-[var(--text-metadata)]">Aug 21, 2026</td>
                <td className="p-4 font-mono font-bold text-rose-500">+48 Hours</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold">
                    DELAYED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-mono font-bold text-[var(--text-primary)]">FEDEX-CARGO-77182901-TW</td>
                <td className="p-4 text-[var(--text-primary)]">PO #8943 (Photonics Precision)</td>
                <td className="p-4 font-mono text-[var(--text-metadata)]">Aug 24, 2026</td>
                <td className="p-4 font-mono text-emerald-500">0 Hours</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
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
            <div key={sup.id} className="spotlight-card p-5 rounded-3xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{sup.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{sup.contact_name}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  sup.status === 'AT_RISK' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sup.status}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-metadata)]">Rating:</span>
                  <span className="font-mono text-amber-500 font-bold">{sup.rating} ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-metadata)]">Lead Time:</span>
                  <span className="font-mono text-[var(--text-primary)]">{sup.lead_time_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-metadata)]">Contact:</span>
                  <span className="text-[var(--text-primary)] truncate">{sup.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
