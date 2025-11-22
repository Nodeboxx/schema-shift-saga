import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ClinicMembers from "@/components/clinic/ClinicMembers";
import ClinicBranding from "@/components/clinic/ClinicBranding";
import ClinicSubscription from "@/components/clinic/ClinicSubscription";
import ClinicDoctors from "@/components/clinic/ClinicDoctors";
import ClinicRevenue from "@/components/clinic/ClinicRevenue";
import ClinicPayroll from "@/components/clinic/ClinicPayroll";
import ClinicAppointments from "@/components/clinic/ClinicAppointments";
import ClinicPatients from "@/components/clinic/ClinicPatients";
import { ClinicSubscriptionExpiryBanner } from "@/components/clinic/ClinicSubscriptionExpiryBanner";
import { ClinicSubscriptionLock } from "@/components/clinic/ClinicSubscriptionLock";
import { ArrowLeft } from "lucide-react";

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);

  useEffect(() => {
    loadClinic();
  }, []);

  const loadClinic = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Get clinic owned by user
      const { data: clinicData, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setClinic(clinicData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">No Clinic Found</h2>
        <p className="text-muted-foreground mb-6">You need to create a clinic first</p>
        <Button onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Check if subscription is expired
  const isSubscriptionExpired = clinic.subscription_end_date && 
    new Date(clinic.subscription_end_date) < new Date();

  if (isSubscriptionExpired) {
    return <ClinicSubscriptionLock clinic={clinic} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl py-4 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{clinic.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">Clinic Management</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </div>

        <ClinicSubscriptionExpiryBanner clinic={clinic} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full overflow-x-auto flex sm:inline-flex">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="patients" className="text-xs sm:text-sm whitespace-nowrap">Patients</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm whitespace-nowrap">Appointments</TabsTrigger>
            <TabsTrigger value="doctors" className="text-xs sm:text-sm whitespace-nowrap">Doctors</TabsTrigger>
            <TabsTrigger value="payroll" className="text-xs sm:text-sm whitespace-nowrap">Payroll</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm whitespace-nowrap">Revenue</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm whitespace-nowrap">Team</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs sm:text-sm whitespace-nowrap">Branding</TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs sm:text-sm whitespace-nowrap">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <ClinicRevenue clinicId={clinic.id} />
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <ClinicPatients clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="appointments">
            <ClinicAppointments clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="doctors">
            <ClinicDoctors clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="payroll">
            <ClinicPayroll clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="revenue">
            <ClinicRevenue clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="team">
            <ClinicMembers clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="branding">
            <ClinicBranding clinic={clinic} onUpdate={loadClinic} />
          </TabsContent>

          <TabsContent value="subscription">
            <ClinicSubscription clinic={clinic} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicDashboard;