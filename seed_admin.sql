-- =========================================================================
-- SEED DATA: CREATE FIRST ADMIN (OWNER) & ROLES
-- Run this script in your Supabase SQL Editor
-- =========================================================================

-- 1. Insert Default Roles (if not exists)
INSERT INTO roles (name, description)
VALUES 
  ('Owner', 'Pemilik Bisnis, akses penuh'),
  ('HRD', 'Human Resource Department'),
  ('Finance', 'Finance & Accounting'),
  ('Supervisor', 'Supervisor Cabang'),
  ('Kasir', 'Kasir / POS')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert First Branch / Outlet (Optional but good for initial data)
INSERT INTO outlets (name, address, status)
VALUES ('Cabang Alauddin', 'Jl. Sultan Alauddin, Makassar', 'Active')
ON CONFLICT DO NOTHING;

-- 3. Create the Owner User in Supabase Auth
-- Note: 'admin123' is the default password. The UUIDs are deterministic for this seed script.
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000001';
  v_role_id UUID;
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id OR email = 'owner@kotacoffee.id') THEN
    -- Insert into auth.users (Supabase uses pgcrypto for passwords)
    -- We use 'admin123' as default password
    INSERT INTO auth.users (
      id, 
      instance_id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      created_at, 
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'owner@kotacoffee.id',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id::text, 'owner@kotacoffee.id')::jsonb,
      'email',
      now(),
      now(),
      now(),
      v_user_id::text
    );
  ELSE
    -- If user already exists, just get their ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@kotacoffee.id' LIMIT 1;
  END IF;

  -- Get Owner role ID
  SELECT id INTO v_role_id FROM roles WHERE name = 'Owner' LIMIT 1;

  -- Insert into public.employees
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'owner@kotacoffee.id') THEN
    INSERT INTO employees (
      user_id,
      role_id,
      full_name,
      email,
      status,
      pin
    ) VALUES (
      v_user_id,
      v_role_id,
      'Fauzan (Owner)',
      'owner@kotacoffee.id',
      'Active',
      '123456' -- PIN default
    );
  END IF;
END $$;

-- Done! You can now log in with:
-- Email: owner@kotacoffee.id
-- Password: admin123 (Cashier login tab)
-- Or PIN: 123456 (Staff Kantor tab)
