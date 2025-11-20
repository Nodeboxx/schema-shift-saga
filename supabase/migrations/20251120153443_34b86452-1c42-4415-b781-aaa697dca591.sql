-- Add left column template fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS left_template_sections JSONB DEFAULT '[
  {"id": "cc", "title": "Presenting Complains:", "enabled": true, "order": 1},
  {"id": "ph", "title": "P/H:", "enabled": true, "order": 2, "fields": [
    {"label": "IHD", "value": ""},
    {"label": "HTN", "value": ""},
    {"label": "DM", "value": ""},
    {"label": "CKD", "value": ""},
    {"label": "CVD/PAD", "value": ""},
    {"label": "Thyroid", "value": ""},
    {"label": "BA/COPD", "value": ""},
    {"label": "Dyslipidaemia", "value": ""}
  ]},
  {"id": "oe", "title": "On Examination:", "enabled": true, "order": 3},
  {"id": "dx", "title": "Diagnosis:", "enabled": true, "order": 4},
  {"id": "adv", "title": "Advice:", "enabled": true, "order": 5},
  {"id": "instructions", "title": "Instructions:", "enabled": true, "order": 6},
  {"id": "followup", "title": "Follow Up:", "enabled": true, "order": 7}
]'::jsonb;