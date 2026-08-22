import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Role, Department, Organization, RoleCode } from '../types';
import { store } from '../lib/store';
import { SEED_PROFILES, SEED_ROLES, SEED_DEPARTMENTS, SEED_ORGANIZATION } from '../lib/seed-data';
import { 
  getSupabaseClient, 
  signInWithGoogleViaSupabase, 
  signOutViaSupabase, 
  getRoleForEmail,
  getAccountRoleMappings,
  saveAccountRoleMapping,
  removeAccountRoleMapping,
  AccountRoleMapping
} from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: Role | null;
  department: Department | null;
  organization: Organization | null;
  isLoading: boolean;
  canAccessAdmin: boolean;
  isCEO: boolean;
  isAdmin: boolean;
  accountRoleMappings: AccountRoleMapping[];
  switchDemoRole: (roleCode: RoleCode) => void;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  simulateGoogleSignIn: (email: string, name?: string) => void;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  updateAccountRole: (email: string, role: 'CEO' | 'ADMIN', notes?: string) => void;
  deleteAccountRole: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_ACTIVE_PROFILE = 'stratiq_active_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with stored user profile or null for separate login page
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_ACTIVE_PROFILE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    // Return null to show separate login page if unauthenticated
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [accountRoleMappings, setAccountRoleMappings] = useState<AccountRoleMapping[]>(() => getAccountRoleMappings());

  // Listen to Supabase OAuth session changes & cross-window synchronization
  useEffect(() => {
    const supabase = getSupabaseClient();

    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const hasCode = url.searchParams.has('code');
          const hasHashToken = window.location.hash.includes('access_token');
          const hasError = url.searchParams.has('error') || window.location.hash.includes('error');

          if (hasError) {
            console.warn('[Supabase OAuth] Callback error detected:', window.location.href);
          }

          // Handle PKCE code exchange
          if (hasCode) {
            try {
              const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
              if (data?.session?.user) {
                handleSupabaseUserLogin(data.session.user);
                if (window.opener && window.opener !== window) {
                  try {
                    window.opener.postMessage({ type: 'STRATIQ_SUPABASE_LOGIN', user: data.session.user }, '*');
                    window.close();
                    return;
                  } catch {
                    // ignore
                  }
                }
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
              }
            } catch (exchangeErr) {
              console.log('[Supabase Auth] Code exchange fallback:', exchangeErr);
            }
          }

          // Handle Implicit hash token
          if (hasHashToken) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
              handleSupabaseUserLogin(data.session.user);
              if (window.opener && window.opener !== window) {
                try {
                  window.opener.postMessage({ type: 'STRATIQ_SUPABASE_LOGIN', user: data.session.user }, '*');
                  window.close();
                  return;
                } catch {
                  // ignore
                }
              }
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          }
        }

        // Standard session verification
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.email) {
          handleSupabaseUserLogin(session.user);
        } else if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_ACTIVE_PROFILE);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.email) {
                setCurrentUser(parsed);
              }
            } catch {
              // fallback
            }
          }
        }
      } catch (err) {
        console.log('[Supabase Auth] Session init check notice:', err);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email);
      if (session?.user && session.user.email) {
        handleSupabaseUserLogin(session.user);
      }
    });

    // Handle cross-window popup messages
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STRATIQ_SUPABASE_LOGIN' && event.data.user) {
        handleSupabaseUserLogin(event.data.user);
      }
    };
    window.addEventListener('message', handleWindowMessage);

    // Handle cross-tab storage updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_ACTIVE_PROFILE && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Re-check when window refocuses after popup
    const handleFocus = () => initAuth();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('message', handleWindowMessage);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const handleSupabaseUserLogin = (sbUser: any) => {
    const email = sbUser.email || '';
    const assignedRoleCode = getRoleForEmail(email);
    const defaultName = assignedRoleCode === 'CEO' 
      ? 'Krish Lahre' 
      : (email.split('@')[0] || 'Enterprise Admin');

    const fullName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || defaultName;
    const avatar = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || (
      assignedRoleCode === 'CEO'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
    );

    const googleProfile: Profile = {
      id: `google-${sbUser.id || Date.now()}`,
      organization_id: SEED_ORGANIZATION.id,
      full_name: fullName,
      email: email,
      avatar_url: avatar,
      role_id: assignedRoleCode === 'ADMIN' ? 'role-admin' : 'role-ceo',
      role_code: assignedRoleCode,
      department_id: 'dept-operations',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentUser(googleProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(googleProfile));
    }

    store.logAudit(
      googleProfile.id,
      'GOOGLE_AUTH_LOGIN',
      'AUTH',
      googleProfile.id,
      null,
      { email, assigned_role: assignedRoleCode }
    );
  };

  const currentRole = currentUser 
    ? SEED_ROLES.find(r => r.code === currentUser.role_code) || (currentUser.role_code === 'ADMIN' ? SEED_ROLES.find(r => r.code === 'ADMIN') : SEED_ROLES.find(r => r.code === 'CEO')) || SEED_ROLES[0]
    : null;

  const currentDept = currentUser
    ? SEED_DEPARTMENTS.find(d => d.id === currentUser.department_id) || SEED_DEPARTMENTS[0]
    : null;

  const currentOrg = SEED_ORGANIZATION;

  // Exact Role Checks based on user intent:
  // For admin view, the admin management panel should be visible
  // For ceo account, NO admin management panel
  const isAdmin = currentUser?.role_code === 'ADMIN';
  const isCEO = currentUser?.role_code === 'CEO';
  const canAccessAdmin = isAdmin; // Only ADMIN role gets the Admin Management panel!

  const switchDemoRole = (roleCode: RoleCode) => {
    const targetProfile = SEED_PROFILES.find(p => p.role_code === roleCode);
    if (targetProfile) {
      setCurrentUser(targetProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(targetProfile));
      }
      store.logAudit(
        targetProfile.id,
        'DEMO_ROLE_SWITCHED',
        'AUTH',
        targetProfile.id,
        { previous_role: currentUser?.role_code },
        { current_role: roleCode, user_name: targetProfile.full_name }
      );
    }
  };

  const simulateGoogleSignIn = (email: string, name?: string) => {
    const assignedRoleCode = getRoleForEmail(email);
    const isDefaultAccount = email.toLowerCase() === 'krishlahre49@gmail.com';
    const resolvedName = name || (isDefaultAccount ? 'Krish Lahre' : (email.split('@')[0] + ' (Admin Lead)'));
    
    const mockGoogleProfile: Profile = {
      id: `google-sim-${Date.now()}`,
      organization_id: SEED_ORGANIZATION.id,
      full_name: resolvedName,
      email: email,
      avatar_url: assignedRoleCode === 'ADMIN' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
      role_id: assignedRoleCode === 'ADMIN' ? 'role-admin' : 'role-ceo',
      role_code: assignedRoleCode,
      department_id: 'dept-operations',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentUser(mockGoogleProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(mockGoogleProfile));
    }
    store.logAudit(
      mockGoogleProfile.id,
      'GOOGLE_AUTH_SESSION_SWITCHED',
      'AUTH',
      mockGoogleProfile.id,
      null,
      { email, assigned_role: assignedRoleCode }
    );
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogleViaSupabase();
      setIsLoading(false);
      return res;
    } catch (err: any) {
      setIsLoading(false);
      return { error: err.message || 'Google Auth failed' };
    }
  };

  const signInWithEmail = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const found = SEED_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(found));
        }
        setIsLoading(false);
        return { success: true };
      }

      // Check if email has custom role assignment
      const assignedRole = getRoleForEmail(email);
      const customProfile: Profile = {
        id: `user-${Date.now()}`,
        organization_id: SEED_ORGANIZATION.id,
        full_name: email.split('@')[0],
        email: email,
        avatar_url: assignedRole === 'ADMIN' 
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
        role_id: assignedRole === 'ADMIN' ? 'role-admin' : 'role-ceo',
        role_code: assignedRole,
        department_id: 'dept-operations',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentUser(customProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(customProfile));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const signOut = async () => {
    try {
      await signOutViaSupabase();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
    }
  };

  const updateAccountRole = (email: string, role: 'CEO' | 'ADMIN', notes = '') => {
    const updated = saveAccountRoleMapping(email, role, notes);
    setAccountRoleMappings([...updated]);
    // If current logged in user email matches, update their active role immediately
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      const updatedProfile = {
        ...currentUser,
        role_code: role,
        role_id: role === 'ADMIN' ? 'role-admin' : 'role-ceo',
      };
      setCurrentUser(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(updatedProfile));
      }
    }
  };

  const deleteAccountRole = (email: string) => {
    const updated = removeAccountRoleMapping(email);
    setAccountRoleMappings([...updated]);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false;
    if (isAdmin) return true; // Admins have unrestricted permissions
    if (isCEO) {
      // CEO has executive permissions but NOT admin management panel
      if (permission === 'admin' || permission === 'admin:management') return false;
      return true;
    }
    return currentRole.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentRole,
        department: currentDept,
        organization: currentOrg,
        isLoading,
        canAccessAdmin,
        isCEO,
        isAdmin,
        accountRoleMappings,
        switchDemoRole,
        signInWithGoogle,
        signInWithEmail,
        simulateGoogleSignIn,
        signOut,
        hasPermission,
        updateAccountRole,
        deleteAccountRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
