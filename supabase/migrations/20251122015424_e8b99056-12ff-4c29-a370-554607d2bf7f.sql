-- Create payroll table for clinic doctor payments
CREATE TABLE IF NOT EXISTS public.clinic_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  base_salary NUMERIC(10,2) DEFAULT 0,
  commission_percentage NUMERIC(5,2) DEFAULT 0,
  commission_amount NUMERIC(10,2) DEFAULT 0,
  bonus NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'cheque', 'mobile_banking')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clinic_payroll ENABLE ROW LEVEL SECURITY;

-- Clinic owners can manage payroll for their clinic
CREATE POLICY "Clinic owners can manage payroll"
ON public.clinic_payroll
FOR ALL
USING (
  clinic_id IN (
    SELECT id FROM public.clinics WHERE owner_id = auth.uid()
  )
);

-- Doctors can view their own payroll records
CREATE POLICY "Doctors can view their payroll"
ON public.clinic_payroll
FOR SELECT
USING (doctor_id = auth.uid());

-- Super admins can view all payroll
CREATE POLICY "Super admins can view all payroll"
ON public.clinic_payroll
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_clinic_payroll_clinic_id ON public.clinic_payroll(clinic_id);
CREATE INDEX idx_clinic_payroll_doctor_id ON public.clinic_payroll(doctor_id);
CREATE INDEX idx_clinic_payroll_payment_period ON public.clinic_payroll(payment_period_start, payment_period_end);

-- Trigger to update updated_at
CREATE TRIGGER update_clinic_payroll_updated_at
BEFORE UPDATE ON public.clinic_payroll
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();