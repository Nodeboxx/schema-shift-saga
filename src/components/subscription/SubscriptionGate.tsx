import { useEffect, useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionGateProps {
  children: ReactNode;
  feature?: string;
}

export const SubscriptionGate = ({ children, feature = "this feature" }: SubscriptionGateProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (!data) {
        setHasAccess(false);
        return;
      }

      // Check if has active subscription or valid trial
      const hasActiveSubscription = data.subscription_status === "active";
      const hasValidTrial = data.subscription_status === "trial" && 
        data.trial_ends_at && 
        new Date(data.trial_ends_at) > new Date();

      setHasAccess(hasActiveSubscription || hasValidTrial);
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    }
  };

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Subscription Required</h3>
        <p className="text-muted-foreground mb-6">
          You need an active subscription to access {feature}. Start your free trial or choose a plan to continue.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/dashboard?tab=overview")}>
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
