import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { 
  TrendingUp, Users, FileText, Calendar, 
  Activity, DollarSign, Clock, Award, Database 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrescriptionAnalytics from "@/components/analytics/PrescriptionAnalytics";
import AppointmentAnalytics from "@/components/analytics/AppointmentAnalytics";
import PatientDemographics from "@/components/analytics/PatientDemographics";
import RevenueAnalytics from "@/components/analytics/RevenueAnalytics";
import { ResearchInsights } from "@/components/analytics/ResearchInsights";

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    totalAppointments: 0,
    totalPatients: 0,
    completionRate: 0
  });

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    loadStats(user.id);
  };

  const loadStats = async (userId: string) => {
    try {
      // Load prescriptions count
      const { count: prescriptionCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Load appointments count
      const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId);

      // Load patients count
      const { count: patientCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Calculate completion rate
      const { data: completedAppts } = await supabase
        .from("appointments")
        .select("id", { count: "exact" })
        .eq("doctor_id", userId)
        .eq("status", "completed");

      const completionRate = appointmentCount && appointmentCount > 0
        ? Math.round((completedAppts?.length || 0) / appointmentCount * 100)
        : 0;

      setStats({
        totalPrescriptions: prescriptionCount || 0,
        totalAppointments: appointmentCount || 0,
        totalPatients: patientCount || 0,
        completionRate
      });
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

  const statCards = [
    {
      title: "Total Prescriptions",
      value: stats.totalPrescriptions,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: Award,
      color: "text-orange-600"
    }
  ];

  return (
    <AppLayout>
      <SubscriptionGate feature="analytics">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Track your practice performance and clinical insights
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="prescriptions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="prescriptions">
                <FileText className="h-4 w-4 mr-2" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="patients">
                <Users className="h-4 w-4 mr-2" />
                Patient Demographics
              </TabsTrigger>
              <TabsTrigger value="revenue">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="research">
                <Database className="h-4 w-4 mr-2" />
                Clinical Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prescriptions" className="space-y-4">
              <PrescriptionAnalytics />
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <AppointmentAnalytics />
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <PatientDemographics />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <RevenueAnalytics />
            </TabsContent>

            <TabsContent value="research" className="space-y-4">
              <ResearchInsights />
            </TabsContent>
          </Tabs>
        </div>
      </SubscriptionGate>
    </AppLayout>
  );
};

export default Analytics;