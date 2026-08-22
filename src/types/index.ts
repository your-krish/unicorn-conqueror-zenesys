export type RoleCode = 
  | 'CEO'
  | 'CFO'
  | 'COO'
  | 'HR_MANAGER'
  | 'PROCUREMENT_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'OPERATIONS_MANAGER'
  | 'EMPLOYEE';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'DETECTED'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'ACTION_REQUIRED'
  | 'RESOLVED'
  | 'CLOSED';

export type SLAStatus = 'ACTIVE' | 'WARNING' | 'BREACHED' | 'RESOLVED';

export type DeliveryStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';

export type TransferStatus = 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type NotificationType = 
  | 'INCIDENT'
  | 'SLA_BREACH'
  | 'LOW_INVENTORY'
  | 'APPROVAL'
  | 'SUPPLIER_DELAY'
  | 'WORKFLOW'
  | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  logo_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  role_id: string;
  role_code?: RoleCode;
  department_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AWAY';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  description: string;
  permissions: string[];
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  budget: number;
  head_id?: string;
  health_score: number;
  created_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  city: string;
  type: 'HQ' | 'Warehouse' | 'Distribution Center' | 'Office';
  latitude: number;
  longitude: number;
  capacity: number;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  created_at: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  role_id: string;
  location_id: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'IN_TRANSIT';
  avatar_url: string;
  phone: string;
  hire_date: string;
}

export interface Product {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
  reorder_point: number;
  created_at: string;
}

export interface Warehouse {
  id: string;
  organization_id: string;
  location_id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_capacity: number;
  status: 'OPERATIONAL' | 'CONGESTED' | 'CRITICAL_STOCK';
}

export interface Inventory {
  id: string;
  warehouse_id: string;
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reserved_stock: number;
  updated_at: string;
  // Joined fields
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';
  quantity: number;
  reference_type: string;
  reference_id: string;
  created_by: string;
  created_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface InventoryTransfer {
  id: string;
  source_warehouse_id: string;
  destination_warehouse_id: string;
  product_id: string;
  quantity: number;
  status: TransferStatus;
  requested_by: string;
  approved_by?: string;
  created_at: string;
  completed_at?: string;
  product?: Product;
  source_warehouse?: Warehouse;
  destination_warehouse?: Warehouse;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'ENTERPRISE' | 'TIER_1' | 'STANDARD';
  address: string;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  organization_id: string;
  customer_id: string;
  order_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  warehouse_id: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  warehouse?: Warehouse;
  items?: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  rating: number;
  status: 'PREFERRED' | 'ACTIVE' | 'AT_RISK' | 'SUSPENDED';
  lead_time_days: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  created_by: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
  total_amount: number;
  expected_delivery: string;
  created_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
  delivery?: Delivery;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Delivery {
  id: string;
  purchase_order_id: string;
  status: DeliveryStatus;
  expected_date: string;
  actual_date?: string;
  delay_hours: number;
  tracking_reference: string;
  created_at: string;
  updated_at: string;
  purchase_order?: PurchaseOrder;
}

export interface SLA {
  id: string;
  incident_id: string;
  duration_minutes: number;
  deadline: string;
  status: SLAStatus;
  breached_at?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  organization_id: string;
  incident_number: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  department_id: string;
  location_id: string;
  owner_id?: string;
  impact: string;
  affected_orders: number;
  revenue_impact: number;
  sla_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  department?: Department;
  location?: Location;
  owner?: Profile;
  sla?: SLA;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: Profile;
}

export interface IncidentAssignment {
  id: string;
  incident_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  unassigned_at?: string;
  assignee?: Profile;
  assigner?: Profile;
}

export interface Approval {
  id: string;
  organization_id: string;
  entity_type: 'PURCHASE_ORDER' | 'INVENTORY_TRANSFER' | 'INCIDENT_ESCALATION' | 'BUDGET_OVERRIDE';
  entity_id: string;
  requester_id: string;
  approver_id: string;
  step: number;
  total_steps?: number;
  status: ApprovalStatus;
  amount?: number;
  comments?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  approver?: Profile;
}

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  entity_type: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  created_at: string;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  required_role: RoleCode;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  approver_id?: string;
  completed_at?: string;
  approver?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
  user?: Profile;
}

export interface EnterpriseMetric {
  id: string;
  organization_id: string;
  metric_date: string;
  revenue: number;
  expenses: number;
  orders: number;
  inventory_health: number; // 0-100
  workforce_availability: number; // 0-100
  critical_incidents: number;
  enterprise_health: number; // 0-100
  created_at: string;
}

export interface Report {
  id: string;
  organization_id: string;
  title: string;
  type: 'EXECUTIVE_SUMMARY' | 'INVENTORY_REPORT' | 'PROCUREMENT_REPORT' | 'INCIDENT_REPORT' | 'FINANCE_SUMMARY' | 'WORKFORCE_REPORT';
  generated_by: string;
  date_range: string;
  parameters: Record<string, any>;
  summary_metrics: Record<string, any>;
  file_url?: string;
  created_at: string;
  author?: Profile;
}

export interface DependencyNode {
  id: string;
  type: 'SUPPLIER' | 'PURCHASE_ORDER' | 'DELIVERY' | 'WAREHOUSE' | 'INVENTORY' | 'SALES_ORDERS' | 'REVENUE';
  label: string;
  sublabel: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  metric?: string;
  meta: Record<string, any>;
}

export interface DependencyEdge {
  from: string;
  to: string;
  label?: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface IncidentDependencyGraph {
  incident_id: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  summary: {
    affected_orders: number;
    revenue_at_risk: number;
    delay_hours: number;
    source_supplier: string;
    target_warehouse: string;
    product_name: string;
  };
}
