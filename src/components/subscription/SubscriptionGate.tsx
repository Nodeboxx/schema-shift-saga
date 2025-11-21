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
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Premium Feature Locked
        </h3>
        <p className="text-muted-foreground mb-2">
          You need an active subscription to access <span className="font-semibold text-foreground">{feature}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Upgrade your plan to unlock this feature and many more powerful tools for your practice.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/?scroll=pricing")} size="lg" className="w-full">
            View Plans & Pricing
          </Button>
          <Button onClick={() => navigate("/dashboard?tab=overview")} variant="outline" size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
