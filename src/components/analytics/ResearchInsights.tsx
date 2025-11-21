import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileSpreadsheet, Database, TrendingUp, Users, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ResearchInsights = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    initUser();
  }, []);

  const initUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (data.length === 0) {
      toast({
        title: "No data",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/ /g, "_")];
          return typeof value === "string" && value.includes(",") 
            ? `"${value}"` 
            : value || "";
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filename} has been downloaded`
    });
  };

  const exportPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = data.map(p => ({
        name: p.name,
        age: p.age,
        sex: p.sex,
        blood_group: p.blood_group,
        weight: p.weight,
        phone: p.phone,
        email: p.email,
        medical_history: p.medical_history,
        allergies: p.allergies,
        created_at: new Date(p.created_at).toLocaleDateString()
      }));

      exportToCSV(
        exportData,
        "patients_data",
        ["Name", "Age", "Sex", "Blood Group", "Weight", "Phone", "Email", "Medical History", "Allergies", "Created At"]
      );
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

  const exportPrescriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          prescription_items (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = data.map(p => ({
        patient_name: p.patient_name,
        patient_age: p.patient_age,
        patient_sex: p.patient_sex,
        prescription_date: p.prescription_date,
        diagnosis: p.dx_text,
        medicine_count: p.prescription_items?.filter((i: any) => i.item_type === "medicine").length || 0,
        created_at: new Date(p.created_at).toLocaleDateString()
      }));

      exportToCSV(
        exportData,
        "prescriptions_data",
        ["Patient Name", "Patient Age", "Patient Sex", "Prescription Date", "Diagnosis", "Medicine Count", "Created At"]
      );
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

  const exportAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (name, age, sex, phone)
        `)
        .eq("doctor_id", userId)
        .order("start_time", { ascending: false });

      if (error) throw error;

      const exportData = data.map(a => ({
        patient_name: a.patients?.name,
        patient_age: a.patients?.age,
        patient_sex: a.patients?.sex,
        patient_phone: a.patients?.phone,
        appointment_date: new Date(a.start_time).toLocaleDateString(),
        appointment_time: new Date(a.start_time).toLocaleTimeString(),
        status: a.status,
        type: a.type,
        notes: a.notes
      }));

      exportToCSV(
        exportData,
        "appointments_data",
        ["Patient Name", "Patient Age", "Patient Sex", "Patient Phone", "Appointment Date", "Appointment Time", "Status", "Type", "Notes"]
      );
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

  const exportPatientJourneys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patient_journeys")
        .select(`
          *,
          patients (name, age, sex),
          health_milestones (*)
        `)
        .eq("doctor_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = data.map(j => ({
        patient_name: j.patients?.name,
        patient_age: j.patients?.age,
        condition_name: j.condition_name,
        diagnosis_date: j.diagnosis_date,
        status: j.status,
        milestones_count: j.health_milestones?.length || 0,
        notes: j.notes
      }));

      exportToCSV(
        exportData,
        "patient_journeys_data",
        ["Patient Name", "Patient Age", "Condition Name", "Diagnosis Date", "Status", "Milestones Count", "Notes"]
      );
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Clinical Data Export
          </CardTitle>
          <CardDescription>
            Export your clinical data for research, analysis, or record-keeping purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Patient Records</h3>
                      <p className="text-sm text-muted-foreground">
                        Export patient demographics, medical history, and contact information
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={exportPatients} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Patients CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Prescriptions</h3>
                      <p className="text-sm text-muted-foreground">
                        Export prescription data including diagnoses and medications
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={exportPrescriptions} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Prescriptions CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Appointments</h3>
                      <p className="text-sm text-muted-foreground">
                        Export appointment history with patient details and outcomes
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={exportAppointments} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Appointments CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Patient Journeys</h3>
                      <p className="text-sm text-muted-foreground">
                        Export patient treatment journeys and milestone progress
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={exportPatientJourneys} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Journeys CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research Guidelines</CardTitle>
          <CardDescription>
            Important information about using exported data for research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Data Privacy & Ethics</h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Ensure patient consent before using data for research</li>
              <li>• Anonymize patient identifiable information (PII)</li>
              <li>• Comply with local data protection regulations (e.g., GDPR, HIPAA)</li>
              <li>• Store exported data securely with encryption</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Research Use Cases</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Clinical outcome analysis and treatment effectiveness</li>
              <li>• Patient demographic studies and epidemiology</li>
              <li>• Practice pattern analysis and quality improvement</li>
              <li>• Academic research and publications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
