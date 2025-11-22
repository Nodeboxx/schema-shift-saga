import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  CreditCard, 
  UsersRound, 
  Palette, 
  Crown,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Overview", path: "/clinic/dashboard", icon: LayoutDashboard },
  { title: "Patients", path: "/clinic/dashboard/patients", icon: Users },
  { title: "Appointments", path: "/clinic/dashboard/appointments", icon: Calendar },
  { title: "Doctors", path: "/clinic/dashboard/doctors", icon: UserCheck },
  { title: "Payroll", path: "/clinic/dashboard/payroll", icon: DollarSign },
  { title: "Revenue", path: "/clinic/dashboard/revenue", icon: CreditCard },
  { title: "Team", path: "/clinic/dashboard/team", icon: UsersRound },
  { title: "Branding", path: "/clinic/dashboard/branding", icon: Palette },
  { title: "Subscription", path: "/clinic/dashboard/subscription", icon: Crown },
];

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);

  const currentPath = location.pathname;
  // Extract the tab from the path: /clinic/dashboard/patients -> patients
  const pathParts = currentPath.split('/').filter(Boolean);
  const currentTab = pathParts.length > 2 ? pathParts[2] : 'dashboard';

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

  const renderContent = () => {
    switch (currentTab) {
      case 'patients':
        return <ClinicPatients clinicId={clinic.id} />;
      case 'appointments':
        return <ClinicAppointments clinicId={clinic.id} />;
      case 'doctors':
        return <ClinicDoctors clinicId={clinic.id} />;
      case 'payroll':
        return <ClinicPayroll clinicId={clinic.id} />;
      case 'revenue':
        return <ClinicRevenue clinicId={clinic.id} />;
      case 'team':
        return <ClinicMembers clinicId={clinic.id} />;
      case 'branding':
        return <ClinicBranding clinic={clinic} onUpdate={loadClinic} />;
      case 'subscription':
        return <ClinicSubscription clinic={clinic} />;
      default:
        return <ClinicRevenue clinicId={clinic.id} />;
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

  // Check if subscription is pending approval or expired
  const isPendingApproval = clinic.subscription_status === 'pending_approval';
  const isSubscriptionExpired = clinic.subscription_end_date && 
    new Date(clinic.subscription_end_date) < new Date();

  if (isPendingApproval || isSubscriptionExpired) {
    return <ClinicSubscriptionLock clinic={clinic} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold truncate">{clinic.name}</h2>
            <p className="text-xs text-muted-foreground">Clinic Management</p>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end={item.path === '/clinic/dashboard'}
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 border-t mt-auto space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">
                  {menuItems.find(item => {
                    const itemTab = item.path.split('/').pop() || 'dashboard';
                    return itemTab === currentTab;
                  })?.title || 'Overview'}
                </h1>
              </div>
            </div>
          </header>

          <div className="p-6">
            <ClinicSubscriptionExpiryBanner clinic={clinic} />
            <div className="mt-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClinicDashboard;
