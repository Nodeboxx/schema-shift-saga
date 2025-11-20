-- Add About Us section to CMS
INSERT INTO cms_sections (section_name, title, content, display_order, is_published) VALUES
('about_us', 'About Us', '{
  "heading": "About HealthScribe",
  "subtitle": "Transforming healthcare delivery through intelligent technology and compassionate design",
  "mission": {
    "title": "Our Mission",
    "content": [
      "HealthScribe exists to empower healthcare professionals with modern, intuitive technology that simplifies practice management and enhances patient care. We believe that by reducing administrative burden, we enable doctors to dedicate more time to what truly matters - their patients.",
      "Our platform combines cutting-edge AI technology with practical healthcare workflows, creating a seamless experience for medical professionals worldwide."
    ]
  },
  "values": [
    {
      "icon": "HeartPulse",
      "title": "Patient-Centered",
      "description": "Every feature we build is designed to improve patient outcomes and healthcare delivery."
    },
    {
      "icon": "Users",
      "title": "Empowering Providers",
      "description": "We give healthcare professionals the tools they need to focus on what matters most - patient care."
    },
    {
      "icon": "Target",
      "title": "Innovation",
      "description": "Continuously advancing healthcare technology with AI and modern solutions."
    },
    {
      "icon": "Award",
      "title": "Excellence",
      "description": "Committed to the highest standards of quality, security, and reliability."
    }
  ],
  "story": {
    "title": "Our Story",
    "content": [
      "Founded by healthcare professionals and technology experts, HealthScribe was born from firsthand experience with the challenges of modern medical practice. We witnessed doctors spending countless hours on paperwork, struggling with outdated systems, and longing for better tools.",
      "Today, HealthScribe serves thousands of healthcare providers across multiple countries, helping them streamline their workflows, improve patient engagement, and deliver better care outcomes.",
      "We are just getting started. Our vision is a world where every healthcare provider has access to intelligent, affordable technology that amplifies their impact and enriches the patient experience."
    ]
  },
  "cta": {
    "heading": "Join Thousands of Healthcare Professionals",
    "buttonText": "Get Started Today",
    "buttonUrl": "/register"
  }
}'::jsonb, 3, true)
ON CONFLICT (section_name) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();