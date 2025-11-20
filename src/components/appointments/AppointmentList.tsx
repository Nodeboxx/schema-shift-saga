import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";

interface AppointmentListProps {
  appointments: any[];
  loading: boolean;
  onUpdate: () => void;
}

const AppointmentList = ({ appointments, loading, onUpdate }: AppointmentListProps) => {
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
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={getStatusColor(appointment.status)}>
                  {appointment.status.replace("_", " ")}
                </Badge>
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
              </div>

              {appointment.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {appointment.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {appointment.status === "scheduled" && (
                <Button size="sm" variant="outline">
                  Start
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentList;