import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { store, liveSupabase, isSupabaseConfigured } from '../lib/supabase';
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

    // 2. If live Supabase is configured, subscribe to Supabase Realtime channel
    if (isSupabaseConfigured && liveSupabase) {
      const channel = liveSupabase
        .channel('public:schema_events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
          refreshData();
        })
        .subscribe();

      return () => {
        unsubIncidents();
        unsubNotifications();
        unsubApprovals();
        unsubInventory();
        unsubAudit();
        unsubMetrics();
        liveSupabase?.removeChannel(channel);
      };
    }

    return () => {
      unsubIncidents();
      unsubNotifications();
      unsubApprovals();
      unsubInventory();
      unsubAudit();
      unsubMetrics();
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
