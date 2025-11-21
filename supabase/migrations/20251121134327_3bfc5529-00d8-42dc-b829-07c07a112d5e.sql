-- Create orders table for payment approval workflow
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT '৳',
  billing_cycle TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  old_tier TEXT,
  new_tier TEXT,
  old_end_date TIMESTAMP WITH TIME ZONE,
  new_end_date TIMESTAMP WITH TIME ZONE,
  performed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_lifetime flag to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for subscription_logs
CREATE POLICY "Users can view their own subscription logs"
  ON public.subscription_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription logs"
  ON public.subscription_logs FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert subscription logs"
  ON public.subscription_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON public.subscription_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription_id ON public.subscription_logs(subscription_id);

-- Update trigger for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.subscription_logs (
      user_id,
      subscription_id,
      action,
      old_status,
      new_status,
      old_tier,
      new_tier,
      old_end_date,
      new_end_date,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'subscription_updated',
      OLD.status,
      NEW.status,
      OLD.tier,
      NEW.tier,
      OLD.end_date,
      NEW.end_date,
      jsonb_build_object(
        'old_billing_cycle', OLD.billing_cycle,
        'new_billing_cycle', NEW.billing_cycle
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_logs (
      user_id,
      subscription_id,
      action,
      new_status,
      new_tier,
      new_end_date,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'subscription_created',
      NEW.status,
      NEW.tier,
      NEW.end_date,
      jsonb_build_object('billing_cycle', NEW.billing_cycle)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_subscription_changes
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();