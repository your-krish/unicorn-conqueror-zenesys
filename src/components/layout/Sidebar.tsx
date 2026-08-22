import React from 'react';
import { 
  LayoutDashboard, AlertOctagon, Boxes, Truck, CheckSquare, 
  Users, BarChart3, History, Sliders, ArrowLeftRight, ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export type TabType = 
  | 'overview'
  | 'ai-analytics'
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
  const { user, canAccessAdmin, isCEO, isAdmin } = useAuth();
  const { metrics, approvals, incidents } = useRealtime();

  const criticalIncidents = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING').length;

  const baseNavItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { 
      id: 'ai-analytics', 
      label: 'AI Intelligence Suite', 
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    },
    { 
      id: 'incidents', 
      label: 'Critical Incidents', 
      icon: AlertOctagon,
      badge: criticalIncidents > 0 ? criticalIncidents : undefined,
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    },
    { id: 'inventory', label: 'Inventory & Hubs', icon: Boxes },
    { id: 'procurement', label: 'Procurement & POs', icon: Truck },
    { 
      id: 'approvals', 
      label: 'Approvals & Actions', 
      icon: CheckSquare,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    },
    { id: 'workforce', label: 'Workforce & Shifts', icon: Users },
    { id: 'reports', label: 'Executive Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail (Logs)', icon: History },
  ];

  // For admin view: admin management panel is visible. For CEO account: no admin management.
  const navItems = canAccessAdmin
    ? [...baseNavItems, { id: 'admin' as TabType, label: 'Admin Management', icon: Sliders }]
    : baseNavItems;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-[var(--bg-surface)] rounded-3xl p-3.5 border border-[var(--border-hairline)] lg:sticky lg:top-20 space-y-4 shadow-sm transition-colors duration-200">
        
        {/* Organization Scope Header */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--text-metadata)] uppercase tracking-widest font-semibold">
              Active Session
            </span>
            <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full border ${
              isAdmin 
                ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
            }`}>
              {isAdmin ? 'ADMIN VIEW' : isCEO ? 'CEO VIEW' : `${user?.role_code || 'GUEST'}`}
            </span>
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)] truncate">
            {user?.full_name || 'Apex Semiconductor Ltd.'}
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-metadata)] font-mono">
            <span className="truncate max-w-[130px]">{user?.email || 'authenticated'}</span>
            <span className="text-emerald-500 font-bold">• Online</span>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 transition-colors shrink-0 ${
                    isActive ? 'text-emerald-500' : 'text-[var(--text-metadata)] group-hover:text-[var(--text-primary)]'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Operational Action: Emergency Transfer */}
        <div className="pt-2 border-t border-[var(--border-hairline)]">
          <button
            onClick={onOpenTransferModal}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Stock Transfer Dispatch</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Health Telemetry Mini Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)]">Inventory Health</span>
            <span className="font-mono text-[var(--text-primary)] font-bold">{metrics.inventory_health}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.inventory_health}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
            <span>Workforce Active</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{metrics.workforce_availability}%</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
