import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, Video, User, LogOut } from "lucide-react";
import { format } from "date-fns";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Get patient record
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatientData(patient);

      // Load prescriptions
      const { data: prescData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false });
      setPrescriptions(prescData || []);

      // Load appointments
      const { data: apptData } = await supabase
        .from("appointments")
        .select(`
          *,
          doctor:profiles!appointments_doctor_id_fkey(full_name, specialization)
        `)
        .eq("patient_id", patient.id)
        .order("start_time", { ascending: false });
      setAppointments(apptData || []);

      // Load telemedicine sessions
      const { data: sessionData } = await supabase
        .from("telemedicine_sessions")
        .select(`
          *,
          doctor:profiles!telemedicine_sessions_doctor_id_fkey(full_name, specialization)
        `)
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false });
      setSessions(sessionData || []);

    } catch (error: any) {
      console.error("Error loading patient data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const joinSession = (sessionId: string) => {
    navigate(`/patient/telemedicine/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Portal</h1>
            <p className="text-muted-foreground">Welcome, {patientData?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{patientData?.age || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sex</p>
              <p className="font-medium">{patientData?.sex || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-medium">{patientData?.blood_group || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{patientData?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{patientData?.email || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <FileText className="h-4 w-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="telemedicine">
              <Video className="h-4 w-4 mr-2" />
              Telemedicine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <div className="grid gap-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No appointments found
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Dr. {appointment.doctor?.full_name}</CardTitle>
                          <CardDescription>{appointment.doctor?.specialization}</CardDescription>
                        </div>
                        <Badge>{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Date:</strong> {format(new Date(appointment.start_time), "PPP")}
                        </p>
                        <p className="text-sm">
                          <strong>Time:</strong> {format(new Date(appointment.start_time), "p")} - {format(new Date(appointment.end_time), "p")}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="grid gap-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No prescriptions found
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{prescription.patient_name}</CardTitle>
                          <CardDescription>
                            {format(new Date(prescription.prescription_date), "PPP")}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/verify/${prescription.unique_hash}`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="telemedicine">
            <div className="grid gap-4">
              {sessions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No telemedicine sessions found
                  </CardContent>
                </Card>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Dr. {session.doctor?.full_name}</CardTitle>
                          <CardDescription>{session.doctor?.specialization}</CardDescription>
                        </div>
                        <Badge>{session.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">
                          <strong>Session Date:</strong> {format(new Date(session.created_at), "PPP p")}
                        </p>
                        {session.status === "active" && (
                          <Button onClick={() => joinSession(session.id)} className="w-full">
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;