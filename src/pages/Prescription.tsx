import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import PrescriptionPage from "@/components/prescription/PrescriptionPage";
import PrescriptionControls from "@/components/prescription/PrescriptionControls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ZoomIn, ZoomOut } from "lucide-react";

const Prescription = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [onSave, setOnSave] = useState<(() => void) | undefined>();
  const [onAddPage, setOnAddPage] = useState<(() => void) | undefined>();
  const [zoom, setZoom] = useState(1);
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
        prescription_items (*),
        patients (phone, email)
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

    // Merge patient data from patients table if available
    if (data.patients) {
      data.patient_phone = data.patients.phone || data.patient_phone;
      data.patient_email = data.patients.email || data.patient_email;
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-lg">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Subscription Required
          </h3>
          <p className="text-muted-foreground mb-2">
            You need an active subscription to create prescriptions.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Start your free trial or choose a plan to unlock this powerful feature.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/?scroll=pricing")} size="lg" className="w-full">
              View Plans & Pricing
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-muted pt-24 md:pt-32 px-2 sm:px-4 lg:px-8"
      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif" }}
    >
      <PrescriptionControls 
        prescriptionId={id} 
        userId={user?.id} 
        patientName={prescriptionData?.patient_name}
        patientPhone={prescriptionData?.patient?.phone}
        onSave={onSave}
        onAddPage={onAddPage}
      />
      
      {/* Zoom controls */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50 print:hidden">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="bg-secondary px-3 py-2 rounded-md shadow-lg font-semibold">
          {Math.round(zoom * 100)}%
        </div>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <div
        id="page-wrapper"
        className="prescription-page-wrapper mx-auto max-w-5xl md:max-w-6xl transition-transform duration-200"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        <PrescriptionPage 
          prescriptionData={prescriptionData} 
          userId={user?.id}
          onSaveReady={(handler) => setOnSave(() => handler)}
          onAddPageReady={(handler) => setOnAddPage(() => handler)}
        />
      </div>
    </div>
  );
};

export default Prescription;
