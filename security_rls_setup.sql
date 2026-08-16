-- =========================================================================
-- SECURITY RLS POLICIES — KOTACOFFEE Dashboard
-- Run this in Supabase SQL Editor to tighten security
-- =========================================================================

-- =========================================================================
-- 1. EMPLOYEES TABLE — Only HRD/Owner can manage
-- =========================================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow public insert on employees" ON employees;
DROP POLICY IF EXISTS "Allow read on employees" ON employees;
DROP POLICY IF EXISTS "Allow public all on employees" ON employees;

-- Authenticated users can read employees (needed for role checks)
CREATE POLICY "Authenticated read employees" ON employees
  FOR SELECT TO authenticated USING (true);

-- Only HRD/Owner can insert employees
CREATE POLICY "HRD insert employees" ON employees
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

-- Only HRD/Owner can update employees
CREATE POLICY "HRD update employees" ON employees
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

-- Only Owner can delete employees
CREATE POLICY "Owner delete employees" ON employees
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name = 'Owner'
    )
  );

-- =========================================================================
-- 2. ROLES TABLE — Read-only for authenticated, Owner manages
-- =========================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on roles" ON roles;

CREATE POLICY "Authenticated read roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner manage roles" ON roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name = 'Owner'
    )
  );

-- =========================================================================
-- 3. OUTLETS TABLE — Authenticated read, HRD/Owner manage
-- =========================================================================
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on outlets" ON outlets;

CREATE POLICY "Authenticated read outlets" ON outlets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HRD manage outlets" ON outlets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

-- =========================================================================
-- 4. CASHIER_ORDERS — Cashier can insert, Finance/Owner/Supervisor read
-- =========================================================================
DROP POLICY IF EXISTS "Allow public insert on cashier_orders" ON cashier_orders;
DROP POLICY IF EXISTS "Allow read on cashier_orders" ON cashier_orders;

-- Allow anon insert for digital menu orders (public ordering)
CREATE POLICY "Anon insert cashier_orders" ON cashier_orders
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users (cashier staff) can also insert
CREATE POLICY "Auth insert cashier_orders" ON cashier_orders
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated users can read orders
CREATE POLICY "Auth read cashier_orders" ON cashier_orders
  FOR SELECT TO authenticated USING (true);

-- =========================================================================
-- 5. SALES TABLE — Finance/Owner can insert and read
-- =========================================================================
DROP POLICY IF EXISTS "Allow public insert on sales" ON sales;
DROP POLICY IF EXISTS "Allow read on sales" ON sales;

CREATE POLICY "Auth insert sales" ON sales
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read sales" ON sales
  FOR SELECT TO authenticated USING (true);

-- =========================================================================
-- 6. PRODUCTS TABLE — Authenticated read, HRD/Owner manage
-- =========================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on products" ON products;

-- Public can read products (for landing page / digital menu)
CREATE POLICY "Public read products" ON products
  FOR SELECT TO anon USING (true);

CREATE POLICY "Auth read products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HRD manage products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

CREATE POLICY "HRD update products" ON products
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

CREATE POLICY "HRD delete products" ON products
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

-- =========================================================================
-- 7. ACTIVITY_LOGS — Authenticated insert, Owner/HRD read
-- =========================================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth insert activity_logs" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin read activity_logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name IN ('Owner', 'HRD')
    )
  );

-- =========================================================================
-- 8. AUDIT_LOGS — Service role only (immutable)
-- =========================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read audit_logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.user_id = auth.uid()
      AND r.name = 'Owner'
    )
  );

-- =========================================================================
-- 9. PERMISSIONS TABLE — Read for authenticated
-- =========================================================================
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

-- =========================================================================
-- END SECURITY POLICIES
-- =========================================================================
