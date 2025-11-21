-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;