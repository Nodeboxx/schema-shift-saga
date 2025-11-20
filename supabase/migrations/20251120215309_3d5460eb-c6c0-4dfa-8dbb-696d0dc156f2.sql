-- Populate cms_sections with current homepage content
INSERT INTO cms_sections (section_name, title, content, display_order, is_published) VALUES
('hero', 'Hero Section', '{
  "title": "Unifying Healthcare",
  "subtitle": "Simplifying Lives", 
  "description": "Transform your healthcare practice with intelligent automation, seamless patient engagement, and meaningful results made possible by HealthScribe",
  "cta_primary": "Start Free Trial",
  "cta_secondary": "Watch Demo",
  "announcement": "🎉 Trusted by doctors. Rated the #1 choice in digital healthcare management",
  "stats": [
    {"value": "5000+", "label": "Active Doctors"},
    {"value": "100k+", "label": "Patients Served"},
    {"value": "500k+", "label": "Prescriptions"},
    {"value": "99.9%", "label": "Uptime"}
  ]
}'::jsonb, 0, true),

('features', 'Features Section', '{
  "title": "Everything You Need to Run Your Practice",
  "subtitle": "Comprehensive digital healthcare solutions designed for modern medical professionals",
  "features": [
    {
      "icon": "FileText",
      "title": "Digital Prescription",
      "description": "Create professional prescriptions instantly with AI-powered templates and voice input.",
      "gradient": "from-blue-500 to-cyan-500"
    },
    {
      "icon": "Users",
      "title": "Patient Portal",
      "description": "Complete patient management with medical history, appointments, and real-time updates.",
      "gradient": "from-purple-500 to-pink-500"
    },
    {
      "icon": "Calendar",
      "title": "Smart Scheduling",
      "description": "Intelligent appointment booking with automated reminders and queue management.",
      "gradient": "from-green-500 to-emerald-500"
    },
    {
      "icon": "Activity",
      "title": "Health Analytics",
      "description": "Track patient vitals, treatment outcomes, and practice performance metrics.",
      "gradient": "from-orange-500 to-red-500"
    },
    {
      "icon": "Shield",
      "title": "Secure & Compliant",
      "description": "Bank-level encryption with full compliance to healthcare data protection standards.",
      "gradient": "from-indigo-500 to-purple-500"
    },
    {
      "icon": "Microscope",
      "title": "Lab Integration",
      "description": "Seamless integration with diagnostic labs for instant test results and reports.",
      "gradient": "from-pink-500 to-rose-500"
    }
  ]
}'::jsonb, 1, true),

('pricing', 'Pricing Section', '{
  "title": "Choose Your Plan",
  "subtitle": "Flexible pricing for practices of all sizes"
}'::jsonb, 2, true),

('booking', 'Appointment Booking', '{
  "title": "Book an Appointment",
  "subtitle": "Schedule your visit with our experienced medical professionals. Choose your preferred doctor, date, and time."
}'::jsonb, 3, true)

ON CONFLICT (section_name) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- Add logo and favicon to site_settings
INSERT INTO site_settings (key, value) VALUES
('site_logo', '{"url": "", "alt": "HealthScribe Logo"}'::jsonb),
('site_favicon', '{"url": "/favicon.ico"}'::jsonb),
('site_name', '{"value": "HealthScribe"}'::jsonb)
ON CONFLICT (key) DO NOTHING;