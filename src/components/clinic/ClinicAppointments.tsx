import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClinicAppointmentsProps {
  clinicId: string;
}

const ClinicAppointments = ({ clinicId }: ClinicAppointmentsProps) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
  });

  useEffect(() => {
    loadAppointments();
  }, [clinicId, filterStatus]);

  const loadAppointments = async () => {
    try {
      // Get all doctors in this clinic
      const { data: doctors, error: doctorsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clinic_id", clinicId);

      if (doctorsError) throw doctorsError;

      const doctorIds = doctors?.map((d) => d.id) || [];

      if (doctorIds.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Build query
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patient:patients(name, phone, email),
          doctor:profiles!appointments_doctor_id_fkey(full_name, specialization)
        `)
        .in("doctor_id", doctorIds)
        .order("start_time", { ascending: false })
        .limit(100);

      // Apply status filter
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);

      // Calculate stats
      const allAppointments = data || [];
      setStats({
        total: allAppointments.length,
        scheduled: allAppointments.filter((a) => a.status === "scheduled").length,
        completed: allAppointments.filter((a) => a.status === "completed").length,
        cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
        pending: allAppointments.filter((a) => a.status === "pending").length,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus as any, updated_at: new Date().toISOString() })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment status updated",
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: { variant: "default", icon: <Calendar className="h-3 w-3" /> },
      completed: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      pending: { variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <Card className="p-6"><div>Loading appointments...</div></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Appointments</h3>
            <p className="text-sm text-muted-foreground">Manage all clinic appointments</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.patient?.name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.patient?.phone || appointment.patient?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.doctor?.full_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.doctor?.specialization}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {new Date(appointment.start_time).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{appointment.type || "in-person"}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {appointment.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "scheduled")}
                          >
                            Approve
                          </Button>
                        )}
                        {appointment.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                        {(appointment.status === "pending" ||
                          appointment.status === "scheduled") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClinicAppointments;
