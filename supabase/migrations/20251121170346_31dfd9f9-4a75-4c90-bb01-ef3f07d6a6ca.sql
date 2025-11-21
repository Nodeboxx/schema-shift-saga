-- Add demo data for testing appointments, doctors, and admin functionality

-- First, let's ensure we have the correct test users set up
-- Note: This assumes test users already exist from auth.users

-- Add demo clinic
INSERT INTO public.clinics (id, name, slug, owner_id, subscription_status, subscription_tier, subscription_start_date, subscription_end_date, address, phone, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'City Medical Center', 'city-medical-center', 'd1c13bf8-8603-4a2e-b6ef-039f072d41a0', 'active', 'pro', NOW(), NOW() + INTERVAL '1 year', '123 Main St, Dhaka', '+880-1234-567890', 'info@citymedical.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier;

-- Update test doctor profiles with proper subscription
UPDATE public.profiles 
SET 
  subscription_status = 'active',
  subscription_tier = 'pro',
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '1 year',
  full_name = COALESCE(full_name, 'Dr. Test Doctor'),
  specialization = COALESCE(specialization, 'General Medicine'),
  license_number = COALESCE(license_number, 'BMDC-12345'),
  degree_en = COALESCE(degree_en, 'MBBS, FCPS'),
  consultation_fee = COALESCE(consultation_fee, 500),
  is_active = true,
  clinic_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'test@example.com';

-- Add some demo patients for the test doctor
INSERT INTO public.patients (id, user_id, doctor_id, name, age, sex, phone, email, clinic_id)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'd1c13bf8-8603-4a2e-b6ef-039f072d41a0', (SELECT id FROM profiles WHERE email = 'test@example.com'), 'John Smith', '35', 'Male', '+880-1711-111111', 'john.smith@example.com', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', 'd1c13bf8-8603-4a2e-b6ef-039f072d41a0', (SELECT id FROM profiles WHERE email = 'test@example.com'), 'Sarah Johnson', '28', 'Female', '+880-1722-222222', 'sarah.j@example.com', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', 'd1c13bf8-8603-4a2e-b6ef-039f072d41a0', (SELECT id FROM profiles WHERE email = 'test@example.com'), 'Ahmed Rahman', '45', 'Male', '+880-1733-333333', 'ahmed.r@example.com', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Add some demo appointments
INSERT INTO public.appointments (id, doctor_id, patient_id, clinic_id, start_time, end_time, status, type, patient_type, created_by)
VALUES 
  ('55555555-5555-5555-5555-555555555555', (SELECT id FROM profiles WHERE email = 'test@example.com'), '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 'scheduled', 'in-person', 'scheduled', (SELECT id FROM profiles WHERE email = 'test@example.com')),
  ('66666666-6666-6666-6666-666666666666', (SELECT id FROM profiles WHERE email = 'test@example.com'), '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '30 minutes', 'scheduled', 'in-person', 'scheduled', (SELECT id FROM profiles WHERE email = 'test@example.com')),
  ('77777777-7777-7777-7777-777777777777', (SELECT id FROM profiles WHERE email = 'test@example.com'), '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 'completed', 'in-person', 'scheduled', (SELECT id FROM profiles WHERE email = 'test@example.com'))
ON CONFLICT (id) DO NOTHING;

-- Add some demo prescriptions
INSERT INTO public.prescriptions (id, user_id, doctor_id, patient_id, clinic_id, patient_name, patient_age, patient_sex, prescription_date, page_count)
VALUES 
  ('88888888-8888-8888-8888-888888888888', (SELECT id FROM profiles WHERE email = 'test@example.com'), (SELECT id FROM profiles WHERE email = 'test@example.com'), '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'John Smith', '35', 'Male', NOW(), 1),
  ('99999999-9999-9999-9999-999999999999', (SELECT id FROM profiles WHERE email = 'test@example.com'), (SELECT id FROM profiles WHERE email = 'test@example.com'), '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sarah Johnson', '28', 'Female', NOW() - INTERVAL '1 day', 1)
ON CONFLICT (id) DO NOTHING;