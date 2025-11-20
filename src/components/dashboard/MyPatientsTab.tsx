import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export const MyPatientsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentWeek: 0,
    previousWeek: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadPatientStats();
  }, []);

  const loadPatientStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const currentWeekStart = startOfWeek(now);
      const currentWeekEnd = endOfWeek(now);
      const previousWeekStart = startOfWeek(subDays(now, 7));
      const previousWeekEnd = endOfWeek(subDays(now, 7));

      // Current week patients
      const { count: currentWeekCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", user.id)
        .gte("created_at", currentWeekStart.toISOString())
        .lte("created_at", currentWeekEnd.toISOString());

      // Previous week patients
      const { count: previousWeekCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", user.id)
        .gte("created_at", previousWeekStart.toISOString())
        .lte("created_at", previousWeekEnd.toISOString());

      // Total patients
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", user.id);

      // Total appointments
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", user.id);

      setStats({
        currentWeek: currentWeekCount || 0,
        previousWeek: previousWeekCount || 0,
        totalPatients: totalPatients || 0,
        totalAppointments: totalAppointments || 0,
      });

      // Load last 7 days data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        return {
          date: format(date, "MMM dd"),
          fullDate: format(date, "yyyy-MM-dd"),
        };
      });

      const chartDataPromises = last7Days.map(async ({ date, fullDate }) => {
        const { count } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .gte("created_at", `${fullDate}T00:00:00`)
          .lte("created_at", `${fullDate}T23:59:59`);

        return { date, patients: count || 0 };
      });

      const data = await Promise.all(chartDataPromises);
      setChartData(data);
    } catch (error: any) {
      toast({ title: "Error loading stats", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading patient statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.currentWeek}</div>
            <p className="text-xs text-muted-foreground">New patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previous Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.previousWeek}</div>
            <p className="text-xs text-muted-foreground">New patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Statistics</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm">Current Week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm">Previous Week</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="patients"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", r: 4 }}
                name="Patients"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
