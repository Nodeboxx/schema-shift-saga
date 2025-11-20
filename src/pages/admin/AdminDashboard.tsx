import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { ArrowLeft, Users, Building2, FileText, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminClinics from "@/components/admin/AdminClinics";
import AdminCMS from "@/components/admin/AdminCMS";
import { AdminSMTP } from "@/components/admin/AdminSMTP";
import { AdminEmailTemplates } from "@/components/admin/AdminEmailTemplates";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminImpersonate } from "@/components/admin/AdminImpersonate";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin, loading: roleLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClinics: 0,
    totalPrescriptions: 0,
    activeUsers: 0
  });

  useEffect(() => {
    if (isSuperAdmin) {
      loadStats();
    }
  }, [isSuperAdmin]);

  const loadStats = async () => {
    try {
      const [usersRes, clinicsRes, prescriptionsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalClinics: clinicsRes.count || 0,
        totalPrescriptions: prescriptionsRes.count || 0,
        activeUsers: usersRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <AdminGuard requireSuperAdmin={true}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Enterprise Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">Complete system management</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
              { title: "Clinics", value: stats.totalClinics, icon: Building2, color: "bg-gradient-to-br from-purple-500 to-purple-600" },
              { title: "Prescriptions", value: stats.totalPrescriptions, icon: FileText, color: "bg-gradient-to-br from-green-500 to-green-600" },
              { title: "Active Users", value: stats.activeUsers, icon: Activity, color: "bg-gradient-to-br from-orange-500 to-orange-600" }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
              <TabsTrigger value="cms">CMS</TabsTrigger>
              <TabsTrigger value="smtp">SMTP</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="impersonate">Impersonate</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminAnalytics /></TabsContent>
            <TabsContent value="users"><AdminUsers /></TabsContent>
            <TabsContent value="clinics"><AdminClinics /></TabsContent>
            <TabsContent value="cms"><AdminCMS /></TabsContent>
            <TabsContent value="smtp"><AdminSMTP /></TabsContent>
            <TabsContent value="templates"><AdminEmailTemplates /></TabsContent>
            <TabsContent value="notifications"><AdminNotifications /></TabsContent>
            <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
            <TabsContent value="impersonate"><AdminImpersonate /></TabsContent>
            <TabsContent value="audit"><AdminAuditLogs /></TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
