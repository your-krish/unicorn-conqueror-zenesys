import React, { useState } from 'react';
import { 
  Database, Shield, Key, Copy, Check, Terminal, 
  ExternalLink, Layers, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SupabaseSchemaInspector: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'functions' | 'migration'>('tables');

  const tables = [
    { name: 'organizations', rows: '1', rls: 'Enabled', desc: 'Enterprise organizational entity' },
    { name: 'profiles', rows: '7', rls: 'Enabled', desc: 'Users linked to auth.users' },
    { name: 'roles', rows: '8', rls: 'Enabled', desc: 'Role codes: CEO, COO, CFO, OPS, INV, PROC, HR' },
    { name: 'departments', rows: '6', rls: 'Enabled', desc: 'Operations, Inventory, Procurement, Finance, HR, Sales' },
    { name: 'locations', rows: '5', rls: 'Enabled', desc: 'Pune HQ, Pune WH, Mumbai DC, Nashik WH, Delhi OC' },
    { name: 'warehouses', rows: '3', rls: 'Enabled', desc: 'Physical storage hubs with capacity limits' },
    { name: 'inventory', rows: '6', rls: 'Enabled', desc: 'Realtime stock balances with minimum thresholds' },
    { name: 'stock_movements', rows: '24', rls: 'Enabled', desc: 'Immutable stock change ledger via DB triggers' },
    { name: 'inventory_transfers', rows: '4', rls: 'Enabled', desc: 'Inter-facility emergency buffer dispatches' },
    { name: 'purchase_orders', rows: '3', rls: 'Enabled', desc: 'Inbound POs from suppliers' },
    { name: 'deliveries', rows: '2', rls: 'Enabled', desc: 'Freight tracking with automated delay detection' },
    { name: 'incidents', rows: '2', rls: 'Enabled', desc: 'Critical blockers, SLA ties & revenue impacts' },
    { name: 'slas', rows: '2', rls: 'Enabled', desc: 'Realtime SLA timers with deadline constraints' },
    { name: 'approvals', rows: '2', rls: 'Enabled', desc: 'Multi-step executive approval workflows' },
    { name: 'notifications', rows: '4', rls: 'Enabled', desc: 'User and department targeted broadcast events' },
    { name: 'audit_logs', rows: '12', rls: 'Enabled', desc: 'Complete state diff mutation history' },
    { name: 'enterprise_metrics', rows: '1', rls: 'Enabled', desc: 'Dynamic 0-100 enterprise health indices' },
  ];

  const rlsPolicies = [
    { table: 'organizations', policy: 'Org members can view organizations', action: 'SELECT', definition: 'id = public.get_current_user_organization()' },
    { table: 'profiles', policy: 'Org members can view profiles', action: 'ALL', definition: 'organization_id = public.get_current_user_organization()' },
    { table: 'incidents', policy: 'Role-based incident operations', action: 'ALL', definition: 'organization_id = public.get_current_user_organization()' },
    { table: 'inventory', policy: 'Public org stock visibility', action: 'SELECT', definition: 'true' },
    { table: 'approvals', policy: 'Executive and requester access', action: 'ALL', definition: 'auth.uid() IN (requester_id, approver_id) OR public.get_current_user_role() IN (\'CEO\', \'COO\', \'CFO\')' },
  ];

  const migrationSnippet = `-- Run in Supabase SQL Editor:
-- STRATIQ ENTERPRISE OS SCHEMA MIGRATION
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.calculate_enterprise_health(org_id UUID)
RETURNS NUMERIC AS $$
-- Calculates weighted 0-100 enterprise health score
$$ LANGUAGE plpgsql;`;

  const copySql = () => {
    navigator.clipboard.writeText(migrationSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Supabase PostgreSQL Architecture
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">29 Relational Tables & RLS Policies</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Database Schema & Security Console
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-300 font-mono">
            <span className={`h-2 w-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{isSupabaseConfigured ? 'Live Supabase Attached' : 'Reactive Engine Active'}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 text-xs font-medium">
        {[
          { id: 'tables', label: 'Relational Tables' },
          { id: 'rls', label: 'Row Level Security (RLS)' },
          { id: 'functions', label: 'Postgres Functions & Triggers' },
          { id: 'migration', label: 'SQL Migration File' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/90 text-neutral-400 font-mono text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="p-3.5">Table Name</th>
                <th className="p-3.5">Seed Rows</th>
                <th className="p-3.5">RLS Policy Status</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {tables.map(t => (
                <tr key={t.name} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-bold text-white">{t.name}</td>
                  <td className="p-3.5 text-neutral-400">{t.rows} Records</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                      {t.rls}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-neutral-300">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RLS Policies Tab */}
      {activeTab === 'rls' && (
        <div className="space-y-3">
          {rlsPolicies.map((p, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-white">{p.table}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  {p.action}
                </span>
              </div>
              <div className="text-xs text-neutral-300">{p.policy}</div>
              <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-white/5 font-mono text-[11px] text-emerald-300">
                USING ({p.definition})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Functions & Triggers Tab */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono uppercase">calculate_enterprise_health(org_id UUID)</h4>
            <p className="text-xs text-neutral-300">
              Computes dynamic 0-100 composite operational health by calculating weights across critical incidents, delayed freight shipments, and warehouse stock deficits.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono uppercase">trg_after_inventory_update (Trigger)</h4>
            <p className="text-xs text-neutral-300">
              Automatically creates an immutable stock_movement record every time the current_stock of any warehouse item is modified.
            </p>
          </div>
        </div>
      )}

      {/* Migration Tab */}
      {activeTab === 'migration' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">
              File: supabase/migrations/20260822000001_stratiq_schema_and_seed.sql
            </span>
            <button
              onClick={copySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-950 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed max-h-96">
            {migrationSnippet}
          </pre>
        </div>
      )}

    </div>
  );
};
