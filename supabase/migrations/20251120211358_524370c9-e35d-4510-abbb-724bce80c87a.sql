-- Recreate patient insert policy so it no longer restricts anon inserts
DROP POLICY IF EXISTS "Users can insert own patients" ON public.patients;

CREATE POLICY "Users can insert own patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate doctor appointments management policy scoped to authenticated users only
DROP POLICY IF EXISTS "Doctors can manage their appointments" ON public.appointments;

CREATE POLICY "Doctors can manage their appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());