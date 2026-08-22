import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

interface RealtimeAlertToastsProps {
  onOpenIncidentDetail: (id: string) => void;
}

export const RealtimeAlertToasts: React.FC<RealtimeAlertToastsProps> = ({ onOpenIncidentDetail }) => {
  const realtime = useRealtime();
  const alerts = realtime.recentAlerts || (realtime as any).realtimeAlerts || [];
  const dismissAlert = realtime.dismissAlert;

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {alerts.map(alert => {
        const isCritical = alert.severity === 'CRITICAL';
        const isWarning = alert.severity === 'WARNING';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl transition-all animate-in slide-in-from-bottom-3 duration-200 bg-[var(--bg-surface)] ${
              isCritical
                ? 'border-rose-500/50 shadow-rose-950/20 text-rose-500'
                : isWarning
                ? 'border-amber-500/50 shadow-amber-950/20 text-amber-500'
                : 'border-emerald-500/50 text-emerald-500'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {isCritical ? (
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5 animate-pulse" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{alert.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{alert.message}</p>
                  {alert.entity_id && alert.entity_type === 'incidents' && (
                    <button
                      onClick={() => onOpenIncidentDetail(alert.entity_id!)}
                      className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Open Incident & SLA →
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 rounded-xl text-[var(--text-metadata)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
