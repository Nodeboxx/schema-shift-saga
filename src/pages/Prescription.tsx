import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrescriptionPage from "@/components/prescription/PrescriptionPage";
import PrescriptionControls from "@/components/prescription/PrescriptionControls";

const Prescription = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif", backgroundColor: "#e0e0e0", margin: 0, paddingTop: "100px" }}>
      <PrescriptionControls prescriptionId={id} userId={user?.id} />
      <div id="page-wrapper" style={{ display: "block", paddingTop: "110px" }}>
        <PrescriptionPage prescriptionData={prescriptionData} userId={user?.id} />
      </div>
    </div>
  );
};

export default Prescription;
