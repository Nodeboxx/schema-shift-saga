import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrescriptionPage from "@/components/prescription/PrescriptionPage";
import PrescriptionControls from "@/components/prescription/PrescriptionControls";

const Prescription = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

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
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif", backgroundColor: "#e0e0e0", margin: 0, paddingTop: "100px" }}>
      <PrescriptionControls />
      <div id="page-wrapper" style={{ display: "block", paddingTop: "110px" }}>
        <PrescriptionPage />
      </div>
    </div>
  );
};

export default Prescription;
