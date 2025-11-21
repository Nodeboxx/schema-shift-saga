import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CreditCard, TrendingUp, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "./UpgradeModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubscriptionData {
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  trial_started_at: string | null;
}

export const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, trial_ends_at, subscription_start_date, subscription_end_date, trial_started_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error: any) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if trial was already used (one-time restriction)
      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_started_at")
        .eq("id", user.id)
        .single();

      if (profile?.trial_started_at) {
        toast({
          title: "Trial Already Used",
          description: "You have already used your free trial. Please choose a paid plan to continue.",
          variant: "destructive",
        });
        return;
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "free" as any,
          subscription_status: "trial",
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEnd.toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Trial Started!",
        description: "Your 14-day free trial has been activated. This is a one-time offer.",
      });

      loadSubscription();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRemainingDays = () => {
    if (!subscription) return 0;

    const endDate = subscription.subscription_status === "trial" 
      ? subscription.trial_ends_at 
      : subscription.subscription_end_date;

    if (!endDate) return 0;

    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressColor = () => {
    const days = getRemainingDays();
    if (days > 7) return "bg-green-500";
    if (days > 3) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressPercentage = () => {
    if (!subscription) return 0;
    
    const totalDays = subscription.subscription_status === "trial" ? 14 : 30;
    const remaining = getRemainingDays();
    return Math.max(0, Math.min(100, (remaining / totalDays) * 100));
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You can continue using features until the end of your billing period.",
      });

      loadSubscription();
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || subscription.subscription_status === "inactive") {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Get Started with MedDexPro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Start your free 14-day trial or choose a plan to unlock all features
          </p>
          <div className="flex gap-3">
            <Button onClick={startTrial} className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              Start Free Trial
            </Button>
            <Button onClick={() => navigate("/?scroll=pricing")} variant="outline" className="flex-1">
              <CreditCard className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const remainingDays = getRemainingDays();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription Status</CardTitle>
          <Badge variant={subscription.subscription_status === "active" ? "default" : "secondary"}>
            {subscription.subscription_status === "trial" 
              ? "Free Trial" 
              : subscription.subscription_status === "active" 
              ? subscription.subscription_tier 
              : subscription.subscription_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color-coded status bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {remainingDays} days remaining
            </span>
            <Badge variant={remainingDays > 7 ? "default" : remainingDays > 3 ? "secondary" : "destructive"}>
              {remainingDays > 7 ? "Good" : remainingDays > 3 ? "Expiring Soon" : "Critical"}
            </Badge>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                remainingDays > 7 ? "bg-green-500" : remainingDays > 3 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Prominent subscription details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {subscription.subscription_start_date && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
                <p className="text-sm font-medium">
                  {new Date(subscription.subscription_start_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {(subscription.subscription_end_date || subscription.trial_ends_at) && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {subscription.subscription_status === "trial" ? "Trial Ends" : "Renewal Date"}
                </div>
                <p className="text-sm font-medium">
                  {new Date(
                    subscription.subscription_end_date || subscription.trial_ends_at!
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Next billing info for active subscriptions */}
          {subscription.subscription_status === "active" && subscription.subscription_end_date && (
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(subscription.subscription_end_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setUpgradeModalOpen(true)} className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            {subscription.subscription_status === "trial" 
              ? "Choose Plan" 
              : subscription.subscription_tier === "pro" 
              ? "Extend Plan" 
              : "Upgrade Plan"}
          </Button>
          
          {subscription.subscription_status === "active" && (
            <Button 
              onClick={() => setCancelDialogOpen(true)} 
              variant="outline" 
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Subscription
            </Button>
          )}
        </div>

        {subscription.subscription_status === "trial" && remainingDays <= 3 && (
          <div className="rounded-lg bg-orange-500/10 p-4 border border-orange-500/20">
            <p className="text-sm font-medium text-orange-600">
              Your trial is ending soon! Choose a plan to continue using all features.
            </p>
            <Button 
              onClick={() => setUpgradeModalOpen(true)} 
              size="sm" 
              className="mt-2"
            >
              Choose Plan
            </Button>
          </div>
        )}
      </CardContent>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
        onSuccess={loadSubscription}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
