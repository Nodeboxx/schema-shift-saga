import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle, Building2, LogOut, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorClinicSubscriptionLockProps {
  clinicName: string;
  subscriptionEndDate?: string;
  subscriptionStatus?: string;
}

export const DoctorClinicSubscriptionLock = ({ 
  clinicName, 
  subscriptionEndDate,
  subscriptionStatus
}: DoctorClinicSubscriptionLockProps) => {
  const navigate = useNavigate();
  const isPendingApproval = subscriptionStatus === 'pending_approval';
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "whatsapp_contact")
        .single();
      
      if (data?.value && typeof data.value === 'object' && 'value' in data.value) {
        setWhatsappNumber((data.value as any).value);
      }
    };
    fetchWhatsappNumber();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

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
              {isPendingApproval 
                ? "Clinic Pending Approval" 
                : "Clinic Subscription Expired"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isPendingApproval
                ? `Your clinic (${clinicName}) is awaiting admin approval`
                : `Your clinic's (${clinicName}) subscription has expired`}
            </p>
          </div>

          <div className="space-y-4 text-left bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Dashboard Access Suspended
            </h3>
            <p className="text-muted-foreground">
              {isPendingApproval
                ? "Your access is temporarily suspended while the clinic registration is under review. All doctors and staff under this clinic cannot access their dashboards until the clinic is approved."
                : "Your access has been temporarily suspended because the clinic's subscription has expired. All doctors and staff under this clinic cannot access their dashboards until the subscription is renewed."}
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
              {isPendingApproval
                ? "Your clinic registration is under review. An administrator will approve the clinic shortly, after which all features will be available."
                : "Contact your clinic administrator to renew the subscription. All features will be restored immediately after renewal."}
            </p>
            <Button size="lg" variant="default" className="w-full" onClick={handleWhatsApp}>
              Contact Administrator
            </Button>
            <div className="flex gap-2">
              <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
              <Button size="lg" variant="ghost" className="flex-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {!isPendingApproval && subscriptionEndDate && (
            <p className="text-xs text-muted-foreground">
              Subscription ended on: {new Date(subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
