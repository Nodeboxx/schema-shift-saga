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
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-xl md:text-2xl">Prescription Report</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={dateRange.from === subDays(new Date(), 30) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDaysRange(30)}
                  className="flex-1 sm:flex-none text-xs md:text-sm"
                >
                  30 DAYS
                </Button>
                <Button
                  variant={dateRange.from === subDays(new Date(), 60) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDaysRange(60)}
                  className="flex-1 sm:flex-none text-xs md:text-sm"
                >
                  60 DAYS
                </Button>
                <Button
                  variant={dateRange.from === subDays(new Date(), 90) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDaysRange(90)}
                  className="flex-1 sm:flex-none text-xs md:text-sm"
                >
                  90 DAYS
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs md:text-sm">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Custom</span>
                      <span className="sm:hidden">Date</span>
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
                <Button onClick={downloadExcel} size="sm" className="flex-1 sm:flex-none text-xs md:text-sm">
                  <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Download Excel</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-blue-50">
              <CardHeader className="pb-2 p-3 md:p-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-blue-900">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-2 p-3 md:p-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Under 5 Years</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-green-900">{stats.under5}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPatients > 0 ? ((stats.under5 / stats.totalPatients) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardHeader className="pb-2 p-3 md:p-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Over 5 Years</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-purple-900">{stats.over5}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPatients > 0 ? ((stats.over5 / stats.totalPatients) * 100).toFixed(0) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardHeader className="pb-2 p-3 md:p-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Avg Per Day</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-orange-900">{stats.avgPerDay}</div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={250} minWidth={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                <Label className="text-xs md:text-sm font-medium">Date Range</Label>
                <p className="text-sm md:text-lg break-words">
                  {format(dateRange.from, "yyyy-MM-dd")} to {format(dateRange.to, "yyyy-MM-dd")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                <Label className="text-xs md:text-sm font-medium">Working Days</Label>
                <p className="text-sm md:text-lg">{stats.workingDays} days</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
