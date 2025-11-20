import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const PatientDemographics = () => {
  const [genderData, setGenderData] = useState<any[]>([]);
  const [ageData, setAgeData] = useState<any[]>([]);
  const [bloodGroupData, setBloodGroupData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDemographics();
  }, []);

  const loadDemographics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patients, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Gender distribution
      const genderCount: any = {};
      patients?.forEach((patient: any) => {
        const gender = patient.sex || "Not specified";
        genderCount[gender] = (genderCount[gender] || 0) + 1;
      });

      const genderChartData = Object.entries(genderCount).map(([gender, count]) => ({
        name: gender,
        value: count
      }));

      setGenderData(genderChartData);

      // Age distribution
      const ageRanges = {
        "0-10": 0,
        "11-20": 0,
        "21-30": 0,
        "31-40": 0,
        "41-50": 0,
        "51-60": 0,
        "60+": 0
      };

      patients?.forEach((patient: any) => {
        if (patient.age && /^\d+$/.test(patient.age)) {
          const age = parseInt(patient.age);
          if (age <= 10) ageRanges["0-10"]++;
          else if (age <= 20) ageRanges["11-20"]++;
          else if (age <= 30) ageRanges["21-30"]++;
          else if (age <= 40) ageRanges["31-40"]++;
          else if (age <= 50) ageRanges["41-50"]++;
          else if (age <= 60) ageRanges["51-60"]++;
          else ageRanges["60+"]++;
        }
      });

      const ageChartData = Object.entries(ageRanges).map(([range, count]) => ({
        range,
        patients: count
      }));

      setAgeData(ageChartData);

      // Blood group distribution
      const bloodCount: any = {};
      patients?.forEach((patient: any) => {
        if (patient.blood_group) {
          bloodCount[patient.blood_group] = (bloodCount[patient.blood_group] || 0) + 1;
        }
      });

      const bloodChartData = Object.entries(bloodCount).map(([group, count]) => ({
        name: group,
        value: count
      }));

      setBloodGroupData(bloodChartData);
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
    return <Card><CardContent className="p-6">Loading demographics...</CardContent></Card>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blood Group Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {bloodGroupData.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No blood group data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bloodGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {bloodGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patients" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDemographics;