import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, Layers, Boxes, Truck, Building2, Users, 
  DollarSign, Clock, ArrowUpDown, X, Check, Save, RotateCcw,
  Sliders, AlertOctagon, Package, ArrowRight, Database, ExternalLink, Globe, Key, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { db } from '../../lib/database';
import { 
  getActiveSupabaseConfig, configureLiveSupabase, checkIsSupabaseConfigured 
} from '../../lib/supabase';
import { 
  Incident, Product, Inventory, Supplier, PurchaseOrder, 
  Warehouse, Profile, IncidentPriority, IncidentStatus, 
  RoleCode, Department, Location 
} from '../../types';

type AdminTab = 'incidents' | 'inventory' | 'suppliers' | 'warehouses' | 'workforce' | 'supabase_sync';

export const AdminManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const { refreshData, triggerSupplierDelayDemo } = useRealtime();

  const [activeTab, setActiveTab] = useState<AdminTab>('incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Entities
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Modals & Active Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form States
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    priority: 'HIGH' as IncidentPriority,
    status: 'DETECTED' as IncidentStatus,
    department_id: '',
    location_id: '',
    owner_id: '',
    impact: '',
    affected_orders: 100,
    revenue_impact: 250000,
  });

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Components',
    unit_price: 3500,
    cost_price: 2400,
    reorder_point: 50,
    initial_warehouse_id: '',
    initial_stock: 150,
    min_stock: 30,
    max_stock: 600,
  });

  const [stockEditForm, setStockEditForm] = useState({
    inventory_id: '',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    rating: 4.8,
    status: 'ACTIVE' as Supplier['status'],
    lead_time_days: 5,
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    location_id: '',
    max_capacity: 40000,
    current_capacity: 15000,
    status: 'OPERATIONAL' as Warehouse['status'],
  });

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    role_code: 'OPERATIONS_MANAGER' as RoleCode,
    department_id: '',
    status: 'ACTIVE' as Profile['status'],
  });

  // Supabase Cloud Sync Configuration State
  const [supabaseConfigState, setSupabaseConfigState] = useState(() => getActiveSupabaseConfig());
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfigState.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfigState.anonKey);
  const [supabaseConnected, setSupabaseConnected] = useState(checkIsSupabaseConfigured());

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    configureLiveSupabase(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setSupabaseConfigState(getActiveSupabaseConfig());
    setSupabaseConnected(checkIsSupabaseConfigured());
    showNotification('Supabase official credentials updated. Live cloud sync activated.');
  };

  const handleClearSupabaseConfig = () => {
    configureLiveSupabase('', '');
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setSupabaseConfigState(getActiveSupabaseConfig());
    setSupabaseConnected(false);
    showNotification('Live Supabase configuration reset to local defaults.');
  };

  // Load all operational entities
  const loadEntities = async () => {
    setLoading(true);
    try {
      const [
        incs, prods, invs, sups, pos, whs, profs, depts, locs
      ] = await Promise.all([
        db.getIncidents(),
        db.getProducts(),
        db.getInventory(),
        db.getSuppliers(),
        db.getPurchaseOrders(),
        db.getWarehouses(),
        db.getProfiles(),
        db.getDepartments(),
        db.getLocations(),
      ]);

      setIncidents(incs);
      setProducts(prods);
      setInventoryList(invs);
      setSuppliers(sups);
      setPurchaseOrders(pos);
      setWarehouses(whs);
      setProfiles(profs);
      setDepartments(depts);
      setLocations(locs);
    } catch (err) {
      console.error('Failed to load admin entities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // --- Handlers: Incident ---
  const handleOpenCreateIncident = () => {
    setModalMode('create');
    setEditingItem(null);
    setIncidentForm({
      title: '',
      description: '',
      priority: 'HIGH',
      status: 'DETECTED',
      department_id: departments[0]?.id || 'dept-operations',
      location_id: locations[0]?.id || 'loc-pune-wh',
      owner_id: user.id,
      impact: 'Immediate mitigation required by operational team.',
      affected_orders: 120,
      revenue_impact: 350000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditIncident = (inc: Incident) => {
    setModalMode('edit');
    setEditingItem(inc);
    setIncidentForm({
      title: inc.title,
      description: inc.description,
      priority: inc.priority,
      status: inc.status,
      department_id: inc.department_id,
      location_id: inc.location_id,
      owner_id: inc.owner_id || user.id,
      impact: inc.impact,
      affected_orders: inc.affected_orders,
      revenue_impact: inc.revenue_impact,
    });
    setIsModalOpen(true);
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await db.createIncident(incidentForm, user.id);
      showNotification(`Incident "${incidentForm.title}" registered successfully.`);
    } else if (editingItem) {
      await db.updateIncident(editingItem.id, incidentForm, user.id);
      showNotification(`Incident #${editingItem.incident_number} updated.`);
    }
    setIsModalOpen(false);
    await loadEntities();
    refreshData();
  };

  const handleDeleteIncident = async (id: string) => {
    await db.deleteIncident(id, user.id);
    setConfirmDeleteId(null);
    showNotification('Incident record removed from operational database.');
    await loadEntities();
    refreshData();
  };

  const handleResolveIncidentDirectly = async (inc: Incident) => {
    await db.updateIncident(inc.id, { status: 'RESOLVED' }, user.id);
    showNotification(`Incident #${inc.incident_number} marked as RESOLVED.`);
    await loadEntities();
    refreshData();
  };

  // --- Handlers: Products & Inventory ---
  const handleOpenCreateProduct = () => {
    setModalMode('create');
    setEditingItem(null);
    setProductForm({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      category: 'Semiconductors',
      unit_price: 4500,
      cost_price: 3100,
      reorder_point: 60,
      initial_warehouse_id: warehouses[0]?.id || 'wh-pune-01',
      initial_stock: 200,
      min_stock: 40,
      max_stock: 800,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setModalMode('edit');
    setEditingItem(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unit_price: prod.unit_price,
      cost_price: prod.cost_price,
      reorder_point: prod.reorder_point,
      initial_warehouse_id: warehouses[0]?.id || '',
      initial_stock: 0,
      min_stock: 0,
      max_stock: 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await db.createProduct(
        {
          name: productForm.name,
          sku: productForm.sku,
          category: productForm.category,
          unit_price: productForm.unit_price,
          cost_price: productForm.cost_price,
          reorder_point: productForm.reorder_point,
        },
        {
          warehouse_id: productForm.initial_warehouse_id,
          current_stock: productForm.initial_stock,
          minimum_stock: productForm.min_stock,
          maximum_stock: productForm.max_stock,
        },
        user.id
      );
      showNotification(`Product SKU ${productForm.sku} added to catalog & inventory.`);
    } else if (editingItem) {
      await db.updateProduct(
        editingItem.id,
        {
          name: productForm.name,
          sku: productForm.sku,
          category: productForm.category,
          unit_price: productForm.unit_price,
          cost_price: productForm.cost_price,
          reorder_point: productForm.reorder_point,
        },
        user.id
      );
      showNotification(`Product ${productForm.sku} specifications updated.`);
    }
    setIsModalOpen(false);
    await loadEntities();
    refreshData();
  };

  const handleDeleteProduct = async (id: string) => {
    await db.deleteProduct(id, user.id);
    setConfirmDeleteId(null);
    showNotification('Product and related inventory records removed.');
    await loadEntities();
    refreshData();
  };

  const handleUpdateStockLevel = async (invId: string, currentStock: number, minStock: number) => {
    await db.updateInventoryStock(invId, { current_stock: currentStock, minimum_stock: minStock }, user.id);
    showNotification('Live stock levels updated successfully.');
    await loadEntities();
    refreshData();
  };

  // --- Handlers: Supplier ---
  const handleOpenCreateSupplier = () => {
    setModalMode('create');
    setEditingItem(null);
    setSupplierForm({
      name: '',
      contact_name: '',
      email: '',
      phone: '+91 20 4400 1122',
      rating: 4.8,
      status: 'ACTIVE',
      lead_time_days: 7,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setModalMode('edit');
    setEditingItem(sup);
    setSupplierForm({
      name: sup.name,
      contact_name: sup.contact_name,
      email: sup.email,
      phone: sup.phone,
      rating: sup.rating,
      status: sup.status,
      lead_time_days: sup.lead_time_days,
    });
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await db.createSupplier(supplierForm, user.id);
      showNotification(`Supplier "${supplierForm.name}" registered in network.`);
    } else if (editingItem) {
      await db.updateSupplier(editingItem.id, supplierForm, user.id);
      showNotification(`Supplier "${supplierForm.name}" updated.`);
    }
    setIsModalOpen(false);
    await loadEntities();
    refreshData();
  };

  const handleDeleteSupplier = async (id: string) => {
    await db.deleteSupplier(id, user.id);
    setConfirmDeleteId(null);
    showNotification('Supplier removed from vendor registry.');
    await loadEntities();
    refreshData();
  };

  // --- Handlers: Warehouse ---
  const handleOpenCreateWarehouse = () => {
    setModalMode('create');
    setEditingItem(null);
    setWarehouseForm({
      name: '',
      code: `WH-${Math.floor(100 + Math.random() * 900)}`,
      location_id: locations[0]?.id || 'loc-pune-wh',
      max_capacity: 50000,
      current_capacity: 15000,
      status: 'OPERATIONAL',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditWarehouse = (wh: Warehouse) => {
    setModalMode('edit');
    setEditingItem(wh);
    setWarehouseForm({
      name: wh.name,
      code: wh.code,
      location_id: wh.location_id,
      max_capacity: wh.max_capacity,
      current_capacity: wh.current_capacity,
      status: wh.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await db.createWarehouse(warehouseForm, user.id);
      showNotification(`Facility "${warehouseForm.name}" added to logistics topology.`);
    } else if (editingItem) {
      await db.updateWarehouse(editingItem.id, warehouseForm, user.id);
      showNotification(`Warehouse "${warehouseForm.name}" settings modified.`);
    }
    setIsModalOpen(false);
    await loadEntities();
    refreshData();
  };

  const handleDeleteWarehouse = async (id: string) => {
    await db.deleteWarehouse(id, user.id);
    setConfirmDeleteId(null);
    showNotification('Facility decommissioned and removed.');
    await loadEntities();
    refreshData();
  };

  // --- Handlers: Workforce & Profiles ---
  const handleOpenCreateProfile = () => {
    setModalMode('create');
    setEditingItem(null);
    setProfileForm({
      full_name: '',
      email: '',
      role_code: 'OPERATIONS_MANAGER',
      department_id: departments[0]?.id || 'dept-operations',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditProfile = (prof: Profile) => {
    setModalMode('edit');
    setEditingItem(prof);
    setProfileForm({
      full_name: prof.full_name,
      email: prof.email,
      role_code: prof.role_code || 'EMPLOYEE',
      department_id: prof.department_id,
      status: prof.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await db.createProfile(profileForm, user.id);
      showNotification(`Account created for ${profileForm.full_name}.`);
    } else if (editingItem) {
      await db.updateProfile(editingItem.id, profileForm, user.id);
      showNotification(`Profile ${profileForm.full_name} updated.`);
    }
    setIsModalOpen(false);
    await loadEntities();
    refreshData();
  };

  const handleDeleteProfile = async (id: string) => {
    await db.deleteProfile(id, user.id);
    setConfirmDeleteId(null);
    showNotification('User profile revoked and removed from organization.');
    await loadEntities();
    refreshData();
  };

  // System Reset
  const handleResetSystem = async () => {
    if (window.confirm('Reset all enterprise tables back to initial benchmark dataset?')) {
      await db.resetDataset(user.id);
      showNotification('Enterprise system restored to pristine benchmark dataset.');
      await loadEntities();
      refreshData();
    }
  };

  return (
    <div id="admin-management-panel" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Executive Admin Management Panel
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Full CRUD Enabled
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Direct CRUD control over Incidents, Inventory SKUs, Suppliers, Facilities, and Organization Workforce.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="admin-reset-data-btn"
            onClick={handleResetSystem}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Benchmark Data
          </button>

          <button
            id="admin-trigger-demo-btn"
            onClick={() => {
              triggerSupplierDelayDemo();
              setTimeout(loadEntities, 600);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Simulate Disruption
          </button>

          <button
            id="admin-quick-add-btn"
            onClick={() => {
              if (activeTab === 'incidents') handleOpenCreateIncident();
              if (activeTab === 'inventory') handleOpenCreateProduct();
              if (activeTab === 'suppliers') handleOpenCreateSupplier();
              if (activeTab === 'warehouses') handleOpenCreateWarehouse();
              if (activeTab === 'workforce') handleOpenCreateProfile();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add New {activeTab.slice(0, -1).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl">
          <div className="text-[11px] font-medium text-neutral-400">Total Incidents</div>
          <div className="text-lg font-bold text-white mt-0.5">{incidents.length}</div>
          <div className="text-[10px] text-amber-400 mt-1">
            {incidents.filter(i => i.status !== 'RESOLVED').length} Active
          </div>
        </div>
        <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl">
          <div className="text-[11px] font-medium text-neutral-400">Product SKUs</div>
          <div className="text-lg font-bold text-white mt-0.5">{products.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">{inventoryList.length} Stock Nodes</div>
        </div>
        <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl">
          <div className="text-[11px] font-medium text-neutral-400">Active Suppliers</div>
          <div className="text-lg font-bold text-white mt-0.5">{suppliers.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1">{purchaseOrders.length} POs Tracked</div>
        </div>
        <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl">
          <div className="text-[11px] font-medium text-neutral-400">Warehouses</div>
          <div className="text-lg font-bold text-white mt-0.5">{warehouses.length}</div>
          <div className="text-[10px] text-blue-400 mt-1">Multi-Hub Network</div>
        </div>
        <div className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-neutral-400">Workforce Profiles</div>
          <div className="text-lg font-bold text-white mt-0.5">{profiles.length}</div>
          <div className="text-[10px] text-purple-400 mt-1">RBAC Assigned</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'incidents', label: 'Incidents & Operations', icon: AlertTriangle, count: incidents.length },
            { id: 'inventory', label: 'Products & Inventory', icon: Boxes, count: products.length },
            { id: 'suppliers', label: 'Suppliers & POs', icon: Truck, count: suppliers.length },
            { id: 'warehouses', label: 'Facilities & Hubs', icon: Building2, count: warehouses.length },
            { id: 'workforce', label: 'Workforce & Roles', icon: Users, count: profiles.length },
            { id: 'supabase_sync', label: 'Supabase Cloud Sync', icon: Database, count: supabaseConnected ? 'LIVE' : 'LOCAL' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-neutral-950/20 text-neutral-900 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Main Content Area per Tab */}

      {/* 1. INCIDENTS TAB */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Registered Incidents</h2>
            <button
              onClick={handleOpenCreateIncident}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Incident
            </button>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Incident</th>
                  <th className="p-3.5">Priority & Status</th>
                  <th className="p-3.5">Orders Impact</th>
                  <th className="p-3.5">Revenue Risk</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {incidents
                  .filter(i => 
                    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.priority.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(inc => (
                    <tr key={inc.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-sans font-medium text-white">{inc.title}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{inc.incident_number} • {new Date(inc.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            inc.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            inc.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {inc.priority}
                          </span>
                          <span className="text-[11px] text-neutral-400">{inc.status}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-neutral-200">
                        {inc.affected_orders} Orders
                      </td>
                      <td className="p-3.5 text-amber-400 font-bold">
                        ₹{(inc.revenue_impact / 100000).toFixed(2)}L
                      </td>
                      <td className="p-3.5 text-neutral-400 font-sans text-[11px]">
                        {inc.department?.name || 'Operations'}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {inc.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleResolveIncidentDirectly(inc)}
                              title="Resolve Incident"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditIncident(inc)}
                            title="Edit Incident"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(inc.id)}
                            title="Delete Incident"
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INVENTORY & PRODUCTS TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Product Catalog Management</h2>
              <button
                onClick={handleOpenCreateProduct}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product SKU
              </button>
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="p-3.5">Product / SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Unit Price</th>
                    <th className="p-3.5">Cost Price</th>
                    <th className="p-3.5">Reorder Point</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(prod => (
                      <tr key={prod.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-sans font-medium text-white">{prod.name}</div>
                          <div className="text-[11px] text-amber-400/90 mt-0.5">{prod.sku}</div>
                        </td>
                        <td className="p-3.5 font-sans text-neutral-400">
                          {prod.category}
                        </td>
                        <td className="p-3.5 text-white font-bold">
                          ₹{prod.unit_price.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-neutral-400">
                          ₹{prod.cost_price.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-amber-300">
                          {prod.reorder_point} Units
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              title="Edit Product"
                              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(prod.id)}
                              title="Delete Product"
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Inventory Levels Adjuster */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-400" />
              Live Warehouse Stock Level Control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {inventoryList.map(inv => {
                const prod = products.find(p => p.id === inv.product_id);
                const wh = warehouses.find(w => w.id === inv.warehouse_id);
                const isLow = inv.current_stock < inv.minimum_stock;

                return (
                  <div key={inv.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white text-xs">{prod?.name || 'Item'}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span>{wh?.name || 'Warehouse'}</span>
                          <span>•</span>
                          <span className="font-mono text-amber-400">{prod?.sku}</span>
                        </div>
                      </div>
                      {isLow && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                          DEFICIT
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                      <div>
                        <div className="text-[10px] text-neutral-500 font-sans uppercase">Current Stock</div>
                        <div className={`text-sm font-bold mt-0.5 ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                          {inv.current_stock}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 font-sans uppercase">Min Buffer</div>
                        <div className="text-sm text-neutral-300 mt-0.5">{inv.minimum_stock}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 font-sans uppercase">Reserved</div>
                        <div className="text-sm text-amber-400 mt-0.5">{inv.reserved_stock}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateStockLevel(inv.id, inv.current_stock + 50, inv.minimum_stock)}
                        className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium rounded transition-colors"
                      >
                        +50 Stock
                      </button>
                      <button
                        onClick={() => handleUpdateStockLevel(inv.id, Math.max(0, inv.current_stock - 50), inv.minimum_stock)}
                        className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium rounded transition-colors"
                      >
                        -50 Stock
                      </button>
                      <button
                        onClick={() => {
                          const newMin = prompt('Enter new minimum threshold:', String(inv.minimum_stock));
                          if (newMin && !isNaN(Number(newMin))) {
                            handleUpdateStockLevel(inv.id, inv.current_stock, Number(newMin));
                          }
                        }}
                        className="py-1.5 px-3 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white text-[11px] rounded transition-colors"
                      >
                        Set Min
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUPPLIERS & PURCHASE ORDERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Vendor & Supplier Registry</h2>
            <button
              onClick={handleOpenCreateSupplier}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Supplier
            </button>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Lead Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {suppliers
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.contact_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(sup => (
                    <tr key={sup.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-medium text-white">{sup.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{sup.id}</div>
                      </td>
                      <td className="p-3.5 text-neutral-300">
                        <div>{sup.contact_name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{sup.email}</div>
                      </td>
                      <td className="p-3.5 font-bold text-amber-400 font-mono">
                        {sup.rating} ★
                      </td>
                      <td className="p-3.5 text-neutral-300 font-mono">
                        {sup.lead_time_days} Days
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sup.status === 'PREFERRED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          sup.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {sup.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditSupplier(sup)}
                            title="Edit Supplier"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(sup.id)}
                            title="Delete Supplier"
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. WAREHOUSES & FACILITIES */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Logistics Facilities & Distribution Hubs</h2>
            <button
              onClick={handleOpenCreateWarehouse}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Facility
            </button>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Facility Name</th>
                  <th className="p-3.5">Facility Code</th>
                  <th className="p-3.5">Capacity Utilization</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {warehouses
                  .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.code.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(wh => (
                    <tr key={wh.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-medium text-white">{wh.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{wh.id}</div>
                      </td>
                      <td className="p-3.5 font-mono text-amber-400">
                        {wh.code}
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[120px] h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${Math.min(100, (wh.current_capacity / wh.max_capacity) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            {wh.current_capacity.toLocaleString()} / {wh.max_capacity.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wh.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {wh.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditWarehouse(wh)}
                            title="Edit Facility"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(wh.id)}
                            title="Delete Facility"
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. WORKFORCE & ROLES */}
      {activeTab === 'workforce' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Workforce & Role Assignments</h2>
            <button
              onClick={handleOpenCreateProfile}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Personnel
            </button>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Personnel</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {profiles
                  .filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(prof => (
                    <tr key={prof.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prof.avatar_url}
                            alt={prof.full_name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                          />
                          <div>
                            <div className="font-medium text-white">{prof.full_name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{prof.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-neutral-800 text-amber-300 font-mono text-[10px] rounded border border-neutral-700">
                          {prof.role_code || 'EMPLOYEE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-400 text-[11px]">
                        {departments.find(d => d.id === prof.department_id)?.name || 'Operations'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prof.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {prof.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProfile(prof)}
                            title="Edit Personnel"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(prof.id)}
                            title="Remove Personnel"
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUPABASE CLOUD SYNC SETTINGS & LIVE STATUS */}
      {activeTab === 'supabase_sync' && (
        <div className="space-y-6">
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  supabaseConnected 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Live Official Supabase Integration</h2>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      supabaseConnected 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                      {supabaseConnected ? '● LIVE CLOUD PERSISTENCE' : '○ IN-MEMORY / LOCAL STORAGE'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                    Every create, update, and delete operation executed in this Executive Admin Management Panel 
                    is automatically mirrored to your official Supabase database table (<code className="text-amber-300 font-mono text-[11px]">incidents</code>, <code className="text-amber-300 font-mono text-[11px]">products</code>, <code className="text-amber-300 font-mono text-[11px]">inventory</code>, <code className="text-amber-300 font-mono text-[11px]">suppliers</code>, <code className="text-amber-300 font-mono text-[11px]">purchase_orders</code>, <code className="text-amber-300 font-mono text-[11px]">warehouses</code>, <code className="text-amber-300 font-mono text-[11px]">profiles</code>).
                  </p>
                </div>
              </div>

              {supabaseConnected && (
                <a 
                  href={supabaseUrlInput.replace('.co', '.co/project/default/editor')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors shrink-0"
                >
                  <span>Open Supabase Table Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Credentials Configuration Form */}
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400/50"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-neutral-400" />
                    Supabase Anon / Public API Key
                  </label>
                  <input
                    type="password"
                    required
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400/50"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Public <code className="font-mono">anon</code> key for client-side queries and mutations
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className={`w-4 h-4 ${supabaseConnected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>
                    Status: {supabaseConnected ? (
                      <strong className="text-emerald-400">Connected to live project ({supabaseConfigState.url || 'configured'})</strong>
                    ) : (
                      <span>Running in local simulated mode with automatic fallbacks</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {supabaseConnected && (
                    <button
                      type="button"
                      onClick={handleClearSupabaseConfig}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800 rounded-lg transition-colors"
                    >
                      Clear Credentials
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save & Activate Supabase Sync
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sync Schema Verification */}
          <div className="p-5 bg-neutral-900/30 border border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Synchronized Database Tables</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { table: 'incidents', ops: 'INSERT, UPDATE, DELETE', items: `${incidents.length} rows` },
                { table: 'products', ops: 'INSERT, UPDATE, DELETE', items: `${products.length} rows` },
                { table: 'inventory', ops: 'INSERT, UPDATE, DELETE', items: `${inventoryList.length} rows` },
                { table: 'suppliers', ops: 'INSERT, UPDATE, DELETE', items: `${suppliers.length} rows` },
                { table: 'purchase_orders', ops: 'INSERT, UPDATE, DELETE', items: `${purchaseOrders.length} rows` },
                { table: 'deliveries', ops: 'INSERT, UPDATE, DELETE', items: 'Live triggers' },
                { table: 'warehouses', ops: 'INSERT, UPDATE, DELETE', items: `${warehouses.length} hubs` },
                { table: 'profiles', ops: 'INSERT, UPDATE, DELETE', items: `${profiles.length} users` },
              ].map(item => (
                <div key={item.table} className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg">
                  <div className="font-mono text-amber-400 font-semibold">{item.table}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">{item.ops}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{item.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {modalMode === 'create' ? 'Add New' : 'Edit'} {activeTab.slice(0, -1).toUpperCase()} Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INCIDENT FORM */}
            {activeTab === 'incidents' && (
              <form onSubmit={handleSaveIncident} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Incident Title</label>
                  <input
                    type="text"
                    required
                    value={incidentForm.title}
                    onChange={e => setIncidentForm({ ...incidentForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    placeholder="e.g. Pune Hub: Urgent Line Halt from Delayed Shipment"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Description & Root Cause</label>
                  <textarea
                    rows={3}
                    value={incidentForm.description}
                    onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    placeholder="Provide incident context and logistics timeline..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Priority</label>
                    <select
                      value={incidentForm.priority}
                      onChange={e => setIncidentForm({ ...incidentForm, priority: e.target.value as IncidentPriority })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Status</label>
                    <select
                      value={incidentForm.status}
                      onChange={e => setIncidentForm({ ...incidentForm, status: e.target.value as IncidentStatus })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      <option value="DETECTED">DETECTED</option>
                      <option value="ACTION_REQUIRED">ACTION_REQUIRED</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Affected Orders</label>
                    <input
                      type="number"
                      value={incidentForm.affected_orders}
                      onChange={e => setIncidentForm({ ...incidentForm, affected_orders: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Revenue Exposure (INR)</label>
                    <input
                      type="number"
                      value={incidentForm.revenue_impact}
                      onChange={e => setIncidentForm({ ...incidentForm, revenue_impact: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors"
                  >
                    Save Incident
                  </button>
                </div>
              </form>
            )}

            {/* PRODUCT FORM */}
            {activeTab === 'inventory' && (
              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      placeholder="e.g. TX-9 Microcontroller Unit"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                      placeholder="SKU-TX9-MCU"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.unit_price}
                      onChange={e => setProductForm({ ...productForm, unit_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.cost_price}
                      onChange={e => setProductForm({ ...productForm, cost_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {modalMode === 'create' && (
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-3">
                    <div className="font-semibold text-neutral-300">Initial Warehouse Allocation</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-500 text-[11px] mb-1">Warehouse</label>
                        <select
                          value={productForm.initial_warehouse_id}
                          onChange={e => setProductForm({ ...productForm, initial_warehouse_id: e.target.value })}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white"
                        >
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-500 text-[11px] mb-1">Starting Stock</label>
                        <input
                          type="number"
                          value={productForm.initial_stock}
                          onChange={e => setProductForm({ ...productForm, initial_stock: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-500 text-[11px] mb-1">Min Threshold</label>
                        <input
                          type="number"
                          value={productForm.min_stock}
                          onChange={e => setProductForm({ ...productForm, min_stock: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors"
                  >
                    Save SKU
                  </button>
                </div>
              </form>
            )}

            {/* SUPPLIER FORM */}
            {activeTab === 'suppliers' && (
              <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Supplier / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    placeholder="e.g. Continental Electronics Ltd"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={supplierForm.contact_name}
                      onChange={e => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      placeholder="Account Director"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={supplierForm.rating}
                      onChange={e => setSupplierForm({ ...supplierForm, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      value={supplierForm.lead_time_days}
                      onChange={e => setSupplierForm({ ...supplierForm, lead_time_days: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Status</label>
                    <select
                      value={supplierForm.status}
                      onChange={e => setSupplierForm({ ...supplierForm, status: e.target.value as Supplier['status'] })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      <option value="PREFERRED">PREFERRED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="AT_RISK">AT_RISK</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            )}

            {/* WAREHOUSE FORM */}
            {activeTab === 'warehouses' && (
              <form onSubmit={handleSaveWarehouse} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Facility Name</label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.name}
                      onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      placeholder="e.g. Pune Regional Assembly DC"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Facility Code</label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.code}
                      onChange={e => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                      placeholder="WH-PUN-01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Max Capacity Units</label>
                    <input
                      type="number"
                      value={warehouseForm.max_capacity}
                      onChange={e => setWarehouseForm({ ...warehouseForm, max_capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Status</label>
                    <select
                      value={warehouseForm.status}
                      onChange={e => setWarehouseForm({ ...warehouseForm, status: e.target.value as Warehouse['status'] })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      <option value="OPERATIONAL">OPERATIONAL</option>
                      <option value="CONGESTED">CONGESTED</option>
                      <option value="CRITICAL_STOCK">CRITICAL_STOCK</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors"
                  >
                    Save Facility
                  </button>
                </div>
              </form>
            )}

            {/* WORKFORCE PROFILE FORM */}
            {activeTab === 'workforce' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    placeholder="e.g. Vikramaditya Rao"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    placeholder="user@stratiq.enterprise"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Role / Authority</label>
                    <select
                      value={profileForm.role_code}
                      onChange={e => setProfileForm({ ...profileForm, role_code: e.target.value as RoleCode })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      <option value="CEO">Chief Executive Officer (CEO)</option>
                      <option value="COO">Chief Operating Officer (COO)</option>
                      <option value="CFO">Chief Financial Officer (CFO)</option>
                      <option value="OPERATIONS_MANAGER">Operations Manager</option>
                      <option value="PROCUREMENT_MANAGER">Procurement Manager</option>
                      <option value="INVENTORY_MANAGER">Inventory Manager</option>
                      <option value="HR_MANAGER">HR Manager</option>
                      <option value="EMPLOYEE">Employee / Analyst</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Department</label>
                    <select
                      value={profileForm.department_id}
                      onChange={e => setProfileForm({ ...profileForm, department_id: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg transition-colors"
                  >
                    Save Personnel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-red-500/30 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Confirm Removal</h3>
            </div>
            <p className="text-xs text-neutral-300">
              Are you sure you want to permanently delete this {activeTab.slice(0, -1)} record? This action will update relational dependencies and record an audit log entry.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'incidents') handleDeleteIncident(confirmDeleteId);
                  if (activeTab === 'inventory') handleDeleteProduct(confirmDeleteId);
                  if (activeTab === 'suppliers') handleDeleteSupplier(confirmDeleteId);
                  if (activeTab === 'warehouses') handleDeleteWarehouse(confirmDeleteId);
                  if (activeTab === 'workforce') handleDeleteProfile(confirmDeleteId);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
