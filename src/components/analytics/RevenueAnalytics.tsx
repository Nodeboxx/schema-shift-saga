import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgPerAppointment: 0,
    projectedMonthly: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile consultation fee
      const { data: profile } = await supabase
        .from("profiles")
        .select("consultation_fee")
        .eq("id", user.id)
        .single();

      const consultationFee = profile?.consultation_fee || 0;

      const thirtyDaysAgo = subDays(new Date(), 30);

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("start_time, status")
        .eq("doctor_id", user.id)
        .eq("status", "completed")
        .gte("start_time", thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Group by date and calculate revenue
      const dailyRevenue: any = {};
      let totalRevenue = 0;

      appointments?.forEach((apt: any) => {
        const date = format(new Date(apt.start_time), "MMM dd");
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += consultationFee;
        totalRevenue += consultationFee;
      });

      const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue
      }));

      setRevenueData(chartData);

      const avgPerAppointment = appointments && appointments.length > 0 
        ? totalRevenue / appointments.length 
        : 0;

      // Project monthly revenue based on last 30 days
      const projectedMonthly = totalRevenue;

      setStats({
        totalRevenue,
        avgPerAppointment,
        projectedMonthly
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

  if (loading) {
    return <Card><CardContent className="p-6">Loading revenue data...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (30 days)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Per Appointment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgPerAppointment.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Projected Monthly
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.projectedMonthly.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No revenue data available. Set your consultation fee in settings.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueAnalytics;