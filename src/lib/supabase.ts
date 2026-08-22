/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  SEED_ORGANIZATION, SEED_ROLES, SEED_DEPARTMENTS, SEED_LOCATIONS, 
  SEED_PROFILES, SEED_WAREHOUSES, SEED_PRODUCTS, SEED_INVENTORY, 
  SEED_SUPPLIERS, SEED_PURCHASE_ORDERS, SEED_DELIVERIES, SEED_CUSTOMERS, 
  SEED_SALES_ORDERS, SEED_SLAS, SEED_INCIDENTS, SEED_COMMENTS, 
  SEED_APPROVALS, SEED_NOTIFICATIONS, SEED_AUDIT_LOGS, SEED_ENTERPRISE_METRICS 
} from './seed-data';
import { 
  Incident, Inventory, Notification, AuditLog, Approval, 
  Delivery, InventoryTransfer, SLA, EnterpriseMetric,
  Product, Supplier, PurchaseOrder, Warehouse, Profile
} from '../types';

const DEMO_ORG_ID = SEED_ORGANIZATION.id;

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export let liveSupabase: SupabaseClient | null = null;

// Allow storing customized connection URL and Key in localStorage for live direct cloud sync
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_url') || envUrl : envUrl;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_key') || envKey : envKey;

export function checkIsSupabaseConfigured(): boolean {
  const url = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_url') || envUrl : envUrl;
  const key = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_key') || envKey : envKey;
  return Boolean(
    url && 
    url !== 'https://your-project.supabase.co' && 
    key && 
    key !== 'your-anon-key'
  );
}

export const isSupabaseConfigured = checkIsSupabaseConfigured();

export function getActiveSupabaseConfig() {
  const url = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_url') || envUrl : envUrl;
  const key = typeof window !== 'undefined' ? localStorage.getItem('stratiq_supabase_key') || envKey : envKey;
  const isConfigured = checkIsSupabaseConfigured();
  return { url, key, isConfigured, anonKey: key };
}

export function configureLiveSupabase(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('stratiq_supabase_url', url.trim());
      localStorage.setItem('stratiq_supabase_key', key.trim());
    } else {
      localStorage.removeItem('stratiq_supabase_url');
      localStorage.removeItem('stratiq_supabase_key');
    }
  }

  try {
    if (url && key && url !== 'https://your-project.supabase.co') {
      liveSupabase = createClient(url.trim(), key.trim(), {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } else {
      liveSupabase = null;
    }
  } catch (err) {
    console.warn('Failed to reconfigure live Supabase client:', err);
    liveSupabase = null;
  }
}

if (isSupabaseConfigured) {
  try {
    liveSupabase = createClient(storedUrl, storedKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } }
    });
  } catch (err) {
    console.warn('Could not initialize live Supabase client:', err);
  }
}

// Asynchronously sync mutations to the live official Supabase instance when configured
async function syncToLiveSupabase(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: any, matchKey: string = 'id', matchValue?: any) {
  if (!liveSupabase || !isSupabaseConfigured) return;
  try {
    if (action === 'INSERT') {
      const { error } = await liveSupabase.from(table).insert([payload]);
      if (error) {
        console.warn(`[Supabase Cloud Sync] Insert error on table ${table}:`, error.message);
      } else {
        console.log(`[Supabase Cloud Sync] Successfully inserted into ${table} on official Supabase instance.`);
      }
    } else if (action === 'UPDATE') {
      const idVal = matchValue || payload[matchKey];
      if (idVal) {
        const { error } = await liveSupabase.from(table).update(payload).eq(matchKey, idVal);
        if (error) {
          console.warn(`[Supabase Cloud Sync] Update error on table ${table}:`, error.message);
        } else {
          console.log(`[Supabase Cloud Sync] Successfully updated ${table} on official Supabase instance.`);
        }
      }
    } else if (action === 'DELETE') {
      const idVal = matchValue || (payload ? payload[matchKey] : null);
      if (idVal) {
        const { error } = await liveSupabase.from(table).delete().eq(matchKey, idVal);
        if (error) {
          console.warn(`[Supabase Cloud Sync] Delete error on table ${table}:`, error.message);
        } else {
          console.log(`[Supabase Cloud Sync] Successfully deleted from ${table} on official Supabase instance.`);
        }
      }
    }
  } catch (err) {
    console.warn(`[Supabase Cloud Sync] Failed to sync ${action} to official Supabase table ${table}:`, err);
  }
}

/**
 * STRATIQ Reactive State Store (Postgres In-Memory Mirror + Realtime Broadcaster)
 * Provides 100% full relational CRUD, event bus, and deterministic state transitions.
 */
class StratiqReactiveStore {
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  public data = {
    organizations: [{ ...SEED_ORGANIZATION }],
    roles: [...SEED_ROLES],
    departments: [...SEED_DEPARTMENTS],
    locations: [...SEED_LOCATIONS],
    profiles: [...SEED_PROFILES] as Profile[],
    warehouses: [...SEED_WAREHOUSES] as Warehouse[],
    products: [...SEED_PRODUCTS] as Product[],
    inventory: [...SEED_INVENTORY] as Inventory[],
    suppliers: [...SEED_SUPPLIERS] as Supplier[],
    purchase_orders: [...SEED_PURCHASE_ORDERS] as PurchaseOrder[],
    deliveries: [...SEED_DELIVERIES] as Delivery[],
    customers: [...SEED_CUSTOMERS],
    sales_orders: [...SEED_SALES_ORDERS],
    slas: [...SEED_SLAS] as SLA[],
    incidents: [...SEED_INCIDENTS] as Incident[],
    incident_comments: [...SEED_COMMENTS],
    approvals: [...SEED_APPROVALS] as Approval[],
    notifications: [...SEED_NOTIFICATIONS] as Notification[],
    audit_logs: [...SEED_AUDIT_LOGS] as AuditLog[],
    transfers: [] as InventoryTransfer[],
    enterprise_metrics: { ...SEED_ENTERPRISE_METRICS },
  };

  constructor() {
    this.calculateHealthMetrics();
  }

  public subscribe(table: string, callback: (payload: any) => void) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set());
    }
    this.listeners.get(table)!.add(callback);

    return () => {
      this.listeners.get(table)?.delete(callback);
    };
  }

  public broadcast(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: any, oldRecord?: any) {
    const payload = {
      eventType,
      table,
      new: newRecord,
      old: oldRecord,
      commit_timestamp: new Date().toISOString(),
    };
    
    // Notify table subscribers
    this.listeners.get(table)?.forEach(cb => cb(payload));
    // Notify wildcard subscribers
    this.listeners.get('*')?.forEach(cb => cb(payload));
  }

  // Recalculate deterministic Enterprise Health Score (0-100)
  public calculateHealthMetrics() {
    const criticalIncidents = this.data.incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED');
    const delayedDeliveries = this.data.deliveries.filter(d => d.status === 'DELAYED');
    const lowInventory = this.data.inventory.filter(inv => inv.current_stock < inv.minimum_stock);

    let incidentHealth = 98.0;
    if (criticalIncidents.length > 0) {
      incidentHealth = Math.max(30.0, 98.0 - (criticalIncidents.length * 28.0));
    }

    let procurementHealth = 94.0;
    if (delayedDeliveries.length > 0) {
      procurementHealth = Math.max(40.0, 94.0 - (delayedDeliveries.length * 22.0));
    }

    let inventoryHealth = 95.0;
    if (lowInventory.length > 0) {
      inventoryHealth = Math.max(45.0, 95.0 - (lowInventory.length * 18.0));
    }

    const financeHealth = 96.0;
    const workforceHealth = 96.5;
    const salesHealth = 92.0;

    // Weighted Enterprise Health Formula (Requirement 35)
    const combinedScore = (
      (financeHealth * 0.20) +
      (salesHealth * 0.20) +
      (inventoryHealth * 0.20) +
      (procurementHealth * 0.15) +
      (workforceHealth * 0.10) +
      (incidentHealth * 0.15)
    );

    const roundedScore = Number(combinedScore.toFixed(1));

    this.data.enterprise_metrics = {
      ...this.data.enterprise_metrics,
      enterprise_health: roundedScore,
      inventory_health: inventoryHealth,
      critical_incidents: criticalIncidents.length,
      metric_date: new Date().toISOString().split('T')[0],
    };

    this.broadcast('enterprise_metrics', 'UPDATE', this.data.enterprise_metrics);
  }

  // --- ADMIN CRUD METHODS ---

  // INCIDENTS CRUD
  public createIncident(incidentData: Partial<Incident>, createdByUserId: string) {
    const id = `inc-${Date.now()}`;
    const newIncident: Incident = {
      id,
      organization_id: DEMO_ORG_ID,
      incident_number: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: incidentData.title || 'Untitled Incident',
      description: incidentData.description || '',
      priority: incidentData.priority || 'MEDIUM',
      status: incidentData.status || 'DETECTED',
      department_id: incidentData.department_id || 'dept-operations',
      location_id: incidentData.location_id || 'loc-pune-wh',
      owner_id: incidentData.owner_id || createdByUserId,
      impact: incidentData.impact || 'Standard operational alert',
      affected_orders: Number(incidentData.affected_orders) || 0,
      revenue_impact: Number(incidentData.revenue_impact) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.incidents.unshift(newIncident);
    this.calculateHealthMetrics();
    this.broadcast('incidents', 'INSERT', newIncident);
    syncToLiveSupabase('incidents', 'INSERT', newIncident);

    this.logAudit(
      createdByUserId,
      'ADMIN_CREATE_INCIDENT',
      'INCIDENT',
      id,
      null,
      newIncident,
      { title: newIncident.title, priority: newIncident.priority }
    );
    return newIncident;
  }

  public updateIncident(incidentId: string, updates: Partial<Incident>, updatedByUserId: string) {
    const index = this.data.incidents.findIndex(i => i.id === incidentId);
    if (index === -1) return null;

    const prev = { ...this.data.incidents[index] };
    const updated = {
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'RESOLVED' && !updated.resolved_at) {
      updated.resolved_at = new Date().toISOString();
      updated.revenue_impact = 0;
      updated.affected_orders = 0;
    }

    this.data.incidents[index] = updated;
    this.calculateHealthMetrics();
    this.broadcast('incidents', 'UPDATE', updated, prev);
    syncToLiveSupabase('incidents', 'UPDATE', updated, 'id', incidentId);

    this.logAudit(
      updatedByUserId,
      'ADMIN_UPDATE_INCIDENT',
      'INCIDENT',
      incidentId,
      prev,
      updated,
      { modified_fields: Object.keys(updates) }
    );
    return updated;
  }

  public deleteIncident(incidentId: string, deletedByUserId: string) {
    const index = this.data.incidents.findIndex(i => i.id === incidentId);
    if (index === -1) return false;

    const removed = this.data.incidents[index];
    this.data.incidents.splice(index, 1);
    this.calculateHealthMetrics();
    this.broadcast('incidents', 'DELETE', null, removed);
    syncToLiveSupabase('incidents', 'DELETE', removed, 'id', incidentId);

    this.logAudit(
      deletedByUserId,
      'ADMIN_DELETE_INCIDENT',
      'INCIDENT',
      incidentId,
      removed,
      null,
      { incident_number: removed.incident_number }
    );
    return true;
  }

  // PRODUCTS & INVENTORY CRUD
  public createProduct(productData: Partial<Product>, initialStock: { warehouse_id: string; current_stock: number; minimum_stock: number; maximum_stock: number }, userId: string) {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      organization_id: DEMO_ORG_ID,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: productData.name || 'New Product Item',
      category: productData.category || 'Components',
      unit_price: Number(productData.unit_price) || 1000,
      cost_price: Number(productData.cost_price) || 750,
      reorder_point: Number(productData.reorder_point) || 50,
      created_at: new Date().toISOString(),
    };

    this.data.products.unshift(newProduct);
    this.broadcast('products', 'INSERT', newProduct);
    syncToLiveSupabase('products', 'INSERT', newProduct);

    if (initialStock && initialStock.warehouse_id) {
      const newInv: Inventory = {
        id: `inv-${Date.now()}`,
        warehouse_id: initialStock.warehouse_id,
        product_id: id,
        current_stock: Number(initialStock.current_stock) || 100,
        minimum_stock: Number(initialStock.minimum_stock) || 20,
        maximum_stock: Number(initialStock.maximum_stock) || 500,
        reserved_stock: 0,
        updated_at: new Date().toISOString(),
      };
      this.data.inventory.unshift(newInv);
      this.broadcast('inventory', 'INSERT', newInv);
      syncToLiveSupabase('inventory', 'INSERT', newInv);
    }

    this.calculateHealthMetrics();
    this.logAudit(userId, 'ADMIN_CREATE_PRODUCT', 'PRODUCT', id, null, newProduct, { sku: newProduct.sku });
    return newProduct;
  }

  public updateProduct(productId: string, updates: Partial<Product>, userId: string) {
    const index = this.data.products.findIndex(p => p.id === productId);
    if (index === -1) return null;

    const prev = { ...this.data.products[index] };
    const updated = { ...prev, ...updates };
    this.data.products[index] = updated;
    this.broadcast('products', 'UPDATE', updated, prev);
    syncToLiveSupabase('products', 'UPDATE', updated, 'id', productId);

    this.logAudit(userId, 'ADMIN_UPDATE_PRODUCT', 'PRODUCT', productId, prev, updated);
    return updated;
  }

  public updateInventoryStock(inventoryId: string, updates: Partial<Inventory>, userId: string) {
    const index = this.data.inventory.findIndex(i => i.id === inventoryId);
    if (index === -1) return null;

    const prev = { ...this.data.inventory[index] };
    const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
    this.data.inventory[index] = updated;
    this.calculateHealthMetrics();
    this.broadcast('inventory', 'UPDATE', updated, prev);
    syncToLiveSupabase('inventory', 'UPDATE', updated, 'id', inventoryId);

    this.logAudit(userId, 'ADMIN_UPDATE_INVENTORY', 'INVENTORY', inventoryId, prev, updated);
    return updated;
  }

  public deleteProduct(productId: string, userId: string) {
    const prodIdx = this.data.products.findIndex(p => p.id === productId);
    if (prodIdx === -1) return false;

    const removedProd = this.data.products[prodIdx];
    this.data.products.splice(prodIdx, 1);
    this.broadcast('products', 'DELETE', null, removedProd);
    syncToLiveSupabase('products', 'DELETE', removedProd, 'id', productId);

    // Also remove associated inventory entries
    const removedInvs = this.data.inventory.filter(i => i.product_id === productId);
    this.data.inventory = this.data.inventory.filter(i => i.product_id !== productId);
    removedInvs.forEach(inv => {
      this.broadcast('inventory', 'DELETE', null, inv);
      syncToLiveSupabase('inventory', 'DELETE', inv, 'id', inv.id);
    });

    this.calculateHealthMetrics();
    this.logAudit(userId, 'ADMIN_DELETE_PRODUCT', 'PRODUCT', productId, removedProd, null);
    return true;
  }

  // SUPPLIERS & PURCHASE ORDERS CRUD
  public createSupplier(supplierData: Partial<Supplier>, userId: string) {
    const id = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      id,
      organization_id: DEMO_ORG_ID,
      name: supplierData.name || 'New Supplier Corporation',
      contact_name: supplierData.contact_name || 'Accounts Representative',
      email: supplierData.email || 'support@supplier.com',
      phone: supplierData.phone || '+91 20 4000 0000',
      rating: Number(supplierData.rating) || 4.5,
      status: supplierData.status || 'ACTIVE',
      lead_time_days: Number(supplierData.lead_time_days) || 7,
    };

    this.data.suppliers.unshift(newSupplier);
    this.broadcast('suppliers', 'INSERT', newSupplier);
    syncToLiveSupabase('suppliers', 'INSERT', newSupplier);

    this.logAudit(userId, 'ADMIN_CREATE_SUPPLIER', 'SUPPLIER', id, null, newSupplier);
    return newSupplier;
  }

  public updateSupplier(supplierId: string, updates: Partial<Supplier>, userId: string) {
    const index = this.data.suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) return null;

    const prev = { ...this.data.suppliers[index] };
    const updated = { ...prev, ...updates };
    this.data.suppliers[index] = updated;
    this.broadcast('suppliers', 'UPDATE', updated, prev);
    syncToLiveSupabase('suppliers', 'UPDATE', updated, 'id', supplierId);

    this.logAudit(userId, 'ADMIN_UPDATE_SUPPLIER', 'SUPPLIER', supplierId, prev, updated);
    return updated;
  }

  public deleteSupplier(supplierId: string, userId: string) {
    const index = this.data.suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) return false;

    const removed = this.data.suppliers[index];
    this.data.suppliers.splice(index, 1);
    this.broadcast('suppliers', 'DELETE', null, removed);
    syncToLiveSupabase('suppliers', 'DELETE', removed, 'id', supplierId);

    this.logAudit(userId, 'ADMIN_DELETE_SUPPLIER', 'SUPPLIER', supplierId, removed, null);
    return true;
  }

  public createPurchaseOrder(poData: Partial<PurchaseOrder>, userId: string) {
    const id = `po-${Date.now()}`;
    const newPO: PurchaseOrder = {
      id,
      supplier_id: poData.supplier_id || this.data.suppliers[0]?.id || 'sup-01',
      created_by: userId,
      status: poData.status || 'ORDERED',
      total_amount: Number(poData.total_amount) || 250000,
      expected_delivery: poData.expected_delivery || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    this.data.purchase_orders.unshift(newPO);
    this.broadcast('purchase_orders', 'INSERT', newPO);
    syncToLiveSupabase('purchase_orders', 'INSERT', newPO);

    // Create delivery tracker
    const newDelivery: Delivery = {
      id: `del-${id}`,
      purchase_order_id: id,
      status: 'IN_TRANSIT',
      expected_date: newPO.expected_delivery,
      delay_hours: 0,
      tracking_reference: `TRK-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.deliveries.unshift(newDelivery);
    this.broadcast('deliveries', 'INSERT', newDelivery);
    syncToLiveSupabase('deliveries', 'INSERT', newDelivery);

    this.calculateHealthMetrics();
    this.logAudit(userId, 'ADMIN_CREATE_PURCHASE_ORDER', 'PURCHASE_ORDER', id, null, newPO);
    return newPO;
  }

  public deletePurchaseOrder(poId: string, userId: string) {
    const index = this.data.purchase_orders.findIndex(p => p.id === poId);
    if (index === -1) return false;

    const removed = this.data.purchase_orders[index];
    this.data.purchase_orders.splice(index, 1);
    this.broadcast('purchase_orders', 'DELETE', null, removed);
    syncToLiveSupabase('purchase_orders', 'DELETE', removed, 'id', poId);

    const removedDels = this.data.deliveries.filter(d => d.purchase_order_id === poId);
    this.data.deliveries = this.data.deliveries.filter(d => d.purchase_order_id !== poId);
    removedDels.forEach(del => syncToLiveSupabase('deliveries', 'DELETE', del, 'id', del.id));

    this.calculateHealthMetrics();
    this.logAudit(userId, 'ADMIN_DELETE_PURCHASE_ORDER', 'PURCHASE_ORDER', poId, removed, null);
    return true;
  }

  // WAREHOUSES & FACILITIES CRUD
  public createWarehouse(whData: Partial<Warehouse>, userId: string) {
    const id = `wh-${Date.now()}`;
    const newWh: Warehouse = {
      id,
      organization_id: DEMO_ORG_ID,
      location_id: whData.location_id || 'loc-pune-wh',
      name: whData.name || 'Regional Distribution Facility',
      code: whData.code || `WH-${Math.floor(100 + Math.random() * 900)}`,
      max_capacity: Number(whData.max_capacity) || 50000,
      current_capacity: Number(whData.current_capacity) || 12000,
      status: whData.status || 'OPERATIONAL',
    };

    this.data.warehouses.unshift(newWh);
    this.broadcast('warehouses', 'INSERT', newWh);
    syncToLiveSupabase('warehouses', 'INSERT', newWh);

    this.logAudit(userId, 'ADMIN_CREATE_WAREHOUSE', 'WAREHOUSE', id, null, newWh);
    return newWh;
  }

  public updateWarehouse(warehouseId: string, updates: Partial<Warehouse>, userId: string) {
    const index = this.data.warehouses.findIndex(w => w.id === warehouseId);
    if (index === -1) return null;

    const prev = { ...this.data.warehouses[index] };
    const updated = { ...prev, ...updates };
    this.data.warehouses[index] = updated;
    this.broadcast('warehouses', 'UPDATE', updated, prev);
    syncToLiveSupabase('warehouses', 'UPDATE', updated, 'id', warehouseId);

    this.logAudit(userId, 'ADMIN_UPDATE_WAREHOUSE', 'WAREHOUSE', warehouseId, prev, updated);
    return updated;
  }

  public deleteWarehouse(warehouseId: string, userId: string) {
    const index = this.data.warehouses.findIndex(w => w.id === warehouseId);
    if (index === -1) return false;

    const removed = this.data.warehouses[index];
    this.data.warehouses.splice(index, 1);
    this.broadcast('warehouses', 'DELETE', null, removed);
    syncToLiveSupabase('warehouses', 'DELETE', removed, 'id', warehouseId);

    this.logAudit(userId, 'ADMIN_DELETE_WAREHOUSE', 'WAREHOUSE', warehouseId, removed, null);
    return true;
  }

  // WORKFORCE & PROFILES CRUD
  public createProfile(profileData: Partial<Profile>, userId: string) {
    const id = `user-${Date.now()}`;
    const newProfile: Profile = {
      id,
      organization_id: DEMO_ORG_ID,
      full_name: profileData.full_name || 'New Staff Member',
      email: profileData.email || `staff-${Date.now()}@stratiq-enterprise.com`,
      avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role_id: profileData.role_id || 'role-inv-mgr',
      role_code: profileData.role_code || 'INVENTORY_MANAGER',
      department_id: profileData.department_id || 'dept-operations',
      status: profileData.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.profiles.unshift(newProfile);
    this.broadcast('profiles', 'INSERT', newProfile);
    syncToLiveSupabase('profiles', 'INSERT', newProfile);

    this.logAudit(userId, 'ADMIN_CREATE_PROFILE', 'PROFILE', id, null, newProfile);
    return newProfile;
  }

  public updateProfile(profileId: string, updates: Partial<Profile>, userId: string) {
    const index = this.data.profiles.findIndex(p => p.id === profileId);
    if (index === -1) return null;

    const prev = { ...this.data.profiles[index] };
    const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
    this.data.profiles[index] = updated;
    this.broadcast('profiles', 'UPDATE', updated, prev);
    syncToLiveSupabase('profiles', 'UPDATE', updated, 'id', profileId);

    this.logAudit(userId, 'ADMIN_UPDATE_PROFILE', 'PROFILE', profileId, prev, updated);
    return updated;
  }

  public deleteProfile(profileId: string, userId: string) {
    const index = this.data.profiles.findIndex(p => p.id === profileId);
    if (index === -1) return false;

    const removed = this.data.profiles[index];
    this.data.profiles.splice(index, 1);
    this.broadcast('profiles', 'DELETE', null, removed);
    syncToLiveSupabase('profiles', 'DELETE', removed, 'id', profileId);

    this.logAudit(userId, 'ADMIN_DELETE_PROFILE', 'PROFILE', profileId, removed, null);
    return true;
  }

  // DATASET RESET
  public resetToCleanDemoState(userId: string) {
    this.data = {
      organizations: [{ ...SEED_ORGANIZATION }],
      roles: [...SEED_ROLES],
      departments: [...SEED_DEPARTMENTS],
      locations: [...SEED_LOCATIONS],
      profiles: [...SEED_PROFILES],
      warehouses: [...SEED_WAREHOUSES],
      products: [...SEED_PRODUCTS],
      inventory: [...SEED_INVENTORY],
      suppliers: [...SEED_SUPPLIERS],
      purchase_orders: [...SEED_PURCHASE_ORDERS],
      deliveries: [...SEED_DELIVERIES],
      customers: [...SEED_CUSTOMERS],
      sales_orders: [...SEED_SALES_ORDERS],
      slas: [...SEED_SLAS],
      incidents: [...SEED_INCIDENTS],
      incident_comments: [...SEED_COMMENTS],
      approvals: [...SEED_APPROVALS],
      notifications: [...SEED_NOTIFICATIONS],
      audit_logs: [...SEED_AUDIT_LOGS],
      transfers: [],
      enterprise_metrics: { ...SEED_ENTERPRISE_METRICS },
    };

    this.calculateHealthMetrics();
    this.broadcast('*', 'UPDATE', { reset: true });
    this.logAudit(userId, 'SYSTEM_RESET_DATASET', 'SYSTEM', 'root', null, { status: 'RESET_COMPLETED' });
  }

  // Record Audit Log (Requirement 23)
  public logAudit(
    userId: string, 
    action: string, 
    entityType: string, 
    entityId: string, 
    prevState: any, 
    newState: any, 
    metadata: Record<string, any> = {}
  ) {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organization_id: DEMO_ORG_ID,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      previous_state: prevState,
      new_state: newState,
      metadata,
      created_at: new Date().toISOString(),
    };

    this.data.audit_logs.unshift(newLog);
    this.broadcast('audit_logs', 'INSERT', newLog);
  }

  // Create Notification (Requirement 22)
  public createNotification(
    userId: string,
    type: Notification['type'],
    severity: Notification['severity'],
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ) {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      organization_id: DEMO_ORG_ID,
      type,
      severity,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    this.data.notifications.unshift(notif);
    this.broadcast('notifications', 'INSERT', notif);
  }

  // Hackathon Scenario Automation Trigger: Supplier Delay (Requirements 33, 44, 45)
  public triggerSupplierDelayScenario() {
    const po = this.data.purchase_orders.find(p => p.id === 'po-8942');
    const delivery = this.data.deliveries.find(d => d.purchase_order_id === 'po-8942');
    
    if (delivery) {
      delivery.status = 'DELAYED';
      delivery.delay_hours = 48;
      delivery.updated_at = new Date().toISOString();
      this.broadcast('deliveries', 'UPDATE', delivery);
    }

    if (po) {
      po.status = 'DELAYED';
      this.broadcast('purchase_orders', 'UPDATE', po);
    }

    // Identify affected inventory in Pune Warehouse
    const inv = this.data.inventory.find(i => i.product_id === 'prod-sc-01' && i.warehouse_id === 'wh-pune-01');
    if (inv) {
      inv.current_stock = 42;
      inv.reserved_stock = 285;
      inv.updated_at = new Date().toISOString();
      this.broadcast('inventory', 'UPDATE', inv);
    }

    // Check if incident already exists
    let inc = this.data.incidents.find(i => i.id === 'inc-pune-critical-01');
    if (!inc) {
      inc = {
        id: 'inc-pune-critical-01',
        organization_id: DEMO_ORG_ID,
        incident_number: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Pune Warehouse: Critical Semiconductor Stockout from Supplier Delay',
        description: 'PO #8942 delayed by 48 hours. Pune facility current stock (42 units) cannot fulfill 243 committed customer orders.',
        priority: 'CRITICAL',
        status: 'ACTION_REQUIRED',
        department_id: 'dept-operations',
        location_id: 'loc-pune-wh',
        owner_id: 'user-ops-01',
        impact: 'Assembly line halt in 6 hours if buffer stock is not routed from Mumbai DC.',
        affected_orders: 243,
        revenue_impact: 840000.00,
        sla_id: 'sla-inc-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.incidents.unshift(inc);
      this.broadcast('incidents', 'INSERT', inc);
    } else {
      inc.status = 'ACTION_REQUIRED';
      inc.affected_orders = 243;
      inc.revenue_impact = 840000.00;
      inc.resolved_at = undefined;
      this.broadcast('incidents', 'UPDATE', inc);
    }

    // Reset SLA deadline
    let sla = this.data.slas.find(s => s.id === 'sla-inc-01');
    if (sla) {
      sla.status = 'WARNING';
      sla.deadline = new Date(Date.now() + (2 * 3600 + 14 * 60 + 28) * 1000).toISOString();
      sla.breached_at = undefined;
      this.broadcast('slas', 'UPDATE', sla);
    }

    this.calculateHealthMetrics();

    // Create notifications and audit logs
    this.createNotification(
      'user-ceo-01',
      'INCIDENT',
      'CRITICAL',
      'CRITICAL: Semiconductor Stockout at Pune Warehouse',
      '243 customer orders affected. ₹8.4L revenue at risk. 02:14:28 SLA countdown active.',
      'incidents',
      'inc-pune-critical-01'
    );

    this.logAudit(
      'user-proc-01',
      'SUPPLIER_DELAY_RECORDED',
      'DELIVERY',
      'del-po-8942',
      { status: 'IN_TRANSIT', delay_hours: 0 },
      { status: 'DELAYED', delay_hours: 48 },
      { automated: true, supplier: 'Nexus Microelectronics AG' }
    );
  }

  // Resolve Incident flow (completes transfer, clears revenue risk, restores health)
  public resolveIncident(incidentId: string, resolvedByUserId: string) {
    const inc = this.data.incidents.find(i => i.id === incidentId);
    if (!inc) return;

    const prevStatus = inc.status;
    inc.status = 'RESOLVED';
    inc.resolved_at = new Date().toISOString();
    inc.updated_at = new Date().toISOString();
    inc.affected_orders = 0;
    inc.revenue_impact = 0;

    // Restore Pune inventory from transfer
    const puneInv = this.data.inventory.find(i => i.product_id === 'prod-sc-01' && i.warehouse_id === 'wh-pune-01');
    if (puneInv) {
      puneInv.current_stock += 300;
      puneInv.reserved_stock = Math.max(0, puneInv.reserved_stock - 243);
      this.broadcast('inventory', 'UPDATE', puneInv);
    }

    // Resolve SLA
    if (inc.sla_id) {
      const sla = this.data.slas.find(s => s.id === inc.sla_id);
      if (sla) {
        sla.status = 'RESOLVED';
        this.broadcast('slas', 'UPDATE', sla);
      }
    }

    this.broadcast('incidents', 'UPDATE', inc);
    this.calculateHealthMetrics();

    this.createNotification(
      'user-ceo-01',
      'INCIDENT',
      'INFO',
      `Incident ${inc.incident_number} Resolved`,
      'Emergency buffer stock received. Revenue risk neutralized. Enterprise health restored.',
      'incidents',
      inc.id
    );

    this.logAudit(
      resolvedByUserId,
      'INCIDENT_RESOLVED',
      'INCIDENT',
      inc.id,
      { status: prevStatus },
      { status: 'RESOLVED', revenue_impact: 0 },
      { resolution_action: 'EMERGENCY_TRANSFER_APPLIED' }
    );
  }
}

export const store = new StratiqReactiveStore();
