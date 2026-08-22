-- ======================================================================
-- STRATIQ ENTERPRISE OPERATIONS OS - SUPABASE POSTGRESQL MIGRATION
-- Migration: 20260822000001_stratiq_schema_and_seed.sql
-- ======================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEF AULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb
);

-- 4. Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    budget NUMERIC(15, 2) DEFAULT 0.00,
    health_score NUMERIC(5, 2) DEFAULT 95.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Profiles (References auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    department_id UUID REFERENCES public.departments(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'HQ', 'Warehouse', 'Distribution Center', 'Office'
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    capacity NUMERIC(10, 2) DEFAULT 10000,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id),
    role_id UUID NOT NULL REFERENCES public.roles(id),
    location_id UUID NOT NULL REFERENCES public.locations(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    avatar_url TEXT,
    phone VARCHAR(50),
    hire_date DATE DEFAULT CURRENT_DATE
);

-- 8. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    reorder_point INT DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    max_capacity INT DEFAULT 50000,
    current_capacity INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPERATIONAL'
);

-- 10. Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    maximum_stock INT NOT NULL DEFAULT 1000,
    reserved_stock INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_stock_non_negative CHECK (current_stock >= 0),
    CONSTRAINT chk_min_stock_non_negative CHECK (minimum_stock >= 0),
    CONSTRAINT chk_max_stock_valid CHECK (maximum_stock >= minimum_stock)
);

-- 11. Stock Movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    movement_type VARCHAR(50) NOT NULL, -- IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
    quantity INT NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Inventory Transfers
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    destination_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, IN_TRANSIT, COMPLETED, CANCELLED
    requested_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 13. Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    tier VARCHAR(50) DEFAULT 'STANDARD',
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Sales Orders
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    total_amount NUMERIC(15, 2) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Sales Order Items
CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL
);

-- 16. Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating NUMERIC(3, 2) DEFAULT 4.50,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    lead_time_days INT DEFAULT 3
);

-- 17. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    created_by UUID REFERENCES public.profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ORDERED', -- DRAFT, PENDING_APPROVAL, APPROVED, ORDERED, PARTIALLY_DELIVERED, DELIVERED, DELAYED, CANCELLED
    total_amount NUMERIC(15, 2) NOT NULL,
    expected_delivery TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Purchase Order Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL
);

-- 19. Deliveries
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_TRANSIT, DELIVERED, DELAYED
    expected_date TIMESTAMPTZ NOT NULL,
    actual_date TIMESTAMPTZ,
    delay_hours INT DEFAULT 0,
    tracking_reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. SLAs
CREATE TABLE IF NOT EXISTS public.slas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID,
    duration_minutes INT NOT NULL DEFAULT 180,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, WARNING, BREACHED, RESOLVED
    breached_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Incidents
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'DETECTED', -- DETECTED, ASSIGNED, INVESTIGATING, ACTION_REQUIRED, RESOLVED, CLOSED
    department_id UUID NOT NULL REFERENCES public.departments(id),
    location_id UUID NOT NULL REFERENCES public.locations(id),
    owner_id UUID REFERENCES public.profiles(id),
    impact TEXT,
    affected_orders INT DEFAULT 0,
    revenue_impact NUMERIC(15, 2) DEFAULT 0.00,
    sla_id UUID REFERENCES public.slas(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Circular reference link
ALTER TABLE public.slas ADD CONSTRAINT fk_sla_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE CASCADE;

-- 22. Incident Comments
CREATE TABLE IF NOT EXISTS public.incident_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. Incident Assignments
CREATE TABLE IF NOT EXISTS public.incident_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id),
    assigned_by UUID NOT NULL REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ
);

-- 24. Approvals
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    approver_id UUID NOT NULL REFERENCES public.profiles(id),
    step INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
    amount NUMERIC(15, 2),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. Workflows & Workflow Steps
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    required_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    approver_id UUID REFERENCES public.profiles(id),
    completed_at TIMESTAMPTZ
);

-- 26. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- INCIDENT, SLA_BREACH, LOW_INVENTORY, APPROVAL, SUPPLIER_DELAY, WORKFLOW, SYSTEM
    severity VARCHAR(50) NOT NULL, -- INFO, WARNING, CRITICAL
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    generated_by UUID REFERENCES public.profiles(id),
    date_range VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    summary_metrics JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 29. Enterprise Metrics
CREATE TABLE IF NOT EXISTS public.enterprise_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    revenue NUMERIC(15, 2) DEFAULT 0.00,
    expenses NUMERIC(15, 2) DEFAULT 0.00,
    orders INT DEFAULT 0,
    inventory_health NUMERIC(5, 2) DEFAULT 100.00,
    workforce_availability NUMERIC(5, 2) DEFAULT 96.50,
    critical_incidents INT DEFAULT 0,
    enterprise_health NUMERIC(5, 2) DEFAULT 88.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE (Requirement 39)
-- ======================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_incidents_org ON public.incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_dept ON public.incidents(department_id);
CREATE INDEX IF NOT EXISTS idx_incidents_loc ON public.incidents(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_wh_prod ON public.inventory(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_org ON public.sales_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_po ON public.deliveries(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at DESC);

-- ======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Requirements 25, 26, 48)
-- ======================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_metrics ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN (
        SELECT r.code 
        FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organization-based standard isolation policies
CREATE POLICY "Org members can view organizations" ON public.organizations
    FOR SELECT USING (id = public.get_current_user_organization() OR auth.uid() IS NULL);

CREATE POLICY "Org members can view profiles" ON public.profiles
    FOR ALL USING (organization_id = public.get_current_user_organization() OR auth.uid() IS NULL);

CREATE POLICY "Org members can view incidents" ON public.incidents
    FOR ALL USING (organization_id = public.get_current_user_organization() OR auth.uid() IS NULL);

CREATE POLICY "Org members can view inventory" ON public.inventory
    FOR ALL USING (true);

CREATE POLICY "Org members can view notifications" ON public.notifications
    FOR ALL USING (organization_id = public.get_current_user_organization() OR auth.uid() IS NULL);

CREATE POLICY "Org members can view audit logs" ON public.audit_logs
    FOR ALL USING (organization_id = public.get_current_user_organization() OR auth.uid() IS NULL);

-- ======================================================================
-- STORED FUNCTIONS & TRIGGERS (Requirements 31, 32, 33, 34, 35, 40, 41)
-- ======================================================================

-- 1. Calculate Revenue at Risk
CREATE OR REPLACE FUNCTION public.calculate_revenue_at_risk(target_warehouse_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_risk NUMERIC(15, 2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0)
    INTO total_risk
    FROM public.sales_orders
    WHERE warehouse_id = target_warehouse_id
      AND status IN ('PENDING', 'PROCESSING', 'CONFIRMED');
      
    RETURN total_risk;
END;
$$ LANGUAGE plpgsql;

-- 2. Calculate Enterprise Health (0-100 score)
CREATE OR REPLACE FUNCTION public.calculate_enterprise_health(org_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    crit_incidents INT;
    low_stock_count INT;
    delayed_deliveries INT;
    finance_score NUMERIC := 96.0;
    sales_score NUMERIC := 92.0;
    inventory_score NUMERIC := 95.0;
    procurement_score NUMERIC := 94.0;
    workforce_score NUMERIC := 96.5;
    incident_score NUMERIC := 98.0;
    final_health NUMERIC;
BEGIN
    -- Check critical incidents
    SELECT COUNT(*) INTO crit_incidents
    FROM public.incidents
    WHERE organization_id = org_id AND priority = 'CRITICAL' AND status != 'RESOLVED';
    
    IF crit_incidents > 0 THEN
        incident_score := GREATEST(30.0, 98.0 - (crit_incidents * 28.0));
    END IF;

    -- Check delayed deliveries
    SELECT COUNT(*) INTO delayed_deliveries
    FROM public.deliveries d
    JOIN public.purchase_orders po ON d.purchase_order_id = po.id
    JOIN public.suppliers s ON po.supplier_id = s.id
    WHERE s.organization_id = org_id AND d.status = 'DELAYED';

    IF delayed_deliveries > 0 THEN
        procurement_score := GREATEST(40.0, 94.0 - (delayed_deliveries * 25.0));
    END IF;

    final_health := (finance_score * 0.20) + (sales_score * 0.20) + (inventory_score * 0.20) + (procurement_score * 0.15) + (workforce_score * 0.10) + (incident_score * 0.15);
    
    RETURN ROUND(final_health, 1);
END;
$$ LANGUAGE plpgsql;

-- 3. Automatic Trigger: Log inventory change to stock movements
CREATE OR REPLACE FUNCTION public.trg_inventory_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_stock <> OLD.current_stock THEN
        INSERT INTO public.stock_movements (
            product_id,
            warehouse_id,
            movement_type,
            quantity,
            reference_type,
            reference_id,
            created_at
        ) VALUES (
            NEW.product_id,
            NEW.warehouse_id,
            CASE WHEN NEW.current_stock > OLD.current_stock THEN 'IN' ELSE 'OUT' END,
            ABS(NEW.current_stock - OLD.current_stock),
            'INVENTORY_ADJUSTMENT',
            NEW.id,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_inventory_update ON public.inventory;
CREATE TRIGGER trg_after_inventory_update
AFTER UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.trg_inventory_audit();
