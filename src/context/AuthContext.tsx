import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Role, Department, Organization, RoleCode } from '../types';
import { store, liveSupabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_PROFILES, SEED_ROLES, SEED_DEPARTMENTS, SEED_ORGANIZATION } from '../lib/seed-data';

interface AuthContextType {
  user: Profile | null;
  role: Role | null;
  department: Department | null;
  organization: Organization | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  switchDemoRole: (roleCode: RoleCode) => void;
  signInWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to CEO for rich command center experience out-of-the-box
  const [currentUser, setCurrentUser] = useState<Profile | null>(SEED_PROFILES[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync Supabase Auth listener if live connection active
  useEffect(() => {
    if (isSupabaseConfigured && liveSupabase) {
      liveSupabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          const matchedProfile = SEED_PROFILES.find(p => p.email.toLowerCase() === session.user.email?.toLowerCase());
          if (matchedProfile) setCurrentUser(matchedProfile);
        }
      });

      const { data: { subscription } } = liveSupabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          const matchedProfile = SEED_PROFILES.find(p => p.email.toLowerCase() === session.user.email?.toLowerCase());
          if (matchedProfile) setCurrentUser(matchedProfile);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const currentRole = currentUser 
    ? SEED_ROLES.find(r => r.code === currentUser.role_code) || SEED_ROLES[0]
    : null;

  const currentDept = currentUser
    ? SEED_DEPARTMENTS.find(d => d.id === currentUser.department_id) || SEED_DEPARTMENTS[0]
    : null;

  const currentOrg = SEED_ORGANIZATION;

  const switchDemoRole = (roleCode: RoleCode) => {
    const targetProfile = SEED_PROFILES.find(p => p.role_code === roleCode);
    if (targetProfile) {
      setCurrentUser(targetProfile);
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

  const signInWithEmail = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && liveSupabase) {
        const { data, error } = await liveSupabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }

      // Check matched profile
      const found = SEED_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'User profile not found in directory.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && liveSupabase) {
      await liveSupabase.auth.signOut();
    }
    // Switch to employee or prompt login
    setCurrentUser(SEED_PROFILES[3]); // Ops manager default or null
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false;
    if (currentRole.permissions.includes('all') || currentRole.permissions.includes('admin')) return true;
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
        isSupabaseLive: isSupabaseConfigured,
        switchDemoRole,
        signInWithEmail,
        signOut,
        hasPermission,
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
