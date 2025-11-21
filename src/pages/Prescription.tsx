import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import PrescriptionPage from "@/components/prescription/PrescriptionPage";
import PrescriptionControls from "@/components/prescription/PrescriptionControls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const Prescription = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { hasAccess, loading: subLoading, requireSubscription } = useSubscriptionCheck();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        if (id) {
          await loadPrescription(id);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, id]);

  // Check subscription on mount for new prescriptions
  useEffect(() => {
    if (!id && !subLoading && !hasAccess) {
      requireSubscription("prescription creation");
    }
  }, [id, subLoading, hasAccess]);

  const loadPrescription = async (prescriptionId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        prescription_items (*)
      `)
      .eq("id", prescriptionId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load prescription",
        variant: "destructive",
      });
      return;
    }

    setPrescriptionData(data);
  };

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show subscription gate for new prescriptions
  if (!id && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Subscription Required</h3>
          <p className="text-muted-foreground mb-6">
            You need an active subscription to create prescriptions. Start your free trial or choose a plan to continue.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/dashboard?tab=overview")}>
              View Plans
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="prescription-root"
      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif", backgroundColor: "#e0e0e0", margin: 0, paddingTop: "100px" }}
    >
      <PrescriptionControls 
        prescriptionId={id} 
        userId={user?.id} 
        patientName={prescriptionData?.patient_name}
        patientPhone={prescriptionData?.patient?.phone}
      />
      <div id="page-wrapper" className="prescription-page-wrapper" style={{ display: "block", paddingTop: "160px" }}>
        <PrescriptionPage prescriptionData={prescriptionData} userId={user?.id} />
      </div>
    </div>
  );
};

export default Prescription;
