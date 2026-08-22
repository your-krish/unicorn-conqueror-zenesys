import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SEED_PROFILES } from '../../lib/seed-data';

export const WorkforceViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Human Capital & Shift Rosters
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
            <span className="text-[11px] text-[var(--text-metadata)]">PostgreSQL Profiles & Shifts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 font-editorial">
            Workforce & Shift Matrix
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>48 of 50 Personnel Active (96%)</span>
        </div>
      </div>

      {/* Profile Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEED_PROFILES.map(profile => (
          <div key={profile.id} className="spotlight-card p-5 rounded-3xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[var(--border-hairline)]"
              />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{profile.full_name}</h4>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-emerald-600 dark:text-emerald-400 font-bold border border-[var(--border-hairline)]">
                  {profile.role_code}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1.5 text-xs text-[var(--text-muted)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-metadata)]">Email:</span>
                <span className="text-[var(--text-primary)] truncate">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-metadata)]">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> On Shift (Pune HQ)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
