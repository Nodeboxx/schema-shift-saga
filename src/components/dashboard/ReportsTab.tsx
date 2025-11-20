import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Calendar } from "lucide-react";
import { format, subDays, differenceInBusinessDays } from "date-fns";
import * as XLSX from "xlsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export const ReportsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });
  const [stats, setStats] = useState({
    totalPatients: 0,
    under5: 0,
    over5: 0,
    avgPerDay: 0,
    workingDays: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const setDaysRange = (days: number) => {
    setDateRange({ from: subDays(new Date(), days), to: new Date() });
  };

  const loadReportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");

      // Get prescriptions in date range
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("user_id", user.id)
        .gte("prescription_date", fromDate)
        .lte("prescription_date", toDate);

      setReportData(prescriptions || []);

      // Get patients
      const { data: patients } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user.id);

      const totalPatients = prescriptions?.length || 0;
      const under5 = prescriptions?.filter((p) => {
        const age = parseInt(p.patient_age || "0");
        return age < 5;
      }).length || 0;
      const over5 = totalPatients - under5;
      const workingDays = differenceInBusinessDays(dateRange.to, dateRange.from);
      const avgPerDay = workingDays > 0 ? (totalPatients / workingDays).toFixed(2) : 0;

      setStats({
        totalPatients,
        under5,
        over5,
        avgPerDay: parseFloat(avgPerDay as string),
        workingDays,
      });

      // Chart data
      const genderData = {
        male: prescriptions?.filter((p) => p.patient_sex?.toLowerCase() === "male").length || 0,
        female: prescriptions?.filter((p) => p.patient_sex?.toLowerCase() === "female").length || 0,
      };

      const patientIds = new Set(prescriptions?.map((p) => p.patient_id));
      const uniquePatientIds = Array.from(patientIds);
      
      const oldPatientIds = patients?.filter(p => 
        new Date(p.created_at) < dateRange.from
      ).map(p => p.id) || [];
      
      const newPatients = uniquePatientIds.filter(id => !oldPatientIds.includes(id)).length;
      const oldPatients = uniquePatientIds.filter(id => oldPatientIds.includes(id)).length;

      setChartData([
        { category: "Male", count: genderData.male },
        { category: "Female", count: genderData.female },
        { category: "New Patients", count: newPatients },
        { category: "Old Patients", count: oldPatients },
      ]);
    } catch (error: any) {
      toast({ title: "Error loading report", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const exportData = reportData.map((row) => ({
      Date: row.prescription_date,
      "Patient Name": row.patient_name,
      Age: row.patient_age,
      Sex: row.patient_sex,
      Weight: row.patient_weight,
      "Blood Pressure": `${row.oe_bp_s || ""}/${row.oe_bp_d || ""}`,
      Pulse: row.oe_pulse,
      Temperature: row.oe_temp,
      "Chief Complaint": row.cc_text,
      Diagnosis: row.dx_text,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prescription Report");
    
    const fileName = `prescription_report_${format(dateRange.from, "yyyy-MM-dd")}_to_${format(
      dateRange.to,
      "yyyy-MM-dd"
    )}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
    toast({ title: "Report downloaded successfully" });
  };

  if (loading) {
    return <div className="text-center py-8">Loading report data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prescription Report</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={dateRange.from === subDays(new Date(), 30) ? "default" : "outline"}
                size="sm"
                onClick={() => setDaysRange(30)}
              >
                30 DAYS
              </Button>
              <Button
                variant={dateRange.from === subDays(new Date(), 60) ? "default" : "outline"}
                size="sm"
                onClick={() => setDaysRange(60)}
              >
                60 DAYS
              </Button>
              <Button
                variant={dateRange.from === subDays(new Date(), 90) ? "default" : "outline"}
                size="sm"
                onClick={() => setDaysRange(90)}
              >
                90 DAYS
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Custom
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={downloadExcel} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under 5 Years</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{stats.under5}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPatients > 0 ? ((stats.under5 / stats.totalPatients) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Over 5 Years</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{stats.over5}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPatients > 0 ? ((stats.over5 / stats.totalPatients) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{stats.avgPerDay}</div>
              </CardContent>
            </Card>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <Label className="text-sm font-medium">Date Range</Label>
                <p className="text-lg">
                  {format(dateRange.from, "yyyy-MM-dd")} to {format(dateRange.to, "yyyy-MM-dd")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Label className="text-sm font-medium">Working Days</Label>
                <p className="text-lg">{stats.workingDays} days</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
