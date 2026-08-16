-- =========================================================================
-- SEED DATA: CREATE TESTING ACCOUNTS FOR 4 DASHBOARDS
-- Jalankan skrip ini di Supabase SQL Editor
-- =========================================================================

DO $$
DECLARE
  v_hrd_id UUID := gen_random_uuid();
  v_spv_id UUID := gen_random_uuid();
  v_fin_id UUID := gen_random_uuid();
  v_ksr_id UUID := gen_random_uuid();
  
  v_role_hrd UUID;
  v_role_spv UUID;
  v_role_fin UUID;
  v_role_ksr UUID;
BEGIN
  -- Dapatkan ID masing-masing Role
  SELECT id INTO v_role_hrd FROM roles WHERE name = 'HRD' LIMIT 1;
  SELECT id INTO v_role_spv FROM roles WHERE name = 'Supervisor' LIMIT 1;
  SELECT id INTO v_role_fin FROM roles WHERE name = 'Finance' LIMIT 1;
  SELECT id INTO v_role_ksr FROM roles WHERE name = 'Kasir' LIMIT 1;

  -- 1. AKUN HRD (PIN: 111111)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hrd@kotacoffee.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_hrd_id, '00000000-0000-0000-0000-000000000000', 'hrd@kotacoffee.id', crypt('111111', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated');
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id)
    VALUES (gen_random_uuid(), v_hrd_id, format('{"sub":"%s","email":"%s"}', v_hrd_id::text, 'hrd@kotacoffee.id')::jsonb, 'email', v_hrd_id::text);
    
    INSERT INTO employees (user_id, role_id, full_name, email, pin, status)
    VALUES (v_hrd_id, v_role_hrd, 'Staff HRD', 'hrd@kotacoffee.id', '111111', 'Active');
  END IF;

  -- 2. AKUN SUPERVISOR (PIN: 222222)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'spv@kotacoffee.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_spv_id, '00000000-0000-0000-0000-000000000000', 'spv@kotacoffee.id', crypt('222222', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated');
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id)
    VALUES (gen_random_uuid(), v_spv_id, format('{"sub":"%s","email":"%s"}', v_spv_id::text, 'spv@kotacoffee.id')::jsonb, 'email', v_spv_id::text);
    
    INSERT INTO employees (user_id, role_id, full_name, email, pin, status)
    VALUES (v_spv_id, v_role_spv, 'Staff Supervisor', 'spv@kotacoffee.id', '222222', 'Active');
  END IF;

  -- 3. AKUN FINANCE (PIN: 333333)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'finance@kotacoffee.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_fin_id, '00000000-0000-0000-0000-000000000000', 'finance@kotacoffee.id', crypt('333333', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated');
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id)
    VALUES (gen_random_uuid(), v_fin_id, format('{"sub":"%s","email":"%s"}', v_fin_id::text, 'finance@kotacoffee.id')::jsonb, 'email', v_fin_id::text);
    
    INSERT INTO employees (user_id, role_id, full_name, email, pin, status)
    VALUES (v_fin_id, v_role_fin, 'Staff Finance', 'finance@kotacoffee.id', '333333', 'Active');
  END IF;

  -- 4. AKUN KASIR (Email: kasir@kotacoffee.id, Password: kasirpassword)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kasir@kotacoffee.id') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_ksr_id, '00000000-0000-0000-0000-000000000000', 'kasir@kotacoffee.id', crypt('kasirpassword', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated');
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id)
    VALUES (gen_random_uuid(), v_ksr_id, format('{"sub":"%s","email":"%s"}', v_ksr_id::text, 'kasir@kotacoffee.id')::jsonb, 'email', v_ksr_id::text);
    
    INSERT INTO employees (user_id, role_id, full_name, email, pin, status)
    VALUES (v_ksr_id, v_role_ksr, 'Crew Kasir', 'kasir@kotacoffee.id', '444444', 'Active');
  END IF;

END $$;
