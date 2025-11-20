import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Activity,
  Settings,
  Mail,
  Bell,
  BarChart3,
  UserCog,
  Shield,
  Calendar,
  Globe,
  Cpu,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminClinics from "@/components/admin/AdminClinics";
import AdminCMS from "@/components/admin/AdminCMS";
import { AdminSMTP } from "@/components/admin/AdminSMTP";
import { AdminEmailTemplates } from "@/components/admin/AdminEmailTemplates";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminImpersonate } from "@/components/admin/AdminImpersonate";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { AdminAppointments } from "@/components/admin/AdminAppointments";
import { AdminAPISettings } from "@/components/admin/AdminAPISettings";
import { AdminOrders } from "@/components/admin/AdminOrders";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClinics: 0,
    totalPrescriptions: 0,
    activeUsers: 0,
    totalAppointments: 0
  });

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "clinics", label: "Clinics", icon: Building2 },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "orders", label: "Orders & Billing", icon: ShoppingCart },
    { id: "api", label: "API Settings", icon: Cpu },
    { id: "cms", label: "CMS Editor", icon: Globe },
    { id: "smtp", label: "SMTP Settings", icon: Settings },
    { id: "templates", label: "Email Templates", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "impersonate", label: "Impersonate", icon: UserCog },
    { id: "audit", label: "Audit Logs", icon: Shield },
  ];

  useEffect(() => {
    if (isSuperAdmin) {
      loadStats();
    }
  }, [isSuperAdmin]);

  const loadStats = async () => {
    try {
      const [usersRes, clinicsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalClinics: clinicsRes.count || 0,
        totalPrescriptions: prescriptionsRes.count || 0,
        activeUsers: usersRes.count || 0,
        totalAppointments: appointmentsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <AdminGuard requireSuperAdmin={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <div className="flex h-16 items-center border-b border-border px-6">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enterprise system management
                </p>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          {activeTab === "overview" && (
            <div className="p-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
                {[
                  { title: "Total Users", value: stats.totalUsers, icon: Users, gradient: "from-blue-500 to-blue-600" },
                  { title: "Clinics", value: stats.totalClinics, icon: Building2, gradient: "from-purple-500 to-purple-600" },
                  { title: "Prescriptions", value: stats.totalPrescriptions, icon: FileText, gradient: "from-green-500 to-green-600" },
                  { title: "Appointments", value: stats.totalAppointments, icon: Calendar, gradient: "from-orange-500 to-orange-600" },
                  { title: "Active Users", value: stats.activeUsers, icon: Activity, gradient: "from-pink-500 to-pink-600" }
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title} className="overflow-hidden">
                      <div className={cn("h-2 bg-gradient-to-r", stat.gradient)} />
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <p className="text-3xl font-bold mt-2">{stat.value}</p>
                          </div>
                          <div className={cn("p-3 rounded-xl bg-gradient-to-br", stat.gradient)}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Total Users:</span>
                      <span className="font-semibold">{stats.totalUsers}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Active Clinics:</span>
                      <span className="font-semibold">{stats.totalClinics}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Prescriptions Issued:</span>
                      <span className="font-semibold">{stats.totalPrescriptions}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Total Appointments:</span>
                      <span className="font-semibold">{stats.totalAppointments}</span>
                    </li>
                  </ul>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Admin Capabilities</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Manage users and permissions
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Configure clinic settings
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Edit public website content
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Monitor system analytics
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "clinics" && <AdminClinics />}
            {activeTab === "appointments" && <AdminAppointments />}
            {activeTab === "orders" && <AdminOrders />}
            {activeTab === "api" && <AdminAPISettings />}
            {activeTab === "cms" && <AdminCMS />}
            {activeTab === "smtp" && <AdminSMTP />}
            {activeTab === "templates" && <AdminEmailTemplates />}
            {activeTab === "notifications" && <AdminNotifications />}
            {activeTab === "analytics" && <AdminAnalytics />}
            {activeTab === "impersonate" && <AdminImpersonate />}
            {activeTab === "audit" && <AdminAuditLogs />}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
