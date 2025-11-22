import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, FileText, Activity } from 'lucide-react';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClinics: 0,
    totalPrescriptions: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, clinicsRes, prescriptionsRes, activeUsersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalClinics: clinicsRes.count || 0,
        totalPrescriptions: prescriptionsRes.count || 0,
        activeUsers: activeUsersRes.count || 0
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  const metrics = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Clinics',
      value: stats.totalClinics,
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      title: 'Prescriptions',
      value: stats.totalPrescriptions,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">System Analytics</h2>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{metric.title}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
