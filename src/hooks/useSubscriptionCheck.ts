import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  hasAccess: boolean;
  status: string;
  tier: string;
  loading: boolean;
}

export const useSubscriptionCheck = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    hasAccess: false,
    status: "inactive",
    tier: "free",
    loading: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();

    // Set up realtime listener for subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          checkSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription({
          hasAccess: false,
          status: "inactive",
          tier: "free",
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_tier, trial_ends_at, subscription_end_date, clinic_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        setSubscription({
          hasAccess: false,
          status: "inactive",
          tier: "free",
          loading: false,
        });
        return;
      }

      // Clinic-managed doctors have full access (enterprise features)
      if (data.clinic_id) {
        setSubscription({
          hasAccess: true,
          status: "active",
          tier: "enterprise",
          loading: false,
        });
        return;
      }

      const now = new Date();

      // Check if paid subscription period (active or cancelled) is still valid
      const hasPaidPeriod =
        data.subscription_end_date && new Date(data.subscription_end_date) > now;
      const hasActiveOrCancelledSubscription =
        (data.subscription_status === "active" || data.subscription_status === "cancelled") &&
        hasPaidPeriod;
      
      // Check if trial is still valid
      const hasValidTrial = 
        data.subscription_status === "trial" &&
        data.trial_ends_at &&
        new Date(data.trial_ends_at) > now;

      const hasAccess = hasActiveOrCancelledSubscription || hasValidTrial;

      setSubscription({
        hasAccess,
        status: data.subscription_status || "inactive",
        tier: data.subscription_tier || "free",
        loading: false,
      });

      // If subscription expired, show notification
      if (!hasAccess && data.subscription_status !== "inactive") {
        toast({
          title: "Subscription Expired",
          description: "Your subscription has expired. Please renew to continue using premium features.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription({
        hasAccess: false,
        status: "inactive",
        tier: "free",
        loading: false,
      });
    }
  };

  const requireSubscription = (feature: string = "this feature") => {
    if (!subscription.hasAccess && !subscription.loading) {
      toast({
        title: "Subscription Required",
        description: `You need an active subscription to access ${feature}`,
        variant: "destructive",
      });
      navigate("/dashboard?tab=overview");
      return false;
    }
    return true;
  };

  return {
    ...subscription,
    requireSubscription,
    refetch: checkSubscription,
  };
};
