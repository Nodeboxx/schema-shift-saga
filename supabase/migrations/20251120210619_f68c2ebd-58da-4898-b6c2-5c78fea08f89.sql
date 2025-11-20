-- Seed core static pages so they appear in Page Management
INSERT INTO public.custom_pages (title, slug, content, meta_title, meta_description, is_published)
VALUES
  ('About Us', 'about', '{"html": "<h1>About HealthScribe</h1><p>HealthScribe is a modern prescription and clinic management platform inspired by the best of MediStack, built to streamline clinical workflows and patient engagement.</p>"}', 'About HealthScribe', 'Learn about the HealthScribe platform and mission.', true),
  ('Contact Us', 'contact', '{"html": "<h1>Contact HealthScribe</h1><p>Reach out to us for support, onboarding, or partnership opportunities.</p><p>Email: support@healthscribe.com</p>"}', 'Contact HealthScribe', 'Get in touch with the HealthScribe team.', true),
  ('Terms of Service', 'terms', '{"html": "<h1>Terms of Service</h1><p>These terms govern your use of the HealthScribe platform. Please review them carefully before using the service.</p>"}', 'Terms of Service', 'Read the terms of service for using HealthScribe.', true),
  ('Privacy Policy', 'privacy', '{"html": "<h1>Privacy Policy</h1><p>We take data protection seriously. This policy explains how HealthScribe collects, uses, and protects your information.</p>"}', 'Privacy Policy', 'Understand how HealthScribe handles your data and privacy.', true)
ON CONFLICT DO NOTHING;