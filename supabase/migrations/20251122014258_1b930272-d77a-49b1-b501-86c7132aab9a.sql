-- Insert Clinic pricing plan into CMS
DO $$
DECLARE
  v_pricing_section_id uuid;
  v_existing_content jsonb;
  v_new_content jsonb;
BEGIN
  -- Get the pricing_plans section
  SELECT id, content INTO v_pricing_section_id, v_existing_content
  FROM cms_sections
  WHERE section_name = 'pricing_plans';
  
  -- If pricing_plans section doesn't exist, create it
  IF v_pricing_section_id IS NULL THEN
    INSERT INTO cms_sections (section_name, title, content, is_published, display_order)
    VALUES (
      'pricing_plans',
      'Pricing Plans',
      jsonb_build_object(
        'heading', 'Simple, Transparent Pricing',
        'subtitle', 'Choose the plan that fits your practice best. Every plan works on all devices and includes 24/7 support—no hidden fees, ever.',
        'plans', jsonb_build_array(
          jsonb_build_object(
            'id', 'prescription',
            'name', 'Prescription Plan',
            'price', 800,
            'currency', '৳',
            'period', 'month',
            'description', 'Perfect for doctors who only need digital prescription management.',
            'features', jsonb_build_array(
              'Smart Prescription Builder',
              '28,000+ Medicine Database',
              'Customizable Templates',
              'Header-less Print Support',
              'Send via WhatsApp/Email/Messenger',
              'Org/Chamber Switch',
              '24/7 Hotline Support'
            ),
            'yearlyPrice', 8000,
            'yearlySavings', 1600,
            'featured', false,
            'badge', ''
          ),
          jsonb_build_object(
            'id', 'appointment_prescription',
            'name', 'Appointment + Prescription Plan',
            'price', 1000,
            'currency', '৳',
            'period', 'month',
            'description', 'Ideal for growing practices with prescriptions and appointments together.',
            'features', jsonb_build_array(
              'Everything in Prescription Plan',
              'Online Appointment Scheduling',
              'Appointment Calendar (Day/Week/Month view)',
              'Auto SMS Reminders',
              'Easy Reschedule & Cancel',
              'Time Slot Management',
              'Walk-In & Scheduled Patients'
            ),
            'yearlyPrice', 10000,
            'yearlySavings', 2000,
            'featured', true,
            'badge', 'Most Popular'
          ),
          jsonb_build_object(
            'id', 'fullcare',
            'name', 'Full Care Plan',
            'price', 2000,
            'currency', '৳',
            'period', 'month',
            'description', 'Best for healthcare professionals who want to offer a complete, modern patient care experience.',
            'features', jsonb_build_array(
              'Everything in Appointment + Prescription Plan',
              'Patient Journey Tracker',
              'Progress & Milestone Monitoring',
              'Health Advice Notifications',
              'Multidisciplinary care support',
              'Patient Questionnaires',
              'Doctor-Patient Engagement Tools',
              'Advanced Analytics & Reports'
            ),
            'yearlyPrice', 20000,
            'yearlySavings', 4000,
            'featured', false,
            'badge', 'Excellent Choice'
          ),
          jsonb_build_object(
            'id', 'clinic',
            'name', 'Clinic',
            'price', 8990,
            'currency', '৳',
            'period', 'month',
            'description', 'Enterprise solution for clinics with multiple doctors and advanced management needs.',
            'features', jsonb_build_array(
              'Multi-doctor management',
              'Doctor account creation & removal',
              'Payroll management',
              'Revenue analytics & reporting',
              'Patient management across doctors',
              'Team collaboration tools',
              'Appointment scheduling',
              'Custom branding',
              'Priority support',
              'Dedicated account manager'
            ),
            'yearlyPrice', 99000,
            'yearlySavings', 8880,
            'featured', false,
            'badge', ''
          )
        ),
        'benefits', jsonb_build_array(
          jsonb_build_object('icon', 'Shield', 'text', '100% Secure & Private'),
          jsonb_build_object('icon', 'Monitor', 'text', 'Works on All Devices'),
          jsonb_build_object('icon', 'Clock', 'text', '24/7 Support')
        )
      ),
      true,
      3
    )
    RETURNING id INTO v_pricing_section_id;
  ELSE
    -- Update existing pricing_plans to include clinic plan
    -- Check if clinic plan already exists
    IF NOT (v_existing_content->'plans' @> '[{"id": "clinic"}]'::jsonb) THEN
      -- Get existing plans array
      v_existing_content := jsonb_set(
        v_existing_content,
        '{plans}',
        (v_existing_content->'plans') || jsonb_build_array(
          jsonb_build_object(
            'id', 'clinic',
            'name', 'Clinic',
            'price', 8990,
            'currency', '৳',
            'period', 'month',
            'description', 'Enterprise solution for clinics with multiple doctors and advanced management needs.',
            'features', jsonb_build_array(
              'Multi-doctor management',
              'Doctor account creation & removal',
              'Payroll management',
              'Revenue analytics & reporting',
              'Patient management across doctors',
              'Team collaboration tools',
              'Appointment scheduling',
              'Custom branding',
              'Priority support',
              'Dedicated account manager'
            ),
            'yearlyPrice', 99000,
            'yearlySavings', 8880,
            'featured', false,
            'badge', ''
          )
        )
      );
      
      UPDATE cms_sections
      SET content = v_existing_content,
          updated_at = now()
      WHERE id = v_pricing_section_id;
    END IF;
  END IF;
END $$;