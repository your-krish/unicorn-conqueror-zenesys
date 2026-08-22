import React from 'react';
import { 
  LayoutDashboard, AlertOctagon, Boxes, Truck, CheckSquare, 
  Users, BarChart3, History, Sliders, ArrowLeftRight, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export type TabType = 
  | 'overview'
  | 'incidents'
  | 'inventory'
  | 'procurement'
  | 'approvals'
  | 'workforce'
  | 'reports'
  | 'audit'
  | 'admin';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenTransferModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenTransferModal,
}) => {
  const { role } = useAuth();
  const { metrics, approvals, incidents } = useRealtime();

  const criticalIncidents = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING').length;

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { 
      id: 'incidents', 
      label: 'Critical Incidents', 
      icon: AlertOctagon,
      badge: criticalIncidents > 0 ? criticalIncidents : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    { id: 'inventory', label: 'Inventory & Hubs', icon: Boxes },
    { id: 'procurement', label: 'Procurement & POs', icon: Truck },
    { 
      id: 'approvals', 
      label: 'Approvals & Actions', 
      icon: CheckSquare,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    { id: 'workforce', label: 'Workforce & Shifts', icon: Users },
    { id: 'reports', label: 'Executive Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail (Logs)', icon: History },
    { id: 'admin', label: 'Admin Management', icon: Sliders },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="glass-panel rounded-2xl p-3 border border-white/10 lg:sticky lg:top-20 space-y-4">
        
        {/* Organization Scope Header */}
        <div className="px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/5">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            Active Workspace
          </div>
          <div className="text-xs font-semibold text-neutral-200 truncate mt-0.5">
            Apex Semiconductor Ltd.
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Realtime Synchronized</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 shadow-lg shadow-amber-950/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-neutral-500 group-hover:text-neutral-300'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Operational Action: Emergency Transfer */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={onOpenTransferModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-900/30 to-amber-950/40 hover:from-amber-900/50 hover:to-amber-950/60 border border-amber-500/30 text-amber-200 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
              <span>Stock Transfer Dispatch</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Health Telemetry Mini Card */}
        <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Inventory Health</span>
            <span className="font-mono text-neutral-200 font-bold">{metrics.inventory_health}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.inventory_health}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
            <span>Workforce Availability</span>
            <span className="font-mono text-emerald-400">{metrics.workforce_availability}%</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
