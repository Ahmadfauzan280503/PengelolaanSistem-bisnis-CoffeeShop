-- =========================================================================
-- COMPLETE ERP SCHEMA FOR KOTACOFFEE (Phase 1: Foundation)
-- =========================================================================

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL, -- 'Owner', 'HRD', 'Finance', 'Supervisor', 'Leader', 'Barista', 'Kasir'
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  action text NOT NULL, -- e.g., 'manage_users', 'view_finance', 'approve_stock'
  resource text NOT NULL, -- e.g., 'hrd_dashboard', 'finance_dashboard', 'inventory'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_id, action, resource)
);

-- 2. Outlets / Branches
CREATE TABLE IF NOT EXISTS outlets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  status text DEFAULT 'Active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Employees / Users (Links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid UNIQUE, -- References auth.users(id) in Supabase
  role_id uuid REFERENCES roles(id),
  outlet_id uuid REFERENCES outlets(id), -- Nullable for Owner/HRD/Finance who manage all
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  status text DEFAULT 'Active',
  pin text, -- For quick POS login
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Activity Logs (User Activity Tracking)
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  action text NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  entity_type text NOT NULL, -- e.g., 'Expense', 'Stock', 'Employee'
  entity_id text, -- ID of the affected record
  description text NOT NULL, -- e.g., 'Finance menambah pengeluaran operasional'
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Audit Logs (Immutable / Cannot be deleted or modified)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid REFERENCES employees(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger Function to Prevent Deletion from Audit Logs
CREATE OR REPLACE FUNCTION prevent_audit_log_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be deleted or modified';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_deletion ON audit_logs;
CREATE TRIGGER trg_prevent_audit_log_deletion
BEFORE DELETE OR UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_deletion();

-- =========================================================================
-- INITIAL SEED DATA (For Testing)
-- =========================================================================

-- Seed Roles
INSERT INTO roles (name, description) VALUES 
  ('Owner', 'Highest level access, views everything'),
  ('HRD', 'Human Resource Management'),
  ('Finance', 'Finance and Accounting Management'),
  ('Supervisor', 'Outlet Supervisor (Multi or Single)'),
  ('Leader', 'Shift Leader'),
  ('Barista', 'Barista Staff'),
  ('Kasir', 'Cashier Staff')
ON CONFLICT (name) DO NOTHING;

-- Seed Outlets
INSERT INTO outlets (name, address) VALUES 
  ('Cabang 1 - Pusat', 'Jl. Sudirman No. 1'),
  ('Cabang 2 - Selatan', 'Jl. Kemang Raya No. 2'),
  ('Cabang 3 - Utara', 'Jl. Kelapa Gading No. 3');

-- =========================================================================
-- END PHASE 1 SCHEMA
-- =========================================================================

-- The rest of the tables (Categories, Products, Inventory, Transactions) 
-- will be implemented in Phase 2 & 3.
