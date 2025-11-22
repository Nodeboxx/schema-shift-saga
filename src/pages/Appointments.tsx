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
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadAppointments();
      loadPendingRequests();
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

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (name, age, sex)
        `)
        .eq("doctor_id", user.id)
        .eq("status", "pending")
        .order("start_time");

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
      loadPendingRequests();
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
      loadPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmedAppointments = appointments.filter(apt => 
    apt.status !== "cancelled" && apt.status !== "pending"
  );

  return (
    <AppLayout>
      <SubscriptionGate feature="appointments">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Appointments</h1>
              <p className="text-sm text-muted-foreground">Manage your schedule and appointment requests</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>

        <Tabs defaultValue="pending" className="space-y-4 md:space-y-6">
          <TabsList className="w-full grid grid-cols-3 bg-blue-50 p-1">
            <TabsTrigger 
              value="pending" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              <span className="hidden sm:inline">Pending Requests</span>
              <span className="sm:hidden">Pending</span>
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="confirmed" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              Confirmed
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
            >
              <span className="hidden sm:inline">Calendar View</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Appointment Requests</h3>
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending appointment requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{appointment.notes || "New Patient"}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(appointment.start_time), "PPP 'at' p")}
                          </div>
                          <div className="text-sm mt-1">
                            Type: <Badge variant="outline">{appointment.type}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveAppointment(appointment.id)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDenyAppointment(appointment.id)}
                            className="flex-1 sm:flex-initial"
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
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 text-sm md:text-base">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border w-full"
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
          onSuccess={() => {
            loadAppointments();
            loadPendingRequests();
          }}
          selectedDate={date}
        />
      </div>
      </SubscriptionGate>
    </AppLayout>
  );
};

export default Appointments;