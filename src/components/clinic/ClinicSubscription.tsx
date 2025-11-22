import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { CreditCard, Users, FileText } from "lucide-react";

interface ClinicSubscriptionProps {
  clinic: any;
}

const ClinicSubscription = ({ clinic }: ClinicSubscriptionProps) => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState({
    doctors: 0,
    patients: 0,
    prescriptions: 0
  });

  useEffect(() => {
    loadUsage();
  }, [clinic.id]);

  const loadUsage = async () => {
    try {
      // Count clinic members (doctors)
      const { count: doctorCount } = await supabase
        .from("clinic_members")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinic.id);

      // Count patients
      const { count: patientCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinic.id);

      // Count prescriptions
      const { count: prescriptionCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinic.id);

      setUsage({
        doctors: doctorCount || 0,
        patients: patientCount || 0,
        prescriptions: prescriptionCount || 0
      });
    } catch (error) {
      console.error("Error loading usage:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Current Plan</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">Plan:</span>
            <Badge className="text-lg px-3 py-1 capitalize">
              {clinic.subscription_tier}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg">Status:</span>
            <Badge variant={clinic.subscription_status === "active" ? "default" : "secondary"}>
              {clinic.subscription_status}
            </Badge>
          </div>
        </div>

        {clinic.subscription_end_date && (
          <p className="text-sm text-muted-foreground mb-6">
            Renews on: {new Date(clinic.subscription_end_date).toLocaleDateString()}
          </p>
        )}

        <Button onClick={() => navigate("/checkout/clinic")}>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Usage Overview</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Doctors</span>
            </div>
            <span className="font-semibold">
              {usage.doctors} / {clinic.max_doctors}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Patients</span>
            </div>
            <span className="font-semibold">
              {usage.patients} / {clinic.max_patients}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Prescriptions This Month</span>
            </div>
            <span className="font-semibold">{usage.prescriptions}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClinicSubscription;