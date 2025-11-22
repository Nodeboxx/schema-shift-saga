import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Phone, CheckCircle2 } from "lucide-react";
import logo from "@/assets/meddexpro-logo.png";

const ClinicPendingApproval = () => {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkClinicStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkClinicStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkClinicStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (clinicData) {
        setClinic(clinicData);
        
        // If approved, redirect to clinic dashboard
        if (clinicData.subscription_status === 'active') {
          navigate("/clinic");
        }
      }
    } catch (error) {
      console.error("Error checking clinic status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="MedDexPro" className="h-12" />
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Registration Under Review</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for registering <strong>{clinic?.name}</strong> with MedDexPro!
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Application Received</h3>
              <p className="text-sm text-muted-foreground">
                Your clinic registration has been successfully submitted.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Pending Approval</h3>
              <p className="text-sm text-muted-foreground">
                Our team is reviewing your application. This typically takes 24-48 hours.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">We'll Contact You</h3>
              <p className="text-sm text-muted-foreground">
                Once approved, you'll receive an email at <strong>{clinic?.email}</strong> with your login credentials and custom pricing details.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-3">
          <h3 className="font-semibold text-lg mb-3">What Happens Next?</h3>
          <div className="text-sm text-muted-foreground space-y-2 text-left">
            <p>✓ Our team will verify your clinic information</p>
            <p>✓ We'll prepare a custom enterprise pricing plan for your needs</p>
            <p>✓ You'll receive login credentials and onboarding instructions</p>
            <p>✓ Our support team will guide you through the setup process</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Need immediate assistance? Contact us at{" "}
            <a href="mailto:support@meddexpro.com" className="text-primary hover:underline">
              support@meddexpro.com
            </a>
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClinicPendingApproval;
