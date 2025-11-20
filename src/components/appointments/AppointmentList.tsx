import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, X, MessageSquare, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentListProps {
  appointments: any[];
  loading: boolean;
  onUpdate: () => void;
}

const AppointmentList = ({ appointments, loading, onUpdate }: AppointmentListProps) => {
  const { toast } = useToast();
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in_consultation":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleReschedule = async () => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          start_time: newStartTime,
          end_time: newEndTime
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      // Log to history
      await supabase.from("appointment_history").insert({
        appointment_id: selectedAppointment.id,
        action: "rescheduled",
        old_values: {
          start_time: selectedAppointment.start_time,
          end_time: selectedAppointment.end_time
        },
        new_values: {
          start_time: newStartTime,
          end_time: newEndTime
        }
      });

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully"
      });

      setRescheduleDialog(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancellation_reason: cancelReason,
          cancelled_by: user?.id
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      // Log to history
      await supabase.from("appointment_history").insert({
        appointment_id: selectedAppointment.id,
        action: "cancelled",
        old_values: { status: selectedAppointment.status },
        new_values: { 
          status: "cancelled",
          reason: cancelReason
        }
      });

      toast({
        title: "Success",
        description: "Appointment cancelled"
      });

      setCancelDialog(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <Card className="p-6"><div>Loading appointments...</div></Card>;
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No appointments scheduled for this day
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant={getStatusColor(appointment.status)}>
                  {appointment.status.replace("_", " ")}
                </Badge>
                <Badge variant={appointment.patient_type === "walk_in" ? "secondary" : "outline"}>
                  {appointment.patient_type === "walk_in" ? "Walk-In" : "Scheduled"}
                </Badge>
                {appointment.sms_reminder_sent && (
                  <Badge variant="outline" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    SMS Sent
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(appointment.start_time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                  {" - "}
                  {new Date(appointment.end_time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {appointment.patients?.name || "Unknown Patient"}
                </span>
                {appointment.patients?.phone && (
                  <a href={`tel:${appointment.patients.phone}`} className="text-xs text-primary flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.patients.phone}
                  </a>
                )}
              </div>

              {appointment.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {appointment.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {appointment.status === "scheduled" && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setNewStartTime(appointment.start_time);
                      setNewEndTime(appointment.end_time);
                      setRescheduleDialog(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Reschedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setCancelDialog(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-start">New Start Time</Label>
              <Input
                id="new-start"
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-end">New End Time</Label>
              <Input
                id="new-end"
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this appointment?
            </p>
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Go Back</Button>
            <Button variant="destructive" onClick={handleCancel}>Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentList;