import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import AppointmentList from "@/components/appointments/AppointmentList";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import { Plus, ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your schedule</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Calendar</h3>
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

        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={loadAppointments}
          selectedDate={date}
        />
      </div>
    </div>
  );
};

export default Appointments;