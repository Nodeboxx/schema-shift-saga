import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrescriptionPage from "@/components/prescription/PrescriptionPage";
import PrescriptionControls from "@/components/prescription/PrescriptionControls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const ClinicPrescription = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [onSave, setOnSave] = useState<(() => void) | undefined>();
  const [onAddPage, setOnAddPage] = useState<(() => void) | undefined>();
  const [zoom, setZoom] = useState(1);
  const [pageLayout, setPageLayout] = useState<'single' | 'double'>('single');
  const [clinicId, setClinicId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        let resolvedClinicId: string | null = null;

        // First, try to find a clinic owned by this user (clinic admin)
        const { data: ownedClinic, error: ownedClinicError } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", session.user.id)
          .maybeSingle();

        if (ownedClinicError && ownedClinicError.code !== "PGRST116") {
          console.error("Owned clinic fetch error:", ownedClinicError);
          throw ownedClinicError;
        }

        if (ownedClinic?.id) {
          resolvedClinicId = ownedClinic.id;
        } else {
          // Fallback: use clinic_id from profile for clinic doctors/staff
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("clinic_id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile fetch error:", profileError);
            throw profileError;
          }

          resolvedClinicId = profile?.clinic_id ?? null;
        }

        if (!resolvedClinicId) {
          toast({
            title: "Access Denied",
            description: "You must be part of a clinic to access this feature",
            variant: "destructive",
          });
          navigate("/clinic/dashboard");
          return;
        }

        setClinicId(resolvedClinicId);

        if (id) {
          await loadPrescription(id, resolvedClinicId);
        }
      } catch (error: any) {
        console.error("Init error:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        navigate("/clinic/dashboard");
      } finally {
        setLoading(false);
      }
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

  const loadPrescription = async (prescriptionId: string, userClinicId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        prescription_items (*),
        patients (phone, email)
      `)
      .eq("id", prescriptionId)
      .eq("clinic_id", userClinicId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load prescription or access denied",
        variant: "destructive",
      });
      navigate("/clinic/dashboard");
      return;
    }

    if (data.patients) {
      data.patient_phone = data.patients.phone || data.patient_phone;
      data.patient_email = data.patients.email || data.patient_email;
    }

    setPrescriptionData(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clinicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-lg">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Clinic Access Required</h3>
          <p className="text-muted-foreground mb-6">
            You must be part of a clinic to access prescription features.
          </p>
          <Button onClick={() => navigate("/clinic/dashboard")} size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-muted pt-40 md:pt-44 px-2 sm:px-4 lg:px-8 pb-8"
      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif" }}
    >
      <PrescriptionControls 
        prescriptionId={id} 
        userId={user?.id} 
        patientName={prescriptionData?.patient_name}
        patientPhone={prescriptionData?.patient?.phone}
        onSave={onSave}
        onAddPage={onAddPage}
        zoom={zoom}
        onZoomChange={setZoom}
        pageLayout={pageLayout}
        onPageLayoutChange={setPageLayout}
        clinicId={clinicId}
      />

      <div
        id="page-wrapper"
        className="prescription-page-wrapper mx-auto transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top center',
          maxWidth: pageLayout === 'double' ? '1700px' : '850px'
        }}
      >
        <PrescriptionPage 
          prescriptionData={prescriptionData} 
          userId={user?.id}
          clinicId={clinicId}
          onSaveReady={(handler) => setOnSave(() => handler)}
          onAddPageReady={(handler) => setOnAddPage(() => handler)}
          pageLayout={pageLayout}
        />
      </div>
    </div>
  );
};

export default ClinicPrescription;
