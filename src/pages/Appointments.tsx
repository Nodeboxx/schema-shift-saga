import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import AppointmentList from "@/components/appointments/AppointmentList";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import { Plus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, date]);

  const initAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  };

  const loadAppointments = async () => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (name, age, sex)
        `)
        .eq("doctor_id", user.id)
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time");

      if (error) throw error;
      setAppointments(data || []);
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

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "scheduled" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment approved successfully",
      });
      
      loadAppointments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDenyAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled",
      });
      
      loadAppointments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pendingAppointments = appointments.filter(apt => 
    apt.status === "scheduled" && apt.created_by !== user?.id
  );
  const confirmedAppointments = appointments.filter(apt => 
    apt.status !== "cancelled" && (apt.status !== "scheduled" || apt.created_by === user?.id)
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your schedule and appointment requests</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Requests
              {pendingAppointments.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Appointment Requests</h3>
                {pendingAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending appointment requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{appointment.notes || "New Patient"}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(appointment.start_time), "PPP 'at' p")}
                          </div>
                          <div className="text-sm">
                            Type: <Badge variant="outline">{appointment.type}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveAppointment(appointment.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDenyAppointment(appointment.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confirmed">
            <AppointmentList
              appointments={confirmedAppointments}
              loading={loading}
              onUpdate={loadAppointments}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
              </Card>

              <div className="lg:col-span-2">
                <AppointmentList
                  appointments={appointments}
                  loading={loading}
                  onUpdate={loadAppointments}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={loadAppointments}
          selectedDate={date}
        />
      </div>
    </AppLayout>
  );
};

export default Appointments;