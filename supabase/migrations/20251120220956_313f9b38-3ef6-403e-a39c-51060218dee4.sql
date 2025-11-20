-- Add pricing plans section to CMS
INSERT INTO cms_sections (section_name, title, content, display_order, is_published) VALUES
('pricing_plans', 'Pricing Plans', '{
  "heading": "Simple, Transparent Pricing",
  "subtitle": "Choose the plan that fits your practice best. Every plan works on all devices and includes 24/7 support—no hidden fees, ever.",
  "plans": [
    {
      "id": "prescription",
      "name": "Prescription Plan",
      "price": 800,
      "currency": "৳",
      "period": "month",
      "description": "Perfect for doctors who only need digital prescription management.",
      "features": [
        "Smart Prescription Builder",
        "28,000+ Medicine Database",
        "Customizable Templates",
        "Header-less Print Support",
        "Send via WhatsApp/Email/Messenger",
        "Org/Chamber Switch",
        "24/7 Hotline Support"
      ],
      "yearlyPrice": 8000,
      "yearlySavings": 1600,
      "featured": false,
      "badge": ""
    },
    {
      "id": "appointment_prescription",
      "name": "Appointment + Prescription Plan",
      "price": 1000,
      "currency": "৳",
      "period": "month",
      "description": "Ideal for growing practices with prescriptions and appointments together.",
      "features": [
        "Everything in Prescription Plan",
        "Online Appointment Scheduling",
        "Appointment Calendar (Day/Week/Month view)",
        "Auto SMS Reminders",
        "Easy Reschedule & Cancel",
        "Time Slot Management",
        "Walk-In & Scheduled Patients",
        "Appointment History",
        "Telemedicine Integration"
      ],
      "yearlyPrice": 10000,
      "yearlySavings": 2000,
      "featured": true,
      "badge": "Most Popular"
    },
    {
      "id": "fullcare",
      "name": "Full Care Plan",
      "price": 2000,
      "currency": "৳",
      "period": "month",
      "description": "Best for healthcare professionals who want to offer a complete, modern patient care experience.",
      "features": [
        "Everything in Appointment + Prescription Plan",
        "Patient Journey Tracker",
        "Progress & Milestone Monitoring",
        "Health Advice Notifications",
        "Multidisciplinary care support",
        "Patient Questionnaires",
        "Doctor-Patient Engagement Tools",
        "Advanced Analytics & Reports",
        "Clinical Insights & Research Support",
        "Personalised Onboarding",
        "Priority Feature Requests",
        "Dedicated Team Training"
      ],
      "yearlyPrice": 20000,
      "yearlySavings": 4000,
      "featured": false,
      "badge": "Excellent Choice"
    }
  ],
  "benefits": [
    {
      "icon": "Shield",
      "text": "No hidden charges"
    },
    {
      "icon": "Monitor",
      "text": "Works on all devices"
    },
    {
      "icon": "Clock",
      "text": "Cancel anytime"
    }
  ]
}'::jsonb, 2, true)
ON CONFLICT (section_name) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();