import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Search, Shield, ChevronDown, CheckCircle2, 
  User, Check, X, ShieldCheck, Sparkles, Building, 
  Lock, Key, ExternalLink, Activity, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  onOpenIncidentDetail: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSearch, 
  onOpenIncidentDetail 
}) => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useRealtime();

  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [hasPreviewedNotifications, setHasPreviewedNotifications] = useState(false);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-white/[0.08] transition-all duration-300 shadow-sm shadow-black/40 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Refined High-End Brand Identity (No version clutter) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider text-white">STRATIQ</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-medium">
              OPERATIONS OS
            </p>
          </div>
        </div>

        {/* Center: Clean Google-style Search Bar with Responsive Alignment */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:outline-none focus:border-amber-500/50 shadow-inner transition-all text-xs group cursor-pointer"
            title="Search operations, incidents, inventory, POs (⌘K)"
          >
            <div className="flex items-center gap-3 text-neutral-400 group-hover:text-neutral-300 min-w-0">
              <Search className="h-4 w-4 text-neutral-400 group-hover:text-amber-400 transition-colors shrink-0" />
              <span className="truncate text-left font-normal text-xs text-neutral-400 group-hover:text-neutral-300">
                Search operations, incidents, inventory, suppliers...
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-400 border border-white/5 font-mono">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Notifications & CEO Executive Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notifications Dropdown with Outside-Click Listener & Preview Auto-Dismiss */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleToggleNotifications}
              className={`relative p-2 rounded-full border transition-all ${
                showNotifDropdown 
                  ? 'bg-neutral-800 border-amber-500/40 text-amber-300' 
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-white/10 text-neutral-300 hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {displayedUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-600/50 animate-pulse">
                  {displayedUnreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl glass-panel bg-neutral-900/95 border border-white/15 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Realtime Notifications</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Feed
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
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
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          notif.severity === 'CRITICAL'
                            ? 'bg-rose-950/30 border-rose-500/30 hover:bg-rose-950/50'
                            : notif.severity === 'WARNING'
                            ? 'bg-amber-950/30 border-amber-500/30 hover:bg-amber-950/50'
                            : 'bg-neutral-800/40 border-white/5 hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${
                            notif.severity === 'CRITICAL' ? 'text-rose-300' :
                            notif.severity === 'WARNING' ? 'text-amber-300' : 'text-neutral-200'
                          }`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-neutral-300 text-[11px] mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CEO Executive Profile Only & Refined Overlay with Outside-Click Listener */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileOverlay(!showProfileOverlay)}
              className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 border border-amber-500/30 hover:border-amber-500/60 transition-all text-left group cursor-pointer shadow-sm"
              title="Chief Executive Officer Profile"
            >
              <div className="relative">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={user?.full_name || 'CEO'}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-amber-400/80"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-neutral-950"></span>
              </div>
              
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5 leading-none">
                  <span>Alexander Vance</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono uppercase font-bold border border-amber-500/40">
                    CEO
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 leading-none font-mono">
                  Executive Command
                </div>
              </div>

              <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-transform ${showProfileOverlay ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {/* Refined Executive CEO Profile Card Overlay */}
            {showProfileOverlay && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-88 rounded-2xl glass-panel bg-neutral-900/95 border border-amber-500/20 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
                
                {/* Executive Card Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={user?.full_name || 'CEO'}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-amber-400 shadow-md shadow-amber-500/10"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-amber-400 text-neutral-950 font-bold text-[8px] font-mono rounded">
                        CEO
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white">Alexander Vance</h3>
                        <ShieldCheck className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-neutral-300 font-medium">Chief Executive Officer</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">alexander.vance@stratiq-enterprise.com</p>
                    </div>
                  </div>
                </div>

                {/* Executive Credentials & Clearances */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Security Clearance:</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        LEVEL 5 • UNRESTRICTED
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Organization:</span>
                      <span className="text-neutral-200 font-medium">Stratiq Global Operations HQ</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Governance Scope:</span>
                      <span className="text-amber-300 font-medium">Full Multi-Site Authority</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium text-[11px]">Command Session Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Encrypted</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowProfileOverlay(false)}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                  >
                    Close Profile
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

