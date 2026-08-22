import React from 'react';
import { Users, Clock, MapPin, Calendar, CheckCircle2, Shield } from 'lucide-react';
import { SEED_PROFILES, SEED_LOCATIONS } from '../../lib/seed-data';

export const WorkforceViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Human Capital & Shift Rosters
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600"></span>
            <span className="text-[11px] text-neutral-400">PostgreSQL Profiles & Shifts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 font-editorial">
            Workforce & Shift Matrix
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
          <span>48 of 50 Personnel Active (96%)</span>
        </div>
      </div>

      {/* Profile Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEED_PROFILES.map(profile => (
          <div key={profile.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/20"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{profile.full_name}</h4>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 font-semibold">
                  {profile.role_code}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Email:</span>
                <span className="text-neutral-300 truncate">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Status:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> On Shift (Pune HQ)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
