import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { User, Calendar, FileText, ClipboardList, Upload, Phone, Mail, Heart } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  created_at: string;
}

interface Prescription {
  id: string;
  created_at: string;
  prescription_date: string;
}

interface Appointment {
  id: string;
  start_time: string;
  status: string;
  type: string;
}

interface PatientDetailDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatientDetailDialog = ({ patient, open, onOpenChange }: PatientDetailDialogProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient && open) {
      loadPatientData();
    }
  }, [patient, open]);

  const loadPatientData = async () => {
    if (!patient) return;
    setLoading(true);

    try {
      const [prescriptionsRes, appointmentsRes] = await Promise.all([
        supabase
          .from("prescriptions")
          .select("id, created_at, prescription_date")
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("id, start_time, status, type")
          .eq("patient_id", patient.id)
          .order("start_time", { ascending: false }),
      ]);

      setPrescriptions(prescriptionsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  const nextAppointment = appointments.find(
    (apt) => apt.status === "scheduled" && new Date(apt.start_time) > new Date()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div>{patient.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Patient ID: {patient.id.slice(0, 8)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{patient.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-medium">{patient.sex || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.blood_group || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">{format(new Date(patient.created_at), "PP")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone || "No phone number"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email || "No email"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                  <p className="text-sm">{patient.allergies || "No known allergies"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Medical History</p>
                  <p className="text-sm">{patient.medical_history || "No medical history recorded"}</p>
                </div>
              </CardContent>
            </Card>

            {nextAppointment && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{format(new Date(nextAppointment.start_time), "PPP 'at' p")}</p>
                  <Badge className="mt-2">{nextAppointment.type || "General"}</Badge>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No appointments yet</p>
                </CardContent>
              </Card>
            ) : (
              appointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{format(new Date(apt.start_time), "PPP")}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(apt.start_time), "p")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={apt.status === "scheduled" ? "default" : "secondary"}>
                          {apt.status}
                        </Badge>
                        <Badge variant="outline">{apt.type || "General"}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No prescriptions yet</p>
                </CardContent>
              </Card>
            ) : (
              prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Prescription #{rx.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(rx.prescription_date || rx.created_at), "PPP")}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-3">
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium mb-2">Test Results Upload</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload lab reports, X-rays, and other test results
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
