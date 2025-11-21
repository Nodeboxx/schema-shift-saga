import { useEffect, useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasFeatureAccess, getMinimumTier, FEATURE_NAMES, FeatureKey } from "@/lib/subscriptionFeatures";

interface SubscriptionGateProps {
  children: ReactNode;
  feature?: FeatureKey;
  customFeatureName?: string;
}

export const SubscriptionGate = ({ 
  children, 
  feature, 
  customFeatureName 
}: SubscriptionGateProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userTier, setUserTier] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_tier, subscription_end_date, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (!data) {
        setHasAccess(false);
        return;
      }

      setUserTier(data.subscription_tier);
      const now = new Date();

      // Check if subscription period is still valid
      const hasPaidPeriod =
        data.subscription_end_date && new Date(data.subscription_end_date) > now;
      const hasActiveOrCancelledSubscription =
        (data.subscription_status === "active" || data.subscription_status === "cancelled") &&
        hasPaidPeriod;

      // Check if trial is still valid
      const hasValidTrial = data.subscription_status === "trial" && 
        data.trial_ends_at && 
        new Date(data.trial_ends_at) > now;

      const hasValidSubscription = hasActiveOrCancelledSubscription || hasValidTrial;

      // If feature is specified, check tier-based access
      if (feature && hasValidSubscription) {
        // Default to 'free' tier for trial users or users without tier set
        const effectiveTier = data.subscription_tier || (hasValidTrial ? 'free' : null);
        const tierAccess = hasFeatureAccess(effectiveTier, feature);
        setHasAccess(tierAccess);
      } else {
        setHasAccess(hasValidSubscription);
      }
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
    const featureName = customFeatureName || (feature ? FEATURE_NAMES[feature] : "this feature");
    const minimumTier = feature ? getMinimumTier(feature) : 'pro';
    
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {feature ? "Upgrade Required" : "Premium Feature Locked"}
        </h3>
        
        {feature && userTier && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">
              Current: {userTier}
            </Badge>
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Badge className="capitalize">
              Required: {minimumTier}
            </Badge>
          </div>
        )}
        
        <p className="text-muted-foreground mb-2">
          <span className="font-semibold text-foreground">{featureName}</span> is available on the {' '}
          <span className="font-semibold capitalize">{minimumTier}</span> plan
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
