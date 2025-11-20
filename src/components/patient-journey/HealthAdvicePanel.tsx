import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle2, AlertCircle, Info, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import HealthAdviceDialog from "./HealthAdviceDialog";

interface HealthAdvicePanelProps {
  patientId: string;
  doctorView?: boolean;
}

const HealthAdvicePanel = ({ patientId, doctorView = false }: HealthAdvicePanelProps) => {
  const [adviceList, setAdviceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAdvice();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('health_advice_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_advice',
          filter: `patient_id=eq.${patientId}`
        },
        () => {
          loadAdvice();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const loadAdvice = async () => {
    try {
      const { data, error } = await supabase
        .from("health_advice")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdviceList(data || []);
    } catch (error: any) {
      console.error("Error loading advice:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (adviceId: string) => {
    try {
      const { error } = await supabase
        .from("health_advice")
        .update({
          status: "read",
          read_at: new Date().toISOString()
        })
        .eq("id", adviceId);

      if (error) throw error;

      toast({
        title: "Marked as read",
        description: "Health advice has been marked as read"
      });

      loadAdvice();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medication":
        return "default";
      case "lifestyle":
        return "secondary";
      case "diet":
        return "outline";
      case "exercise":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading advice...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Health Advice
          </CardTitle>
          {doctorView && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Send Advice
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {adviceList.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No health advice yet
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {adviceList.map((advice) => (
                <Card key={advice.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getPriorityIcon(advice.priority)}
                        <h4 className="font-semibold text-sm">{advice.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeColor(advice.advice_type)} className="text-xs">
                          {advice.advice_type}
                        </Badge>
                        {advice.status === "read" && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{advice.message}</p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(advice.created_at), "PPp")}
                      </span>
                      {!doctorView && advice.status !== "read" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(advice.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {doctorView && (
        <HealthAdviceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          patientId={patientId}
          onSuccess={loadAdvice}
        />
      )}
    </Card>
  );
};

export default HealthAdvicePanel;