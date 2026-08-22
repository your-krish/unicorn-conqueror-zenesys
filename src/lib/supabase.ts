import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incident } from '../types';

// Default Supabase project credentials provided by user
export const DEFAULT_SUPABASE_PROJECT_ID = 'lpfkcjmxwvshgctutsfz';
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_COlBkBui6S-Vs9fKgpZkzg_o2lFp8wW';

// Storage keys for optional custom overrides
const STORAGE_URL_KEY = 'stratiq_supabase_url';
const STORAGE_ANON_KEY = 'stratiq_supabase_anon_key';

export function getActiveSupabaseConfig() {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) : null;

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  const url = customUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = customKey || envKey || DEFAULT_SUPABASE_ANON_KEY;
  const projectId = url.includes('.supabase.co') ? url.split('https://')[1]?.split('.supabase.co')[0] : DEFAULT_SUPABASE_PROJECT_ID;

  return { url, anonKey, projectId };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getActiveSupabaseConfig();
  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseInstance;
}

export function updateSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem(STORAGE_URL_KEY, url);
      localStorage.setItem(STORAGE_ANON_KEY, anonKey);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_ANON_KEY);
    }
  }
  supabaseInstance = null; // Reinitialize on next call
  return getSupabaseClient();
}

/**
 * Save / Upsert Incident to Supabase backend table 'incidents'
 */
export async function saveIncidentToSupabase(incident: Partial<Incident>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    // Prepare clean row payload matching Supabase table schema
    const payload: Record<string, any> = {
      id: incident.id || `inc-${Date.now()}`,
      title: incident.title || 'Untitled Incident',
      description: incident.description || '',
      priority: incident.priority || 'HIGH',
      status: incident.status || 'DETECTED',
      department_id: incident.department_id || null,
      location_id: incident.location_id || null,
      owner_id: incident.owner_id || null,
      impact: incident.impact || 'Standard operational alert',
      affected_orders: Number(incident.affected_orders) || 0,
      revenue_impact: Number(incident.revenue_impact) || 0,
      incident_number: incident.incident_number || `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      updated_at: new Date().toISOString(),
    };

    if (incident.organization_id) {
      payload.organization_id = incident.organization_id;
    }
    if (incident.created_at) {
      payload.created_at = incident.created_at;
    } else {
      payload.created_at = new Date().toISOString();
    }
    if (incident.resolved_at) {
      payload.resolved_at = incident.resolved_at;
    }

    const { data, error } = await supabase
      .from('incidents')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase incident upsert notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Error saving incident to Supabase:', err);
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

/**
 * Update Incident in Supabase
 */
export async function updateIncidentInSupabase(id: string, updates: Partial<Incident>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const payload: Record<string, any> = { ...updates, updated_at: new Date().toISOString() };
    
    // Remove nested relational objects if present before sending to Postgres
    delete payload.department;
    delete payload.location;
    delete payload.owner;
    delete payload.sla;

    const { data, error } = await supabase
      .from('incidents')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      console.warn('Supabase incident update notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Error updating incident in Supabase:', err);
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

/**
 * Delete Incident from Supabase table
 */
export async function deleteIncidentFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase incident delete notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error deleting incident from Supabase:', err);
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

/**
 * Fetch live incidents from Supabase table
 */
export async function fetchIncidentsFromSupabase(): Promise<{ success: boolean; data?: Incident[]; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Incident[] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, it's still reachable
      if (error.code === '42P01' || error.message.includes('relation "public.incidents" does not exist')) {
        return {
          connected: true,
          message: 'Connected to Supabase project! (Table "incidents" needs SQL initialization schema)',
          details: { tableMissing: true },
        };
      }
      return {
        connected: false,
        message: `Supabase returned: ${error.message} (Code: ${error.code})`,
        details: error,
      };
    }

    return {
      connected: true,
      message: `Successfully connected to Supabase backend! Found ${count ?? 0} incidents in database.`,
      details: { rowCount: count },
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Connection attempt failed',
    };
  }
}

/**
 * Email to Role Permission Mapping for Google / Supabase authenticated accounts
 */
const ACCOUNT_ROLE_MAPPINGS_KEY = 'stratiq_account_role_mappings';

export interface AccountRoleMapping {
  email: string;
  role: 'CEO' | 'ADMIN';
  assignedBy?: string;
  notes?: string;
  updatedAt: string;
}

const DEFAULT_ROLE_MAPPINGS: AccountRoleMapping[] = [
  {
    email: 'krishlahre49@gmail.com',
    role: 'CEO',
    notes: 'Default Primary Google Account (CEO Strategic View - No Admin Panel)',
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'ceo.google@gmail.com',
    role: 'CEO',
    notes: 'Chief Executive Officer (Strategic View)',
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'admin.ops@gmail.com',
    role: 'ADMIN',
    notes: 'Enterprise Admin Google Account (Admin View + Admin Management)',
    updatedAt: new Date().toISOString(),
  },
  {
    email: 'admin@stratiq.enterprise',
    role: 'ADMIN',
    notes: 'Enterprise SysAdmin Account',
    updatedAt: new Date().toISOString(),
  }
];

export function getAccountRoleMappings(): AccountRoleMapping[] {
  if (typeof window === 'undefined') return DEFAULT_ROLE_MAPPINGS;
  try {
    const raw = localStorage.getItem(ACCOUNT_ROLE_MAPPINGS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNT_ROLE_MAPPINGS_KEY, JSON.stringify(DEFAULT_ROLE_MAPPINGS));
      return DEFAULT_ROLE_MAPPINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ROLE_MAPPINGS;
  }
}

export function saveAccountRoleMapping(email: string, role: 'CEO' | 'ADMIN', notes = ''): AccountRoleMapping[] {
  const current = getAccountRoleMappings();
  const normalizedEmail = email.trim().toLowerCase();
  const existingIdx = current.findIndex(m => m.email.toLowerCase() === normalizedEmail);

  if (existingIdx !== -1) {
    current[existingIdx] = {
      ...current[existingIdx],
      role,
      notes: notes || current[existingIdx].notes,
      updatedAt: new Date().toISOString(),
    };
  } else {
    current.push({
      email: normalizedEmail,
      role,
      notes: notes || `Custom permission mapping for ${normalizedEmail}`,
      updatedAt: new Date().toISOString(),
    });
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCOUNT_ROLE_MAPPINGS_KEY, JSON.stringify(current));
  }
  return current;
}

export function removeAccountRoleMapping(email: string): AccountRoleMapping[] {
  const current = getAccountRoleMappings();
  const filtered = current.filter(m => m.email.toLowerCase() !== email.trim().toLowerCase());
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCOUNT_ROLE_MAPPINGS_KEY, JSON.stringify(filtered));
  }
  return filtered;
}

export function getRoleForEmail(email: string): 'CEO' | 'ADMIN' {
  const normalized = email.trim().toLowerCase();
  // Default account is CEO
  if (normalized === 'krishlahre49@gmail.com' || normalized.startsWith('ceo')) {
    return 'CEO';
  }
  const mappings = getAccountRoleMappings();
  const found = mappings.find(m => m.email.toLowerCase() === normalized);
  if (found) return found.role;
  // Any another Google account defaults to ADMIN view with Admin Management!
  return 'ADMIN';
}

/**
 * Sign in with Google via Supabase OAuth (Iframe-safe popup / new tab flow)
 */
export async function signInWithGoogleViaSupabase(options?: { redirectTo?: string }): Promise<{ error?: string; url?: string }> {
  try {
    const supabase = getSupabaseClient();
    const targetRedirect = options?.redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
    
    // Use skipBrowserRedirect: true to avoid Google's iframe 403 embedding block
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.warn('Supabase Google OAuth notice:', error.message);
      return { error: error.message };
    }

    if (data?.url) {
      // Open in external popup / tab so Google doesn't block iframe embedding with 403
      if (typeof window !== 'undefined') {
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          data.url,
          'google_oauth_login',
          `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
        );
        if (!popup) {
          // If popup is blocked by browser, open in new tab
          window.open(data.url, '_blank');
        }
      }
      return { url: data.url };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'Google authentication failed' };
  }
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutViaSupabase(): Promise<{ error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message || 'Sign out failed' };
  }
}

/**
 * SQL Schema definition to help the user if they need to create the table in Supabase SQL editor
 */
export const SUPABASE_SQL_SCHEMA = `-- STRATIQ Enterprise Operations OS - Supabase Incidents Table Schema
-- Run this in your Supabase SQL Editor (Project ID: lpfkcjmxwvshgctutsfz)

create table if not exists public.incidents (
  id text primary key,
  incident_number text not null,
  title text not null,
  description text default '',
  priority text default 'HIGH',
  status text default 'DETECTED',
  department_id text default 'dept-operations',
  location_id text default 'loc-pune-wh',
  owner_id text default 'user-ops-01',
  impact text default 'Standard operational alert',
  affected_orders numeric default 0,
  revenue_impact numeric default 0,
  sla_id text,
  resolved_at timestamp with time zone,
  organization_id text default 'org-stratiq-01',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) and public read/write policy
alter table public.incidents enable row level security;

create policy "Allow all operations on incidents" 
on public.incidents 
for all 
using (true) 
with check (true);

-- Enable Realtime replication for incidents
alter publication supabase_realtime add table public.incidents;
`;
