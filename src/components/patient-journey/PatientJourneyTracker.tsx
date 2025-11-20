import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import JourneyDialog from "./JourneyDialog";
import MilestoneDialog from "./MilestoneDialog";

interface PatientJourneyTrackerProps {
  patientId: string;
  doctorView?: boolean;
}

const PatientJourneyTracker = ({ patientId, doctorView = false }: PatientJourneyTrackerProps) => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [journeyDialogOpen, setJourneyDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadJourneys();
  }, [patientId]);

  const loadJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_journeys")
        .select(`
          *,
          health_milestones (*)
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJourneys(data || []);
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

  const calculateJourneyProgress = (journey: any) => {
    if (!journey.health_milestones || journey.health_milestones.length === 0) {
      return 0;
    }
    const completed = journey.health_milestones.filter((m: any) => m.status === "completed").length;
    return Math.round((completed / journey.health_milestones.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "outline";
      case "on_hold":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading journeys...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {doctorView && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Patient Journey</h3>
          <Button onClick={() => setJourneyDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Journey
          </Button>
        </div>
      )}

      {journeys.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No patient journeys yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {journeys.map((journey) => (
            <Card key={journey.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{journey.condition_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Started: {format(new Date(journey.diagnosis_date), "PPP")}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(journey.status)}>
                    {journey.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{calculateJourneyProgress(journey)}%</span>
                  </div>
                  <Progress value={calculateJourneyProgress(journey)} className="h-2" />
                </div>

                {journey.health_milestones && journey.health_milestones.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Milestones
                    </div>
                    <div className="space-y-2">
                      {journey.health_milestones.slice(0, 3).map((milestone: any) => (
                        <div
                          key={milestone.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                milestone.status === "completed"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span className="text-sm">{milestone.title}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {milestone.progress_percentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {doctorView && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedJourney(journey);
                        setMilestoneDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Milestone
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JourneyDialog
        open={journeyDialogOpen}
        onOpenChange={setJourneyDialogOpen}
        patientId={patientId}
        onSuccess={loadJourneys}
      />

      <MilestoneDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        journeyId={selectedJourney?.id}
        onSuccess={loadJourneys}
      />
    </div>
  );
};

export default PatientJourneyTracker;