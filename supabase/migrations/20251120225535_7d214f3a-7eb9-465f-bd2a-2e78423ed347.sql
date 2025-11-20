-- Migrate all static pages to custom_pages table for unified management

-- 1. About Us Page
INSERT INTO custom_pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'about-us',
  'About Us',
  '{
    "type": "structured",
    "sections": {
      "header": {
        "heading": "About HealthScribe",
        "subtitle": "Transforming healthcare delivery through intelligent technology and compassionate design"
      },
      "mission": {
        "title": "Our Mission",
        "paragraphs": [
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
        "paragraphs": [
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
    }
  }'::jsonb,
  'About HealthScribe - Healthcare Management Platform',
  'Learn about HealthScribe mission to transform healthcare delivery through intelligent technology',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- 2. Contact Us Page
INSERT INTO custom_pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'contact',
  'Contact Us',
  '{
    "type": "contact",
    "header": {
      "heading": "Contact Us",
      "subtitle": "Have questions? We would love to hear from you."
    },
    "contactInfo": {
      "email": {
        "title": "Email Us",
        "emails": ["support@healthscribe.com", "sales@healthscribe.com"]
      },
      "phone": {
        "title": "Call Us",
        "number": "+1 (555) 123-4567",
        "hours": "Mon-Fri 9AM-6PM EST"
      },
      "address": {
        "title": "Visit Us",
        "lines": ["Healthcare Technology Center", "Medical District", "Innovation Quarter"]
      }
    },
    "enterprise": {
      "title": "Enterprise Solutions",
      "description": "Looking for custom solutions for your healthcare organization?",
      "buttonText": "Contact Sales Team"
    }
  }'::jsonb,
  'Contact HealthScribe - Get in Touch',
  'Have questions about HealthScribe? Contact our support team via email, phone, or visit our office',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- 3. Privacy Policy Page  
INSERT INTO custom_pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'privacy-policy',
  'Privacy Policy',
  '{
    "type": "legal",
    "lastUpdated": "November 20, 2024",
    "icon": "Shield",
    "sections": [
      {
        "title": "1. Information We Collect",
        "content": "We collect information necessary to provide our healthcare management services:",
        "bullets": [
          "Account information (name, email, credentials)",
          "Professional information (medical license, specialization)",
          "Patient data entered through the platform",
          "Usage data and analytics",
          "Payment and billing information"
        ]
      },
      {
        "title": "2. How We Use Your Information",
        "content": "Your information is used to:",
        "bullets": [
          "Provide and maintain our services",
          "Process prescriptions and manage patient records",
          "Facilitate appointments and communications",
          "Improve platform functionality and user experience",
          "Comply with legal and regulatory requirements",
          "Send service updates and important notifications"
        ]
      },
      {
        "title": "3. Data Security",
        "content": "We implement enterprise-grade security measures including encryption at rest and in transit, regular security audits, access controls, and secure data centers. All patient data is handled in compliance with healthcare privacy standards."
      },
      {
        "title": "4. Data Sharing",
        "content": "We do not sell your personal information. Data may be shared only in these circumstances:",
        "bullets": [
          "With your explicit consent",
          "Within your clinic for authorized staff",
          "With service providers under strict confidentiality agreements",
          "When required by law or to protect rights and safety"
        ]
      },
      {
        "title": "5. Your Rights",
        "content": "You have the right to:",
        "bullets": [
          "Access your personal data",
          "Correct inaccurate information",
          "Request deletion of your data",
          "Export your data",
          "Opt-out of marketing communications",
          "Lodge complaints with supervisory authorities"
        ]
      },
      {
        "title": "6. Data Retention",
        "content": "We retain data as long as necessary to provide services and comply with legal obligations. Medical records are retained according to healthcare regulations. Inactive accounts may be deleted after appropriate notice."
      },
      {
        "title": "7. Cookies and Tracking",
        "content": "We use essential cookies for platform functionality and analytics cookies to improve our services. You can control cookie preferences through your browser settings."
      },
      {
        "title": "8. Contact Us",
        "content": "For privacy-related questions or to exercise your rights:",
        "contact": {
          "email": "privacy@healthscribe.com",
          "dpo": "dpo@healthscribe.com"
        }
      }
    ]
  }'::jsonb,
  'Privacy Policy - HealthScribe',
  'Learn how HealthScribe collects, uses, and protects your data in compliance with healthcare privacy standards',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- 4. Terms of Service Page
INSERT INTO custom_pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
  'terms-of-service',
  'Terms of Service',
  '{
    "type": "legal",
    "lastUpdated": "November 20, 2024",
    "icon": "FileText",
    "sections": [
      {
        "title": "1. Acceptance of Terms",
        "content": "By accessing and using HealthScribe medical practice management platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
      },
      {
        "title": "2. Service Description",
        "content": "HealthScribe provides a comprehensive healthcare management platform including prescription writing, patient management, appointment scheduling, and clinic collaboration tools. Our services are designed for licensed healthcare professionals."
      },
      {
        "title": "3. User Responsibilities",
        "content": "As a user of HealthScribe, you agree to:",
        "bullets": [
          "Maintain the confidentiality of your account credentials",
          "Use the platform in compliance with applicable healthcare regulations",
          "Ensure all patient data is handled according to privacy laws",
          "Provide accurate and up-to-date information",
          "Use the service only for lawful purposes"
        ]
      },
      {
        "title": "4. Medical Disclaimer",
        "content": "HealthScribe is a tool to assist healthcare professionals. It does not replace professional medical judgment. All medical decisions remain the responsibility of the licensed healthcare provider using the platform."
      },
      {
        "title": "5. Data Privacy and Security",
        "content": "We implement industry-standard security measures to protect your data. All patient information is encrypted and stored securely. We comply with healthcare data protection regulations including HIPAA standards where applicable. For more details, please review our Privacy Policy."
      },
      {
        "title": "6. Subscription and Payment",
        "content": "HealthScribe offers multiple subscription tiers:",
        "bullets": [
          "Free tier with limited features",
          "Pro and Enterprise subscriptions with full feature access",
          "Payments are processed securely through our payment partners",
          "Subscriptions auto-renew unless cancelled",
          "Refunds are subject to our refund policy"
        ]
      },
      {
        "title": "7. Intellectual Property",
        "content": "All content, features, and functionality of HealthScribe are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our platform without written permission."
      },
      {
        "title": "8. Limitation of Liability",
        "content": "HealthScribe is provided as is without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the service in the past 12 months."
      },
      {
        "title": "9. Service Modifications",
        "content": "We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice of significant changes that affect your use of the platform."
      },
      {
        "title": "10. Termination",
        "content": "We may terminate or suspend your account for violations of these terms. You may cancel your subscription at any time through your account settings. Upon termination, you must cease all use of the platform."
      },
      {
        "title": "11. Governing Law",
        "content": "These terms are governed by the laws of the jurisdiction where HealthScribe operates. Any disputes shall be resolved through binding arbitration."
      },
      {
        "title": "12. Contact Information",
        "content": "For questions about these Terms of Service, please contact us at:",
        "contact": {
          "email": "legal@healthscribe.com",
          "address": "Healthcare Technology Center, Medical District"
        }
      },
      {
        "title": "13. Changes to Terms",
        "content": "We may update these terms from time to time. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of the updated terms."
      }
    ],
    "acknowledgment": "By using HealthScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service."
  }'::jsonb,
  'Terms of Service - HealthScribe',
  'Read our terms of service to understand the rules and regulations for using HealthScribe healthcare platform',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();