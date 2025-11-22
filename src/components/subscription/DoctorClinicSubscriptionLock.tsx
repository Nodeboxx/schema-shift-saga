import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DoctorClinicSubscriptionLockProps {
  clinicName: string;
  subscriptionEndDate?: string;
}

export const DoctorClinicSubscriptionLock = ({ 
  clinicName, 
  subscriptionEndDate 
}: DoctorClinicSubscriptionLockProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive">
        <CardContent className="p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Building2 className="h-20 w-20 text-destructive" />
              <Lock className="h-8 w-8 text-destructive absolute -bottom-2 -right-2" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Clinic Subscription Expired
            </h2>
            <p className="text-lg text-muted-foreground">
              Your clinic's ({clinicName}) subscription has expired
            </p>
          </div>

          <div className="space-y-4 text-left bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Dashboard Access Suspended
            </h3>
            <p className="text-muted-foreground">
              Your access has been temporarily suspended because the clinic's subscription has expired. 
              All doctors and staff under this clinic cannot access their dashboards until the subscription is renewed.
            </p>
            <ul className="space-y-2 text-muted-foreground mt-4">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Cannot create new prescriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Cannot access patient records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Cannot manage appointments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>All data is preserved and will be restored upon renewal</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              What can you do?
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your clinic administrator to renew the subscription. 
              All features will be restored immediately after renewal.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Go to Home
            </Button>
          </div>

          {subscriptionEndDate && (
            <p className="text-xs text-muted-foreground">
              Subscription ended on: {new Date(subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
