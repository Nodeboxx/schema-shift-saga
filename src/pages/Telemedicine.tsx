import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import TelemedicineSession from "@/components/telemedicine/TelemedicineSession";

interface Session {
  id: string;
  appointment_id: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  meeting_link: string | null;
  appointments: {
    patient_id: string;
    start_time: string;
    patients: {
      name: string;
      age: string | null;
      phone: string | null;
    } | null;
  } | null;
}

const Telemedicine = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('telemedicine_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telemedicine_sessions'
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("telemedicine_sessions")
        .select(`
          *,
          appointments (
            patient_id,
            start_time,
            patients (
              name,
              age,
              phone
            )
          )
        `)
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('[Telemedicine] Loaded sessions:', data);
      setSessions(data || []);

      // Check if we need to auto-start a session from URL parameters
      const sessionId = searchParams.get('session');
      const autoStart = searchParams.get('autoStart') === 'true';
      
      console.log('[Telemedicine] URL params:', { sessionId, autoStart });
      
      if (sessionId && autoStart && data) {
        const session = data.find(s => s.id === sessionId);
        console.log('[Telemedicine] Found session to auto-start:', session);
        
        if (session && session.status === 'waiting') {
          // Auto-start the session
          console.log('[Telemedicine] Auto-starting session...');
          await startSession(sessionId);
        } else {
          console.log('[Telemedicine] Session not in waiting status or not found');
        }
      }
    } catch (error: any) {
      console.error('[Telemedicine] Error loading sessions:', error);
      toast({
        title: "Error loading sessions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      console.log('[Telemedicine] Starting session:', sessionId);
      
      const { error } = await supabase
        .from("telemedicine_sessions")
        .update({
          status: "in_progress",
          start_time: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        console.error('[Telemedicine] Error updating session:', error);
        throw error;
      }

      console.log('[Telemedicine] Session started successfully, setting active');
      setActiveSession(sessionId);
      
      toast({
        title: "Session started",
        description: "You can now communicate with the patient",
      });
    } catch (error: any) {
      console.error('[Telemedicine] Error in startSession:', error);
      toast({
        title: "Error starting session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("telemedicine_sessions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;

      setActiveSession(null);
      toast({
        title: "Session ended",
        description: "Session has been completed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error ending session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Scheduled", variant: "secondary" },
      waiting: { label: "Waiting", variant: "default" },
      in_progress: { label: "In Progress", variant: "outline" },
      completed: { label: "Completed", variant: "secondary" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterSessions = (status: string[]) => {
    return sessions.filter(s => status.includes(s.status));
  };

  if (activeSession) {
    const session = sessions.find(s => s.id === activeSession);
    if (session) {
      return <TelemedicineSession session={session} onEnd={() => endSession(activeSession)} />;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <SubscriptionGate feature="telemedicine">
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Telemedicine</h1>
              <p className="text-sm text-muted-foreground">Manage your virtual consultations</p>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Virtual Consultations</span>
            </div>
          </div>

          <Tabs defaultValue="active" className="space-y-4 md:space-y-6">
            <TabsList className="w-full grid grid-cols-3 bg-blue-50 p-1">
              <TabsTrigger 
                value="active" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
              >
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Active & Waiting</span>
                <span className="sm:hidden">Active</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
              >
                <Clock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Scheduled</span>
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Completed</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {filterSessions(["waiting", "in_progress"]).length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active sessions</p>
                </Card>
              ) : (
                filterSessions(["waiting", "in_progress"]).map((session) => {
                  if (!session.appointments?.patients) return null;
                  return (
                  <Card key={session.id} className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg md:text-xl font-semibold">{session.appointments.patients.name}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span>Age: {session.appointments.patients.age || "N/A"}</span>
                          <span>Phone: {session.appointments.patients.phone || "N/A"}</span>
                          <span className="hidden sm:inline">Scheduled: {format(new Date(session.appointments.start_time), "PPp")}</span>
                          <span className="sm:hidden">Scheduled: {format(new Date(session.appointments.start_time), "P")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.status === "waiting" && (
                          <Button onClick={() => startSession(session.id)} className="flex-1 sm:flex-initial">
                            <Video className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                        {session.status === "in_progress" && (
                          <>
                            <Button onClick={() => setActiveSession(session.id)} className="flex-1 sm:flex-initial">
                              Open
                            </Button>
                            <Button variant="destructive" onClick={() => endSession(session.id)} className="flex-1 sm:flex-initial">
                              <XCircle className="h-4 w-4 mr-1" />
                              End
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                )})
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              {filterSessions(["scheduled"]).length === 0 ? (
                <Card className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No scheduled sessions</p>
                </Card>
              ) : (
                filterSessions(["scheduled"]).map((session) => {
                  if (!session.appointments?.patients) return null;
                  return (
                  <Card key={session.id} className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg md:text-xl font-semibold">{session.appointments.patients.name}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="hidden sm:inline">Scheduled: {format(new Date(session.appointments.start_time), "PPp")}</span>
                          <span className="sm:hidden">Scheduled: {format(new Date(session.appointments.start_time), "P")}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )})
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filterSessions(["completed"]).length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed sessions</p>
                </Card>
              ) : (
                filterSessions(["completed"]).map((session) => {
                  if (!session.appointments?.patients) return null;
                  return (
                  <Card key={session.id} className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg md:text-xl font-semibold">{session.appointments.patients.name}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span>Completed: {session.end_time ? format(new Date(session.end_time), "PPp") : "N/A"}</span>
                          {session.start_time && session.end_time && (
                            <span>
                              Duration: {Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )})
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SubscriptionGate>
    </AppLayout>
  );
};

export default Telemedicine;
