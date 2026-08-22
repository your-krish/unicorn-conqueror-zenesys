import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Search, ShieldCheck, ChevronDown, LogOut, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeSelector } from '../common/ThemeSelector';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  onOpenIncidentDetail: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSearch, 
  onOpenIncidentDetail 
}) => {
  const { user, isCEO, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { notifications, unreadCount } = useRealtime();

  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [hasPreviewedNotifications, setHasPreviewedNotifications] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileOverlay(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // When opening notification panel, dismiss unread badge counter
  const handleToggleNotifications = () => {
    if (!showNotifDropdown) {
      setHasPreviewedNotifications(true);
    }
    setShowNotifDropdown(prev => !prev);
  };

  const displayedUnreadCount = hasPreviewedNotifications ? 0 : unreadCount;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--bg-canvas)]/85 border-b border-[var(--border-hairline)] transition-colors duration-200 shadow-sm shadow-black/5 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Identity with Custom Isometric Quantum Operations Logo */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-indigo-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-10 w-10 rounded-2xl bg-[var(--bg-surface)] border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
              <BrandLogo className="h-full w-full object-cover transform scale-105" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-[var(--text-primary)] to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent">
                STRATIQ
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-metadata)] font-medium">
              Enterprise Operations OS
            </p>
          </div>
        </div>

        {/* Center: Clean Minimalist Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center px-4 py-2 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] hover:border-emerald-500/50 focus:outline-none focus:border-emerald-500 shadow-sm transition-all text-xs group cursor-pointer"
            title="Search operations, incidents, inventory, POs"
          >
            <div className="flex items-center gap-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] min-w-0 w-full">
              <Search className="h-4 w-4 text-[var(--text-metadata)] group-hover:text-emerald-500 transition-colors shrink-0" />
              <span className="truncate text-left font-normal text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                Search operations, incidents, inventory, suppliers...
              </span>
            </div>
          </button>
        </div>

        {/* Right: Liquid Glass Theme Switcher, Notifications & Executive Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Liquid Glass Theme Switcher: Light / System / Dark */}
          <div className="hidden sm:block">
            <ThemeSelector />
          </div>

          <div className="sm:hidden">
            <ThemeSelector compact={true} />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleToggleNotifications}
              className={`relative p-2 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                showNotifDropdown 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {displayedUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 animate-pulse font-mono">
                  {displayedUnreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border-hairline)]">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Realtime Notifications</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Live Feed
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                      No new operational alerts. All systems running nominal.
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.entity_type === 'incidents' && notif.entity_id) {
                            onOpenIncidentDetail(notif.entity_id);
                          }
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          notif.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15'
                            : notif.severity === 'WARNING'
                            ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                            : 'bg-[var(--bg-surface-elevated)] border-[var(--border-hairline)] hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${
                            notif.severity === 'CRITICAL' ? 'text-rose-500 dark:text-rose-400' :
                            notif.severity === 'WARNING' ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-primary)]'
                          }`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-[var(--text-metadata)] font-mono whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] text-[11px] mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Profile Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileOverlay(!showProfileOverlay)}
              className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] hover:border-emerald-500/50 transition-all text-left group cursor-pointer shadow-sm"
              title="Google Account & Role View"
            >
              <div className="relative">
                <img
                  src={user?.avatar_url || (isAdmin 
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80')}
                  alt={user?.full_name || 'User'}
                  className={`h-7 w-7 rounded-full object-cover ring-2 ${isAdmin ? 'ring-amber-500/80' : 'ring-emerald-500/80'}`}
                />
                <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-[var(--bg-surface)] ${isAdmin ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </div>
              
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 leading-none">
                  <span className="truncate max-w-[110px]">{user?.full_name?.split(' ')[0] || 'User'}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono uppercase font-bold border ${
                    isAdmin 
                      ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/30' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isAdmin ? 'ADMIN' : 'CEO'}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-metadata)] mt-0.5 leading-none font-mono truncate max-w-[130px]">
                  {isAdmin ? 'Admin View Active' : 'CEO View (No Admin)'}
                </div>
              </div>

              <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-metadata)] group-hover:text-[var(--text-primary)] transition-transform ${showProfileOverlay ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* Authenticated Google Account Profile Dropdown */}
            {showProfileOverlay && (
              <div className="absolute right-0 mt-2.5 w-84 sm:w-96 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
                
                {/* Active User Card Header */}
                <div className="flex items-start justify-between border-b border-[var(--border-hairline)] pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user?.avatar_url || (isAdmin 
                          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80')}
                        alt={user?.full_name || 'Account'}
                        className={`h-12 w-12 rounded-2xl object-cover ring-2 shadow-md ${
                          isAdmin ? 'ring-amber-500 shadow-amber-500/20' : 'ring-emerald-500 shadow-emerald-500/20'
                        }`}
                      />
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 text-neutral-950 font-bold text-[8px] font-mono rounded-full ${
                        isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        {user?.role_code || 'CEO'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.full_name}</h3>
                        <ShieldCheck className={`h-4 w-4 shrink-0 ${isAdmin ? 'text-amber-500' : 'text-emerald-500'}`} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] font-medium truncate">
                        {isAdmin ? 'System Administrator (Full Admin Access)' : 'Chief Executive Officer (Strategic View)'}
                      </p>
                      <p className="text-[10px] text-[var(--text-metadata)] font-mono mt-0.5 truncate max-w-[210px]">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Google Account Switcher Action */}
                <div className="space-y-2 pt-1">
                  <button
                    disabled={isSigningIn}
                    onClick={async () => {
                      setIsSigningIn(true);
                      await signInWithGoogle();
                      setIsSigningIn(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-canvas)] border border-[var(--border-hairline)] hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {isSigningIn ? 'Connecting to Google...' : 'Switch Google Account'}
                        </div>
                        <div className="text-[10px] text-[var(--text-metadata)]">Real Supabase Google OAuth</div>
                      </div>
                    </div>
                    <RefreshCw className={`h-4 w-4 text-[var(--text-metadata)] group-hover:text-emerald-500 transition-colors ${isSigningIn ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Footer Controls: Sign Out & Close */}
                <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center gap-2">
                  <button
                    onClick={() => {
                      signOut();
                      setShowProfileOverlay(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => setShowProfileOverlay(false)}
                    className="py-2.5 px-4 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold rounded-2xl border border-[var(--border-hairline)] transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
