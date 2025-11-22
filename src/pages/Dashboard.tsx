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
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { DoctorClinicSubscriptionLock } from "@/components/subscription/DoctorClinicSubscriptionLock";
import { ClinicManagedBanner } from "@/components/subscription/ClinicManagedBanner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clinicSubscriptionExpired, setClinicSubscriptionExpired] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [isClinicManaged, setIsClinicManaged] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPrescriptions: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    checkSubscription();
    checkClinicSubscription();
    checkOnboarding();
    loadStats();
    
    // Check URL params for tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const checkOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (data && !data.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    }
  };

  const checkClinicSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a doctor in a clinic
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (profile?.clinic_id) {
        setClinicId(profile.clinic_id);
        setIsClinicManaged(true);
        
        // Check clinic subscription status
        const { data: clinic } = await supabase
          .from("clinics")
          .select("subscription_end_date, subscription_status, name")
          .eq("id", profile.clinic_id)
          .single();

        if (clinic) {
          // Check if pending approval or expired
          const isPendingApproval = clinic.subscription_status === 'pending_approval';
          const isExpired = clinic.subscription_end_date && new Date(clinic.subscription_end_date) < new Date();
          
          setClinicSubscriptionExpired(isPendingApproval || isExpired);
          setClinicInfo(clinic);
        }
      }
    } catch (error) {
      console.error("Error checking clinic subscription:", error);
    }
  };

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

  // If doctor's clinic subscription is expired or pending approval, show lock screen
  if (clinicSubscriptionExpired && clinicInfo) {
    return (
      <DoctorClinicSubscriptionLock 
        clinicName={clinicInfo.name}
        subscriptionEndDate={clinicInfo.subscription_end_date}
        subscriptionStatus={clinicInfo.subscription_status}
      />
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        </div>

        {isClinicManaged && clinicInfo ? (
          <ClinicManagedBanner clinicName={clinicInfo.name} />
        ) : (
          <>
            <SubscriptionExpiryBanner />
            <SubscriptionManager />
          </>
        )}

        {hasActiveSubscription === false ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 md:p-12 text-center space-y-4 md:space-y-6">
              <Sparkles className="h-12 w-12 md:h-16 md:w-16 mx-auto text-primary" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome to MedRxPro!</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Subscribe to a plan or start your free trial to unlock all features and create prescriptions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => navigate("/demo")} variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 bg-blue-50 p-1 gap-1 mb-4">
            <TabsTrigger 
              value="overview" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              My Patients
            </TabsTrigger>
            <TabsTrigger 
              value="verify" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              Verify Patient
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 md:space-y-8">
            <div className="flex justify-end mt-20 mb-6">
              <Button onClick={() => navigate(clinicId ? '/clinic/doctor/prescription' : '/prescription')} className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <TabsContent value="patients" className="mt-20 pt-6">
            {isClinicManaged ? (
              <MyPatientsTab />
            ) : (
              <SubscriptionGate feature="patient_management">
                <MyPatientsTab />
              </SubscriptionGate>
            )}
          </TabsContent>

          <TabsContent value="verify" className="mt-20 pt-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6 bg-muted/30 rounded-lg">
                <ScanLine className="h-6 w-6 md:h-7 md:w-7 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">Verify Prescription</h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Scan QR codes from prescriptions to verify authenticity and view patient details
                  </p>
                </div>
              </div>
              <QRScanner />
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-20 pt-6">
            {isClinicManaged ? (
              <ReportsTab />
            ) : (
              <SubscriptionGate feature="analytics" customFeatureName="Reports and Analytics">
                <ReportsTab />
              </SubscriptionGate>
            )}
          </TabsContent>
        </Tabs>

        {!isClinicManaged && <SubscriptionHistory />}
          </>
        )}

        <OnboardingWizard 
          open={showOnboarding} 
          onComplete={() => {
            setShowOnboarding(false);
            loadStats();
          }} 
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
