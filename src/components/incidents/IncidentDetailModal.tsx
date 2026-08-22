import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Clock, User, Building, MapPin, 
  DollarSign, ShoppingBag, Send, ArrowLeftRight, CheckCircle2, 
  Network, History, MessageSquare, ShieldCheck
} from 'lucide-react';
import { Incident, IncidentDependencyGraph, Profile } from '../../types';
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
      <div className="w-full max-w-5xl max-h-[90vh] glass-panel bg-neutral-900/95 rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                incident.priority === 'CRITICAL' ? 'bg-rose-500 text-neutral-950 animate-pulse' :
                incident.priority === 'HIGH' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-700 text-white'
              }`}>
                {incident.priority} INCIDENT
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {incident.incident_number}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {incident.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {incident.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all ${
              activeTab === 'graph'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Dependency Graph & Root Cause</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Operational Context</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all ${
              activeTab === 'comments'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Resolution Logs ({comments.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Tab 1: Dependency Graph (Hackathon Showcase) */}
          {activeTab === 'graph' && graph && (
            <DependencyGraph graph={graph} />
          )}

          {/* Tab 2: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400">Affected Customer Orders</span>
                  <div className="text-2xl font-bold font-mono text-rose-300">{incident.affected_orders} Orders</div>
                  <span className="text-[11px] text-neutral-400">Blocked on stock release</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400">Revenue Impact</span>
                  <div className="text-2xl font-bold font-mono text-white">
                    ₹{(incident.revenue_impact / 100000).toFixed(1)}L
                  </div>
                  <span className="text-[11px] text-neutral-400">₹8,40,000 Total at risk</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400">Assigned Lead</span>
                  <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-amber-400" />
                    <span>{incident.owner?.full_name || 'Aarav Deshmukh'}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">Operations Manager</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Incident Impact Statement
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {incident.description}
                </p>
                <div className="text-xs text-amber-300/90 font-medium pt-2 border-t border-white/5">
                  Action Required: {incident.impact}
                </div>
              </div>

              {/* Assign Lead Control */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Reassign Operational Owner
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SEED_PROFILES.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignLead(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                        incident.owner_id === p.id 
                          ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold' 
                          : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <img src={p.avatar_url} alt="" className="h-4 w-4 rounded-full" />
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
                  <div key={c.id} className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="font-semibold text-neutral-200">
                        {c.user?.full_name || 'System Operator'} ({c.user?.role_code || 'OPS'})
                      </span>
                      <span className="text-[10px] font-mono">
                        {new Date(c.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-neutral-300">{c.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Record operational update or dispatch note..."
                  className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Log Note</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-all"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Dispatch Buffer Stock (Mumbai → Pune)</span>
                </button>

                <button
                  onClick={handleResolve}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolve & Clear Incident</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
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
