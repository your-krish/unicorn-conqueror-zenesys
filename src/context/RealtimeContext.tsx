import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { store } from '../lib/store';
import { getSupabaseClient, fetchIncidentsFromSupabase } from '../lib/supabase';
import { Incident, Notification, Approval, Inventory, AuditLog, EnterpriseMetric } from '../types';

interface RealtimeAlert {
  id: string;
  type: 'INCIDENT' | 'APPROVAL' | 'DELIVERY' | 'INVENTORY' | 'SYSTEM';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

interface RealtimeContextType {
  incidents: Incident[];
  notifications: Notification[];
  approvals: Approval[];
  inventory: Inventory[];
  auditLogs: AuditLog[];
  metrics: EnterpriseMetric;
  recentAlerts: RealtimeAlert[];
  realtimeAlerts: RealtimeAlert[];
  dismissAlert: (id: string) => void;
  triggerSupplierDelayDemo: () => void;
  refreshData: () => void;
  unreadCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([...store.data.incidents]);
  const [notifications, setNotifications] = useState<Notification[]>([...store.data.notifications]);
  const [approvals, setApprovals] = useState<Approval[]>([...store.data.approvals]);
  const [inventory, setInventory] = useState<Inventory[]>([...store.data.inventory]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([...store.data.audit_logs]);
  const [metrics, setMetrics] = useState<EnterpriseMetric>({ ...store.data.enterprise_metrics });
  const [recentAlerts, setRecentAlerts] = useState<RealtimeAlert[]>([]);

  const refreshData = useCallback(() => {
    setIncidents([...store.data.incidents]);
    setNotifications([...store.data.notifications]);
    setApprovals([...store.data.approvals]);
    setInventory([...store.data.inventory]);
    setAuditLogs([...store.data.audit_logs]);
    setMetrics({ ...store.data.enterprise_metrics });
  }, []);

  const pushAlert = useCallback((alert: Omit<RealtimeAlert, 'id' | 'timestamp'>) => {
    const newAlert: RealtimeAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setRecentAlerts(prev => [newAlert, ...prev.slice(0, 3)]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setRecentAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 6500);
  }, []);

  const dismissAlert = (id: string) => {
    setRecentAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerSupplierDelayDemo = () => {
    store.triggerSupplierDelayScenario();
    refreshData();
    pushAlert({
      type: 'DELIVERY',
      title: '🚨 Supplier Delay Automation Triggered',
      message: 'PO #8942 delayed (+48h). Risk calculated: 243 orders / ₹8.4L revenue at risk. Pune Incident auto-created.',
      severity: 'CRITICAL',
    });
  };

  useEffect(() => {
    // 1. Subscribe to reactive store events
    const unsubIncidents = store.subscribe('incidents', (payload) => {
      setIncidents([...store.data.incidents]);
      if (payload.eventType === 'INSERT' && payload.new?.priority === 'CRITICAL') {
        pushAlert({
          type: 'INCIDENT',
          title: `CRITICAL Incident ${payload.new.incident_number}`,
          message: payload.new.title,
          severity: 'CRITICAL',
        });
      }
    });

    const unsubNotifications = store.subscribe('notifications', (payload) => {
      setNotifications([...store.data.notifications]);
      if (payload.eventType === 'INSERT') {
        pushAlert({
          type: 'SYSTEM',
          title: payload.new.title,
          message: payload.new.message,
          severity: payload.new.severity,
        });
      }
    });

    const unsubApprovals = store.subscribe('approvals', () => {
      setApprovals([...store.data.approvals]);
    });

    const unsubInventory = store.subscribe('inventory', () => {
      setInventory([...store.data.inventory]);
    });

    const unsubAudit = store.subscribe('audit_logs', () => {
      setAuditLogs([...store.data.audit_logs]);
    });

    const unsubMetrics = store.subscribe('enterprise_metrics', () => {
      setMetrics({ ...store.data.enterprise_metrics });
    });

    // 2. Fetch live incidents from Supabase if table is populated
    fetchIncidentsFromSupabase().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        console.log(`[Supabase] Loaded ${res.data.length} incidents from Supabase backend`);
        // Merge Supabase incidents with local store
        const supabaseIncidents = res.data;
        const localExistingIds = new Set(store.data.incidents.map(i => i.id));
        
        // Add any incidents from Supabase that are not already local
        let addedCount = 0;
        supabaseIncidents.forEach(remoteInc => {
          if (!localExistingIds.has(remoteInc.id)) {
            store.data.incidents.unshift(remoteInc);
            addedCount++;
          }
        });

        if (addedCount > 0) {
          store.calculateHealthMetrics();
          refreshData();
        }
      }
    }).catch(err => {
      console.log('[Supabase] Initial fetch note:', err.message);
    });

    // 3. Subscribe to live Supabase Realtime channel
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('public:incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload: any) => {
        console.log('[Supabase Realtime Incident Event]:', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const exists = store.data.incidents.some(i => i.id === payload.new.id);
          if (!exists) {
            store.data.incidents.unshift(payload.new as Incident);
            store.calculateHealthMetrics();
            refreshData();
            pushAlert({
              type: 'INCIDENT',
              title: `Supabase Cloud: Incident ${payload.new.incident_number || 'Created'}`,
              message: payload.new.title || 'New incident synced from Supabase backend',
              severity: payload.new.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            });
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const idx = store.data.incidents.findIndex(i => i.id === payload.new.id);
          if (idx !== -1) {
            store.data.incidents[idx] = { ...store.data.incidents[idx], ...payload.new };
            store.calculateHealthMetrics();
            refreshData();
          }
        } else if (payload.eventType === 'DELETE' && payload.old) {
          store.data.incidents = store.data.incidents.filter(i => i.id !== payload.old.id);
          store.calculateHealthMetrics();
          refreshData();
        }
      })
      .subscribe();

    return () => {
      unsubIncidents();
      unsubNotifications();
      unsubApprovals();
      unsubInventory();
      unsubAudit();
      unsubMetrics();
      supabase.removeChannel(channel);
    };
  }, [pushAlert, refreshData]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <RealtimeContext.Provider
      value={{
        incidents: incidents || [],
        notifications: notifications || [],
        approvals: approvals || [],
        inventory: inventory || [],
        auditLogs: auditLogs || [],
        metrics: metrics || { enterprise_health: 78, inventory_health: 64, critical_incidents: 1, workforce_availability: 96 },
        recentAlerts: recentAlerts || [],
        realtimeAlerts: recentAlerts || [],
        dismissAlert,
        triggerSupplierDelayDemo,
        refreshData,
        unreadCount,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
