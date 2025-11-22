import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";

interface ClinicSubscriptionProps {
  clinic: any;
}

const ClinicSubscription = ({ clinic }: ClinicSubscriptionProps) => {
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
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan:</span>
            <Badge className="text-sm px-3 py-1 capitalize">
              {clinic.subscription_tier || 'Enterprise'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={clinic.subscription_status === "active" ? "default" : "secondary"}>
              {clinic.subscription_status || 'pending'}
            </Badge>
          </div>

          {clinic.subscription_start_date && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Activated:</span>
              <span className="font-medium">
                {new Date(clinic.subscription_start_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {clinic.subscription_end_date && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next Billing:</span>
              <span className="font-medium">
                {new Date(clinic.subscription_end_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
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
              {usage.doctors} / {clinic.max_doctors || '∞'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Patients</span>
            </div>
            <span className="font-semibold">
              {usage.patients} / {clinic.max_patients || '∞'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Total Prescriptions</span>
            </div>
            <span className="font-semibold">{usage.prescriptions}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClinicSubscription;