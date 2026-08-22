import { store, liveSupabase, isSupabaseConfigured } from './supabase';
import { 
  Incident, Inventory, Supplier, Delivery, Approval, 
  AuditLog, Notification, EnterpriseMetric, IncidentDependencyGraph, 
  InventoryTransfer, Report, Profile, RoleCode, Product, Warehouse, Location, Department, PurchaseOrder 
} from '../types';

export const db = {
  // 1. Get All Incidents with joins
  async getIncidents(): Promise<Incident[]> {
    if (isSupabaseConfigured && liveSupabase) {
      const { data, error } = await liveSupabase
        .from('incidents')
        .select(`
          *,
          department:departments(*),
          location:locations(*),
          owner:profiles(*),
          sla:slas(*)
        `)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Incident[];
    }

    // Reactive store query with joins
    return store.data.incidents.map(inc => {
      const department = store.data.departments.find(d => d.id === inc.department_id);
      const location = store.data.locations.find(l => l.id === inc.location_id);
      const owner = store.data.profiles.find(p => p.id === inc.owner_id);
      const sla = store.data.slas.find(s => s.id === inc.sla_id);
      return { ...inc, department, location, owner, sla };
    });
  },

  // 1b. Get Products
  async getProducts(): Promise<Product[]> {
    return [...store.data.products];
  },

  // 1c. Get Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return [...store.data.warehouses];
  },

  // 1d. Get Locations & Departments
  async getLocations(): Promise<Location[]> {
    return [...store.data.locations];
  },

  async getDepartments(): Promise<Department[]> {
    return [...store.data.departments];
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return store.data.purchase_orders.map(po => {
      const supplier = store.data.suppliers.find(s => s.id === po.supplier_id);
      const delivery = store.data.deliveries.find(d => d.purchase_order_id === po.id);
      return { ...po, supplier, delivery };
    });
  },

  async getProfiles(): Promise<Profile[]> {
    return [...store.data.profiles];
  },

  // 2. Get Incident by ID
  async getIncidentById(id: string): Promise<Incident | null> {
    const incidents = await this.getIncidents();
    return incidents.find(i => i.id === id) || null;
  },

  // 3. Get Inventory Records
  async getInventory(): Promise<Inventory[]> {
    if (isSupabaseConfigured && liveSupabase) {
      const { data, error } = await liveSupabase
        .from('inventory')
        .select(`
          *,
          product:products(*),
          warehouse:warehouses(*)
        `);
      if (!error && data) return data as Inventory[];
    }

    return store.data.inventory.map(inv => {
      const product = store.data.products.find(p => p.id === inv.product_id);
      const warehouse = store.data.warehouses.find(w => w.id === inv.warehouse_id);
      return { ...inv, product, warehouse };
    });
  },

  // 4. Get Suppliers and Deliveries
  async getSuppliers(): Promise<Supplier[]> {
    return [...store.data.suppliers];
  },

  async getDeliveries(): Promise<Delivery[]> {
    return store.data.deliveries.map(del => {
      const purchase_order = store.data.purchase_orders.find(po => po.id === del.purchase_order_id);
      if (purchase_order) {
        const supplier = store.data.suppliers.find(s => s.id === purchase_order.supplier_id);
        return { ...del, purchase_order: { ...purchase_order, supplier } };
      }
      return del;
    });
  },

  // 5. Get Approvals
  async getApprovals(): Promise<Approval[]> {
    return store.data.approvals.map(appr => {
      const requester = store.data.profiles.find(p => p.id === appr.requester_id);
      const approver = store.data.profiles.find(p => p.id === appr.approver_id);
      return { ...appr, requester, approver };
    });
  },

  // 6. Get Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return store.data.audit_logs.map(log => {
      const user = store.data.profiles.find(p => p.id === log.user_id);
      return { ...log, user };
    });
  },

  // 7. Get Notifications
  async getNotifications(userId?: string): Promise<Notification[]> {
    return store.data.notifications;
  },

  // 8. Get Enterprise Metrics
  async getEnterpriseMetrics(): Promise<EnterpriseMetric> {
    return { ...store.data.enterprise_metrics };
  },

  // 9. Generate Deterministic Relational Dependency Graph (Requirement 36)
  async getIncidentDependencyGraph(incidentId: string): Promise<IncidentDependencyGraph> {
    const inc = store.data.incidents.find(i => i.id === incidentId);
    
    // Find associated purchase order and supplier
    const po = store.data.purchase_orders.find(p => p.id === 'po-8942') || store.data.purchase_orders[0];
    const supplier = store.data.suppliers.find(s => s.id === po?.supplier_id) || store.data.suppliers[0];
    const delivery = store.data.deliveries.find(d => d.purchase_order_id === po?.id) || store.data.deliveries[0];
    const warehouse = store.data.warehouses.find(w => w.id === 'wh-pune-01') || store.data.warehouses[0];
    const product = store.data.products.find(p => p.id === 'prod-sc-01') || store.data.products[0];
    const inv = store.data.inventory.find(i => i.warehouse_id === warehouse?.id && i.product_id === product?.id);

    const affectedOrdersCount = inc?.affected_orders || 243;
    const revenueRisk = inc?.revenue_impact || 840000;
    const isResolved = inc?.status === 'RESOLVED';

    return {
      incident_id: incidentId,
      summary: {
        affected_orders: affectedOrdersCount,
        revenue_at_risk: revenueRisk,
        delay_hours: delivery?.delay_hours || 48,
        source_supplier: supplier.name,
        target_warehouse: warehouse.name,
        product_name: product.name,
      },
      nodes: [
        {
          id: 'node-sup',
          type: 'SUPPLIER',
          label: supplier.name,
          sublabel: 'Customs Transit Delay (+48h)',
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: `Rating: ${supplier.rating} ★`,
          meta: { email: supplier.email, contact: supplier.contact_name },
        },
        {
          id: 'node-po',
          type: 'PURCHASE_ORDER',
          label: `PO #${po.id.toUpperCase()}`,
          sublabel: 'TX-9 MCU (1,200 units)',
          status: isResolved ? 'NORMAL' : 'WARNING',
          metric: 'Value: ₹42.0L',
          meta: { status: po.status, date: po.created_at },
        },
        {
          id: 'node-del',
          type: 'DELIVERY',
          label: delivery.tracking_reference,
          sublabel: isResolved ? 'Rerouted / Cleared' : 'Frankfurt Port Delay',
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: isResolved ? 'On Schedule' : `Delay: +${delivery.delay_hours}h`,
          meta: { status: delivery.status },
        },
        {
          id: 'node-wh',
          type: 'WAREHOUSE',
          label: warehouse.name,
          sublabel: 'Pune Assembly Hub',
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: `Cap: ${warehouse.current_capacity}/${warehouse.max_capacity}`,
          meta: { code: warehouse.code },
        },
        {
          id: 'node-inv',
          type: 'INVENTORY',
          label: product.name,
          sublabel: isResolved ? 'Stock Restored (342)' : `Critical Deficit (${inv?.current_stock} / ${inv?.minimum_stock} min)`,
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: isResolved ? 'Stock: 342' : `Stock: ${inv?.current_stock} Units`,
          meta: { sku: product.sku },
        },
        {
          id: 'node-so',
          type: 'SALES_ORDERS',
          label: 'Downstream Fulfillment',
          sublabel: isResolved ? 'All Orders Processing' : `${affectedOrdersCount} Orders Pending Stock`,
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: isResolved ? '0 Blocked' : `${affectedOrdersCount} Blocked`,
          meta: { orders: ['SO-IN-2026-901', 'SO-IN-2026-902', 'SO-IN-2026-903'] },
        },
        {
          id: 'node-rev',
          type: 'REVENUE',
          label: 'Revenue Impact',
          sublabel: isResolved ? 'Revenue Protected' : 'Revenue at Direct Risk',
          status: isResolved ? 'NORMAL' : 'CRITICAL',
          metric: isResolved ? '₹0.0 Risk' : '₹8.4L at Risk',
          meta: { currency: 'INR', amount: revenueRisk },
        },
      ],
      edges: [
        { from: 'node-sup', to: 'node-po', label: 'Dispatches', impactLevel: 'HIGH' },
        { from: 'node-po', to: 'node-del', label: 'Tracked via DHL', impactLevel: 'CRITICAL' },
        { from: 'node-del', to: 'node-wh', label: 'Inbound Ingest', impactLevel: 'CRITICAL' },
        { from: 'node-wh', to: 'node-inv', label: 'Stock Allocation', impactLevel: 'CRITICAL' },
        { from: 'node-inv', to: 'node-so', label: 'Fulfills Orders', impactLevel: 'CRITICAL' },
        { from: 'node-so', to: 'node-rev', label: 'Generates Revenue', impactLevel: 'CRITICAL' },
      ],
    };
  },

  // 10. Assign Incident
  async assignIncident(incidentId: string, assignedToId: string, assignedById: string) {
    const inc = store.data.incidents.find(i => i.id === incidentId);
    if (!inc) return;

    inc.owner_id = assignedToId;
    inc.status = inc.status === 'DETECTED' ? 'ASSIGNED' : inc.status;
    inc.updated_at = new Date().toISOString();

    const assignee = store.data.profiles.find(p => p.id === assignedToId);

    store.broadcast('incidents', 'UPDATE', inc);
    store.logAudit(
      assignedById,
      'INCIDENT_ASSIGNED',
      'INCIDENT',
      incidentId,
      { previous_owner: null },
      { new_owner: assignedToId, assignee_name: assignee?.full_name }
    );
  },

  // 11. Add Comment
  async addIncidentComment(incidentId: string, userId: string, commentText: string) {
    const user = store.data.profiles.find(p => p.id === userId);
    const comment = {
      id: `com-${Date.now()}`,
      incident_id: incidentId,
      user_id: userId,
      comment: commentText,
      created_at: new Date().toISOString(),
      user,
    };
    store.data.incident_comments.push(comment);
    store.broadcast('incident_comments', 'INSERT', comment);
    return comment;
  },

  // 12. Request Emergency Inventory Transfer (Requirement 12, 45)
  async requestInventoryTransfer(data: {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    productId: string;
    quantity: number;
    requestedBy: string;
    associatedIncidentId?: string;
  }) {
    const transfer: InventoryTransfer = {
      id: `trf-${Date.now()}`,
      source_warehouse_id: data.sourceWarehouseId,
      destination_warehouse_id: data.destinationWarehouseId,
      product_id: data.productId,
      quantity: data.quantity,
      status: 'PENDING',
      requested_by: data.requestedBy,
      created_at: new Date().toISOString(),
    };

    store.data.transfers.unshift(transfer);
    store.broadcast('transfers', 'INSERT', transfer);

    // Create approval workflow entry
    const approval: Approval = {
      id: `appr-trf-${Date.now()}`,
      organization_id: store.data.organizations[0].id,
      entity_type: 'INVENTORY_TRANSFER',
      entity_id: transfer.id,
      requester_id: data.requestedBy,
      approver_id: 'user-coo-01', // Assigned to COO for rapid executive signoff
      step: 1,
      total_steps: 2,
      status: 'PENDING',
      amount: data.quantity * 3450,
      comments: `Emergency buffer transfer: ${data.quantity} units to mitigate critical inventory deficit.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.data.approvals.unshift(approval);
    store.broadcast('approvals', 'INSERT', approval);

    store.createNotification(
      'user-coo-01',
      'APPROVAL',
      'WARNING',
      'Emergency Transfer Awaiting Approval',
      `Authorization required for ${data.quantity} units from Mumbai DC to Pune WH.`,
      'approvals',
      approval.id
    );

    store.logAudit(
      data.requestedBy,
      'INVENTORY_TRANSFER_REQUESTED',
      'INVENTORY_TRANSFER',
      transfer.id,
      null,
      { quantity: data.quantity, source: data.sourceWarehouseId, dest: data.destinationWarehouseId }
    );

    return { transfer, approval };
  },

  // 13. Process Approval (Requirement 20, 45)
  async processApproval(approvalId: string, approverId: string, status: 'APPROVED' | 'REJECTED', comments?: string) {
    const approval = store.data.approvals.find(a => a.id === approvalId);
    if (!approval) return;

    approval.status = status;
    approval.approver_id = approverId;
    approval.updated_at = new Date().toISOString();
    if (comments) approval.comments = comments;

    store.broadcast('approvals', 'UPDATE', approval);

    // If transfer was approved, execute inventory deduction and addition
    if (status === 'APPROVED' && approval.entity_type === 'INVENTORY_TRANSFER') {
      const transfer = store.data.transfers.find(t => t.id === approval.entity_id) || {
        source_warehouse_id: 'wh-mumbai-01',
        destination_warehouse_id: 'wh-pune-01',
        product_id: 'prod-sc-01',
        quantity: 300,
      };

      // Deduct from Mumbai
      const mumbaiInv = store.data.inventory.find(i => i.warehouse_id === transfer.source_warehouse_id && i.product_id === transfer.product_id);
      if (mumbaiInv) {
        mumbaiInv.current_stock -= transfer.quantity;
        store.broadcast('inventory', 'UPDATE', mumbaiInv);
      }

      // Add to Pune
      const puneInv = store.data.inventory.find(i => i.warehouse_id === transfer.destination_warehouse_id && i.product_id === transfer.product_id);
      if (puneInv) {
        puneInv.current_stock += transfer.quantity;
        puneInv.reserved_stock = Math.max(0, puneInv.reserved_stock - 243);
        store.broadcast('inventory', 'UPDATE', puneInv);
      }

      // Auto resolve active incident
      store.resolveIncident('inc-pune-critical-01', approverId);
    }

    store.logAudit(
      approverId,
      status === 'APPROVED' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED',
      'APPROVAL',
      approvalId,
      { status: 'PENDING' },
      { status, comments }
    );
  },

  // 14. Global Search (Requirement 38)
  async globalSearch(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: Array<{ id: string; type: string; title: string; subtitle: string; route: string }> = [];

    // Search Incidents
    store.data.incidents.forEach(inc => {
      if (inc.title.toLowerCase().includes(q) || inc.incident_number.toLowerCase().includes(q) || inc.description.toLowerCase().includes(q)) {
        results.push({
          id: inc.id,
          type: 'Incident',
          title: `${inc.incident_number}: ${inc.title}`,
          subtitle: `Priority: ${inc.priority} | Status: ${inc.status}`,
          route: 'incidents',
        });
      }
    });

    // Search Products
    store.data.products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          type: 'Product',
          title: p.name,
          subtitle: `SKU: ${p.sku} | Unit Price: ₹${p.unit_price}`,
          route: 'inventory',
        });
      }
    });

    // Search Warehouses
    store.data.warehouses.forEach(w => {
      if (w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)) {
        results.push({
          id: w.id,
          type: 'Warehouse',
          title: w.name,
          subtitle: `Code: ${w.code} | Status: ${w.status}`,
          route: 'inventory',
        });
      }
    });

    // Search Suppliers
    store.data.suppliers.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.contact_name.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          type: 'Supplier',
          title: s.name,
          subtitle: `Contact: ${s.contact_name} | Rating: ${s.rating}★`,
          route: 'procurement',
        });
      }
    });

    return results;
  },

  // 15. Admin Management API
  async createIncident(data: Partial<Incident>, userId: string) {
    return store.createIncident(data, userId);
  },

  async updateIncident(id: string, data: Partial<Incident>, userId: string) {
    return store.updateIncident(id, data, userId);
  },

  async deleteIncident(id: string, userId: string) {
    return store.deleteIncident(id, userId);
  },

  async createProduct(data: Partial<Product>, initialStock: { warehouse_id: string; current_stock: number; minimum_stock: number; maximum_stock: number }, userId: string) {
    return store.createProduct(data, initialStock, userId);
  },

  async updateProduct(id: string, data: Partial<Product>, userId: string) {
    return store.updateProduct(id, data, userId);
  },

  async deleteProduct(id: string, userId: string) {
    return store.deleteProduct(id, userId);
  },

  async updateInventoryStock(id: string, data: Partial<Inventory>, userId: string) {
    return store.updateInventoryStock(id, data, userId);
  },

  async createSupplier(data: Partial<Supplier>, userId: string) {
    return store.createSupplier(data, userId);
  },

  async updateSupplier(id: string, data: Partial<Supplier>, userId: string) {
    return store.updateSupplier(id, data, userId);
  },

  async deleteSupplier(id: string, userId: string) {
    return store.deleteSupplier(id, userId);
  },

  async createPurchaseOrder(data: Partial<PurchaseOrder>, userId: string) {
    return store.createPurchaseOrder(data, userId);
  },

  async deletePurchaseOrder(id: string, userId: string) {
    return store.deletePurchaseOrder(id, userId);
  },

  async createWarehouse(data: Partial<Warehouse>, userId: string) {
    return store.createWarehouse(data, userId);
  },

  async updateWarehouse(id: string, data: Partial<Warehouse>, userId: string) {
    return store.updateWarehouse(id, data, userId);
  },

  async deleteWarehouse(id: string, userId: string) {
    return store.deleteWarehouse(id, userId);
  },

  async createProfile(data: Partial<Profile>, userId: string) {
    return store.createProfile(data, userId);
  },

  async updateProfile(id: string, data: Partial<Profile>, userId: string) {
    return store.updateProfile(id, data, userId);
  },

  async deleteProfile(id: string, userId: string) {
    return store.deleteProfile(id, userId);
  },

  async resetDataset(userId: string) {
    return store.resetToCleanDemoState(userId);
  }
};
