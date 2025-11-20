import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

const PrescriptionAnalytics = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get prescriptions for last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data: prescriptions, error } = await supabase
        .from("prescriptions")
        .select("created_at, prescription_items(name)")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Group by date
      const groupedByDate = prescriptions?.reduce((acc: any, prescription: any) => {
        const date = format(new Date(prescription.created_at), "MMM dd");
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});

      const chartData = Object.entries(groupedByDate || {}).map(([date, count]) => ({
        date,
        prescriptions: count
      }));

      setData(chartData);

      // Calculate top medicines
      const medicineCount: any = {};
      prescriptions?.forEach((prescription: any) => {
        prescription.prescription_items?.forEach((item: any) => {
          if (item.name) {
            medicineCount[item.name] = (medicineCount[item.name] || 0) + 1;
          }
        });
      });

      const topMeds = Object.entries(medicineCount)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopMedicines(topMeds);
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
    return <Card><CardContent className="p-6">Loading analytics...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Prescription Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="prescriptions" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Prescribed Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topMedicines} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionAnalytics;