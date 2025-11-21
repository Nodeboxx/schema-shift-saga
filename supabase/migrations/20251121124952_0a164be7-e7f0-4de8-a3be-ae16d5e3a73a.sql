-- Add payment method and order tracking to subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;

-- Update profiles to track trial dates
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_start_date DATE,
ADD COLUMN IF NOT EXISTS subscription_end_date DATE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Add comment
COMMENT ON COLUMN subscriptions.payment_method IS 'Payment method used: card, bkash, wire';
COMMENT ON COLUMN subscriptions.payment_reference IS 'Transaction ID or reference number';
COMMENT ON COLUMN subscriptions.approved_by IS 'Admin who approved the subscription';
COMMENT ON COLUMN subscriptions.approved_at IS 'When the subscription was approved';

-- Update RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can create subscriptions" ON subscriptions;
CREATE POLICY "Users can create subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
ON subscriptions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));