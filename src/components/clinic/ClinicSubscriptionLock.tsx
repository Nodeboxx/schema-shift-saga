import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle } from "lucide-react";

interface ClinicSubscriptionLockProps {
  clinic: any;
}

export const ClinicSubscriptionLock = ({ clinic }: ClinicSubscriptionLockProps) => {
  const isPendingApproval = clinic.subscription_status === 'pending_approval';
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive">
        <CardContent className="p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Lock className="h-20 w-20 text-destructive" />
              <AlertTriangle className="h-8 w-8 text-destructive absolute -top-2 -right-2" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {isPendingApproval 
                ? "Clinic Pending Approval" 
                : "Clinic Subscription Expired"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPendingApproval
                ? `${clinic.name} is awaiting admin approval`
                : `${clinic.name}'s subscription has expired`}
            </p>
          </div>

          <div className="space-y-4 text-left bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg">Access Restrictions:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>All clinic dashboard features are locked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>All doctors managed by this clinic cannot access their dashboards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Patient data is preserved but inaccessible until {isPendingApproval ? 'approval' : 'renewal'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Appointments and prescriptions cannot be created or viewed</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {isPendingApproval
                ? "Your clinic registration is under review. An administrator will approve your clinic shortly."
                : "Please contact your administrator to renew the clinic subscription"}
            </p>
            <Button size="lg" variant="default" className="w-full">
              Contact Administrator
            </Button>
          </div>

          {!isPendingApproval && clinic.subscription_end_date && (
            <p className="text-xs text-muted-foreground">
              Subscription ended on: {new Date(clinic.subscription_end_date).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
