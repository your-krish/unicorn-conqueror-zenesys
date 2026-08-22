import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/database';

export const ApprovalCenter: React.FC = () => {
  const { user } = useAuth();
  const { approvals } = useRealtime();
  const [commentsInput] = useState<{ [id: string]: string }>({});

  const handleAction = (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;
    const comment = commentsInput[approvalId] || (status === 'APPROVED' ? 'Approved via operational command console.' : 'Rejected.');
    db.processApproval(approvalId, user.id, status, comment);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Executive Governance & Multi-Step Workflows
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">PostgreSQL Approvals Table</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Approvals & Workflow Authorization
          </h1>
        </div>

        <div className="text-xs text-[var(--text-muted)] font-mono">
          Pending Signoffs: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{approvals.filter(a => a.status === 'PENDING').length}</strong>
        </div>
      </div>

      {/* Approvals Cards */}
      <div className="space-y-4">
        {approvals.map(appr => {
          const isPending = appr.status === 'PENDING';

          return (
            <div
              key={appr.id}
              className={`spotlight-card rounded-3xl p-6 transition-all ${
                isPending 
                  ? 'border-emerald-500/40' 
                  : 'opacity-85'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Metadata & Comments */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      {appr.entity_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-metadata)]">
                      Step {appr.step} of {appr.total_steps || 2}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                      appr.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                      appr.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {appr.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    {appr.comments || 'Authorization required for operational dispatch'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                    <span>Requester: <strong className="text-[var(--text-primary)]">{appr.requester?.full_name || 'Aarav Deshmukh (Ops)'}</strong></span>
                    <span>Required Role: <strong className="text-emerald-600 dark:text-emerald-400">COO / Executive</strong></span>
                    {appr.amount && (
                      <span>Value: <strong className="text-[var(--text-primary)] font-mono">₹{appr.amount.toLocaleString()}</strong></span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                {isPending ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-hairline)]">
                    <button
                      onClick={() => handleAction(appr.id, 'APPROVED')}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve & Dispatch</span>
                    </button>

                    <button
                      onClick={() => handleAction(appr.id, 'REJECTED')}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Workflow Completed ({appr.status})</span>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
