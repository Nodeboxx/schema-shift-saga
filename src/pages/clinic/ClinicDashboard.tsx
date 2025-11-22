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

        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
            <TabsTrigger value="doctors" className="text-xs sm:text-sm">Doctors</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm">Team</TabsTrigger>
            <TabsTrigger value="branding" className="text-xs sm:text-sm">Branding</TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs sm:text-sm">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            <ClinicDoctors clinicId={clinic.id} />
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