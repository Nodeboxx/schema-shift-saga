import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, X } from "lucide-react";

interface ClinicSubscriptionExpiryBannerProps {
  clinic: any;
}

export const ClinicSubscriptionExpiryBanner = ({ clinic }: ClinicSubscriptionExpiryBannerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    checkExpiry();
  }, [clinic]);

  const checkExpiry = () => {
    if (!clinic?.subscription_end_date) return;

    const endDate = new Date(clinic.subscription_end_date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 7 && days > 0) {
      setDaysRemaining(days);
      setShowBanner(true);
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
        Clinic Subscription Expiring Soon
      </AlertTitle>
      
      <AlertDescription className="mt-2">
        <div className="flex items-center justify-between">
          <span>
            Your clinic subscription will expire in{" "}
            <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.
            Renew now to avoid interruption for all clinic doctors and staff.
          </span>
          <Button 
            size="sm" 
            variant={isUrgent ? "secondary" : "default"}
          >
            Contact Admin to Renew
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
