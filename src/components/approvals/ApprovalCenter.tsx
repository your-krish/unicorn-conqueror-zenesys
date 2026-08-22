import React, { useState } from 'react';
import { 
  CheckSquare, CheckCircle2, XCircle, Clock, 
  ArrowLeftRight, FileText, User, MessageSquare, ShieldAlert 
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/database';

export const ApprovalCenter: React.FC = () => {
  const { user, role } = useAuth();
  const { approvals } = useRealtime();
  const [commentsInput, setCommentsInput] = useState<{ [id: string]: string }>({});

  const handleAction = (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;
    const comment = commentsInput[approvalId] || (status === 'APPROVED' ? 'Approved via operational command console.' : 'Rejected.');
    db.processApproval(approvalId, user.id, status, comment);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Executive Governance & Multi-Step Workflows
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">PostgreSQL Approvals Table</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Approvals & Workflow Authorization
          </h1>
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Pending Signoffs: <strong className="text-amber-400 font-bold">{approvals.filter(a => a.status === 'PENDING').length}</strong>
        </div>
      </div>

      {/* Approvals Cards */}
      <div className="space-y-4">
        {approvals.map(appr => {
          const isPending = appr.status === 'PENDING';
          const isTransfer = appr.entity_type === 'INVENTORY_TRANSFER';

          return (
            <div
              key={appr.id}
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                isPending 
                  ? 'border-amber-500/40 bg-neutral-900/90 shadow-xl shadow-amber-950/20' 
                  : 'border-white/10 bg-neutral-900/50 opacity-85'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Metadata & Comments */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {appr.entity_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Step {appr.step} of {appr.total_steps || 2}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                      appr.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                      appr.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {appr.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {appr.comments || 'Authorization required for operational dispatch'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                    <span>Requester: <strong className="text-neutral-200">{appr.requester?.full_name || 'Aarav Deshmukh (Ops)'}</strong></span>
                    <span>Required Role: <strong className="text-amber-300">COO / Executive</strong></span>
                    {appr.amount && (
                      <span>Value: <strong className="text-white font-mono">₹{appr.amount.toLocaleString()}</strong></span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                {isPending ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    <button
                      onClick={() => handleAction(appr.id, 'APPROVED')}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve & Dispatch</span>
                    </button>

                    <button
                      onClick={() => handleAction(appr.id, 'REJECTED')}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
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
