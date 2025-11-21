import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, X } from "lucide-react";

export const SubscriptionExpiryBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [subscriptionType, setSubscriptionType] = useState<"trial" | "subscription">("trial");
  const navigate = useNavigate();

  useEffect(() => {
    checkExpiry();
  }, []);

  const checkExpiry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at, subscription_end_date")
        .eq("id", user.id)
        .single();

      if (!data) return;

      let endDate: Date | null = null;
      let type: "trial" | "subscription" = "trial";

      if (data.subscription_status === "trial" && data.trial_ends_at) {
        endDate = new Date(data.trial_ends_at);
        type = "trial";
      } else if (data.subscription_status === "active" && data.subscription_end_date) {
        endDate = new Date(data.subscription_end_date);
        type = "subscription";
      }

      if (endDate) {
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days <= 7 && days > 0) {
          setDaysRemaining(days);
          setSubscriptionType(type);
          setShowBanner(true);
        }
      }
    } catch (error) {
      console.error("Error checking expiry:", error);
    }
  };

  if (!showBanner) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <Alert 
      variant={isUrgent ? "destructive" : "default"}
      className="mb-6 relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={() => setShowBanner(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {isUrgent ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      
      <AlertTitle className="font-semibold">
        {subscriptionType === "trial" 
          ? "Your Trial is Ending Soon" 
          : "Subscription Renewal Required"}
      </AlertTitle>
      
      <AlertDescription className="mt-2">
        <div className="flex items-center justify-between">
          <span>
            Your {subscriptionType} will expire in{" "}
            <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.
            {subscriptionType === "trial" 
              ? " Choose a plan to continue using all features." 
              : " Renew now to avoid service interruption."}
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate("/?scroll=pricing")}
            variant={isUrgent ? "secondary" : "default"}
          >
            {subscriptionType === "trial" ? "Choose Plan" : "Renew Now"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
