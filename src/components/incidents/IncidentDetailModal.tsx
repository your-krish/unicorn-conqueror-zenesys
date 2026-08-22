import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Clock, User, 
  Send, ArrowLeftRight, CheckCircle2, 
  Network, MessageSquare
} from 'lucide-react';
import { Incident, IncidentDependencyGraph } from '../../types';
import { db } from '../../lib/database';
import { store } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { DependencyGraph } from './DependencyGraph';
import { SEED_PROFILES } from '../../lib/seed-data';

interface IncidentDetailModalProps {
  incidentId: string | null;
  onClose: () => void;
  onOpenTransferModal: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incidentId,
  onClose,
  onOpenTransferModal,
}) => {
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [graph, setGraph] = useState<IncidentDependencyGraph | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'comments' | 'audit'>('graph');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!incidentId) return;

    db.getIncidentById(incidentId).then(data => {
      if (data) {
        setIncident(data);
        db.getIncidentDependencyGraph(data.id).then(g => setGraph(g));
        // Load comments
        const relatedComments = store.data.incident_comments
          .filter(c => c.incident_id === data.id)
          .map(c => ({
            ...c,
            user: SEED_PROFILES.find(p => p.id === c.user_id),
          }));
        setComments(relatedComments);
      }
    });
  }, [incidentId]);

  if (!incidentId || !incident) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    db.addIncidentComment(incident.id, user.id, commentText).then(newCom => {
      setComments(prev => [...prev, { ...newCom, user }]);
      setCommentText('');
    });
  };

  const handleAssignLead = (assigneeId: string) => {
    if (!user) return;
    db.assignIncident(incident.id, assigneeId, user.id).then(() => {
      db.getIncidentById(incident.id).then(updated => {
        if (updated) setIncident(updated);
      });
    });
  };

  const handleResolve = () => {
    if (!user) return;
    store.resolveIncident(incident.id, user.id);
    db.getIncidentById(incident.id).then(updated => {
      if (updated) {
        setIncident(updated);
        db.getIncidentDependencyGraph(updated.id).then(g => setGraph(g));
      }
    });
  };

  const isResolved = incident.status === 'RESOLVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-hairline)] shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-hairline)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                incident.priority === 'CRITICAL' ? 'bg-rose-500 text-white animate-pulse' :
                incident.priority === 'HIGH' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]'
              }`}>
                {incident.priority} INCIDENT
              </span>
              <span className="text-xs font-mono text-[var(--text-metadata)] font-semibold">
                {incident.incident_number}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                isResolved ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {incident.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {incident.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-canvas)] text-[var(--text-muted)] transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[var(--border-hairline)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Dependency Graph & Root Cause</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Operational Context</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Resolution Logs ({comments.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab 1: Dependency Graph */}
          {activeTab === 'graph' && graph && (
            <DependencyGraph graph={graph} />
          )}

          {/* Tab 2: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-metadata)]">Affected Customer Orders</span>
                  <div className="text-2xl font-bold font-mono text-rose-500 dark:text-rose-400">{incident.affected_orders} Orders</div>
                  <span className="text-[11px] text-[var(--text-muted)]">Blocked on stock release</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-metadata)]">Revenue Impact</span>
                  <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    ₹{(incident.revenue_impact / 100000).toFixed(1)}L
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">₹8,40,000 Total at risk</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-metadata)]">Assigned Lead</span>
                  <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span>{incident.owner?.full_name || 'Aarav Deshmukh'}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">Operations Manager</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-2">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider">
                  Incident Impact Statement
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {incident.description}
                </p>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-2 border-t border-[var(--border-hairline)]">
                  Action Required: {incident.impact}
                </div>
              </div>

              {/* Assign Lead Control */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono tracking-wider">
                  Reassign Operational Owner
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SEED_PROFILES.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignLead(p.id)}
                      className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        incident.owner_id === p.id 
                          ? 'bg-emerald-500/20 border-emerald-500 text-[var(--text-primary)] font-bold shadow-sm' 
                          : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <img src={p.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                      <span>{p.full_name} ({p.role_code})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Comments & Resolution Logs */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                {comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[var(--text-metadata)]">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {c.user?.full_name || 'System Operator'} ({c.user?.role_code || 'OPS'})
                      </span>
                      <span className="text-[10px] font-mono">
                        {new Date(c.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[var(--text-muted)]">{c.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-[var(--border-hairline)]">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Record operational update or dispatch note..."
                  className="flex-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl px-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-metadata)] focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Log Note</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span>SLA Target: 180 min response window</span>
          </div>

          <div className="flex items-center gap-2.5">
            {!isResolved ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenTransferModal();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Dispatch Buffer Stock (Mumbai → Pune)</span>
                </button>

                <button
                  onClick={handleResolve}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolve & Clear Incident</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Incident Resolved & Revenue Risk Neutralized</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
