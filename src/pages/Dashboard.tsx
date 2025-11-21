import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Calendar, Sparkles, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MyPatientsTab } from "@/components/dashboard/MyPatientsTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { QRScanner } from "@/components/scanner/QRScanner";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { SubscriptionExpiryBanner } from "@/components/subscription/SubscriptionExpiryBanner";
import { SubscriptionHistory } from "@/components/subscription/SubscriptionHistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPrescriptions: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    checkSubscription();
    loadStats();
    
    // Check URL params for tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_tier, subscription_end_date, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (data) {
        const now = new Date();

        // Check if paid subscription period (active or cancelled) is still valid
        const hasPaidPeriod =
          data.subscription_end_date && new Date(data.subscription_end_date) > now;
        const hasActiveOrCancelledSubscription =
          (data.subscription_status === "active" || data.subscription_status === "cancelled") &&
          hasPaidPeriod;

        // Check if trial is still valid
        const hasValidTrial = data.subscription_status === "trial" && 
          data.trial_ends_at && 
          new Date(data.trial_ends_at) > now;

        const hasActive = hasActiveOrCancelledSubscription || hasValidTrial;
        setHasActiveSubscription(hasActive);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [patientsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }).eq("doctor_id", user.id),
      supabase.from("prescriptions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("doctor_id", user.id),
    ]);

    setStats({
      totalPatients: patientsRes.count || 0,
      totalPrescriptions: prescriptionsRes.count || 0,
      totalAppointments: appointmentsRes.count || 0,
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <SubscriptionExpiryBanner />
        <SubscriptionManager />

        {hasActiveSubscription === false ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center space-y-6">
              <Sparkles className="h-16 w-16 mx-auto text-primary" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to MedDexPro!</h2>
                <p className="text-muted-foreground">
                  Subscribe to a plan or start your free trial to unlock all features and create prescriptions.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate("/demo")} variant="outline" size="lg">
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="verify">Verify Patient</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => navigate('/prescription')}>
                <FileText className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <SubscriptionGate feature="patient_management">
              <MyPatientsTab />
            </SubscriptionGate>
          </TabsContent>

          <TabsContent value="verify">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ScanLine className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Verify Prescription</h2>
                  <p className="text-sm text-muted-foreground">
                    Scan QR codes from prescriptions to verify authenticity and view patient details
                  </p>
                </div>
              </div>
              <QRScanner />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <SubscriptionGate feature="analytics" customFeatureName="Reports and Analytics">
              <ReportsTab />
            </SubscriptionGate>
          </TabsContent>
        </Tabs>

        <SubscriptionHistory />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
