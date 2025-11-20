-- Add buttonUrl field to existing pricing plans
UPDATE cms_sections
SET content = jsonb_set(
  content,
  '{plans}',
  (
    SELECT jsonb_agg(
      jsonb_set(plan, '{buttonUrl}', '"/register"'::jsonb)
    )
    FROM jsonb_array_elements(content->'plans') AS plan
  )
)
WHERE section_name = 'pricing_plans'
AND NOT content->'plans'->0 ? 'buttonUrl';