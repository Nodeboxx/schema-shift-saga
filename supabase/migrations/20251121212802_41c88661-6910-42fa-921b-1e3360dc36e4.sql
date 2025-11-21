-- Fix notifications_config RLS to allow system/public insertions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Clinic admins can manage their notifications" ON public.notifications_config;
DROP POLICY IF EXISTS "Super admins can manage notifications" ON public.notifications_config;

-- Create new policies that allow public appointment system to create notifications
CREATE POLICY "Super admins can manage notifications"
ON public.notifications_config
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Clinic admins can manage their notifications"
ON public.notifications_config
FOR ALL
TO authenticated
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  )
);

-- Allow system/public to insert notifications (for appointment booking)
CREATE POLICY "System can insert notifications"
ON public.notifications_config
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading notifications
CREATE POLICY "Users can view notifications"
ON public.notifications_config
FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT id FROM clinics WHERE owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin')
);