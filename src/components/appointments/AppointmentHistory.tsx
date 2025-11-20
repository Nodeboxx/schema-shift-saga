import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";

interface AppointmentHistoryProps {
  appointmentId: string;
}

const AppointmentHistory = ({ appointmentId }: AppointmentHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [appointmentId]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("appointment_history")
        .select(`
          *,
          profiles:changed_by (full_name)
        `)
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "default";
      case "rescheduled":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No history available for this appointment
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {history.map((entry) => (
          <Card key={entry.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActionColor(entry.action)}>
                    {entry.action}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(entry.created_at), "PPp")}
                  </div>
                </div>

                {entry.profiles && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    {entry.profiles.full_name}
                  </div>
                )}

                {entry.old_values && (
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Changes:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Before: </span>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {JSON.stringify(entry.old_values, null, 2)}
                        </code>
                      </div>
                      {entry.new_values && (
                        <div>
                          <span className="text-muted-foreground">After: </span>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {JSON.stringify(entry.new_values, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AppointmentHistory;