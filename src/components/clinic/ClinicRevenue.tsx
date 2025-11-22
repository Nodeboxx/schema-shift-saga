import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

interface ClinicRevenueProps {
  clinicId: string;
}

const ClinicRevenue = ({ clinicId }: ClinicRevenueProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, [clinicId]);

  const loadRevenueData = async () => {
    try {
      // Get all doctors in this clinic
      const { data: doctors, error: doctorsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clinic_id", clinicId);

      if (doctorsError) throw doctorsError;

      const doctorIds = doctors?.map((d) => d.id) || [];

      // Get appointments count
      const { data: appointments, error: apptError } = await supabase
        .from("appointments")
        .select("id, status")
        .in("doctor_id", doctorIds);

      if (apptError) throw apptError;

      // Get patients count
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("id")
        .in("user_id", doctorIds);

      if (patientsError) throw patientsError;

      // Calculate revenue (this is simplified - you'd want actual payment data)
      const completedAppointments = appointments?.filter((a) => a.status === "completed") || [];
      const avgConsultationFee = 500; // This should come from actual consultation fees
      const totalRevenue = completedAppointments.length * avgConsultationFee;

      // Get current month appointments
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: monthlyAppts, error: monthlyError } = await supabase
        .from("appointments")
        .select("id, status")
        .in("doctor_id", doctorIds)
        .gte("start_time", firstDayOfMonth.toISOString())
        .eq("status", "completed");

      if (monthlyError) throw monthlyError;

      const monthlyRevenue = (monthlyAppts?.length || 0) * avgConsultationFee;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalPatients: patients?.length || 0,
        totalAppointments: appointments?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-6"><div>Loading revenue data...</div></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">৳{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Appointments</p>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            • Average consultation fee: ৳500 (configurable per doctor)
          </p>
          <p className="mb-2">
            • Revenue calculation based on completed appointments
          </p>
          <p>
            • Detailed revenue reports and analytics coming soon
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ClinicRevenue;
