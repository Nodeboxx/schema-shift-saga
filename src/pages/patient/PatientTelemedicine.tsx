import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, Mic, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { RealtimeVoiceSession } from "@/utils/RealtimeVoice";

const PatientTelemedicine = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const voiceRef = useRef<RealtimeVoiceSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      subscribeToMessages();
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("telemedicine_sessions")
        .select(`
          *,
          doctor:profiles!telemedicine_sessions_doctor_id_fkey(full_name, specialization),
          patient:patients(name, age, sex)
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSession(data);

      // Update session status to active
      if (data.status === "waiting") {
        await supabase
          .from("telemedicine_sessions")
          .update({ status: "active" })
          .eq("id", sessionId);
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("telemedicine_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
    } catch (error: any) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telemedicine_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || newMessage.trim();
    if (!textToSend || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("telemedicine_messages")
        .insert({
          session_id: sessionId!,
          sender_id: user.id,
          sender_type: "patient",
          message: textToSend,
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const startVoiceSession = async () => {
    setIsConnecting(true);
    try {
      voiceRef.current = new RealtimeVoiceSession(
        (message: any) => {
          // Handle messages from voice session
          console.log("Voice message:", message);
          if (message.type === "user" || message.type === "assistant") {
            // Messages will be synced via database subscription
          }
        },
        (status: string) => {
          console.log("Voice status:", status);
          if (status === "error") {
            toast({
              title: "Voice Error",
              description: "Voice connection error",
              variant: "destructive",
            });
          }
        }
      );

      await voiceRef.current.connect();
      setIsVoiceActive(true);
      
      toast({
        title: "Voice Session Active",
        description: "You can now speak with your doctor",
      });
    } catch (error: any) {
      console.error("Error starting voice:", error);
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const stopVoiceSession = () => {
    voiceRef.current?.disconnect();
    setIsVoiceActive(false);
    toast({
      title: "Voice Session Ended",
      description: "Voice communication stopped",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/patient/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Telemedicine Session</h1>
              <p className="text-muted-foreground">
                Dr. {session?.doctor?.full_name} - {session?.doctor?.specialization}
              </p>
            </div>
          </div>
          <Badge variant={session?.status === "active" ? "default" : "secondary"}>
            {session?.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 aspect-video flex flex-col items-center justify-center rounded-t-lg">
                  <Video className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">Video consultation area</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Integrate with your preferred video conferencing platform
                  </p>
                </div>
                <div className="p-4 flex justify-center gap-4">
                  {!isVoiceActive ? (
                    <Button onClick={startVoiceSession} disabled={isConnecting}>
                      <Mic className="h-4 w-4 mr-2" />
                      {isConnecting ? "Connecting..." : "Start Voice Session"}
                    </Button>
                  ) : (
                    <Button onClick={stopVoiceSession} variant="destructive">
                      <Mic className="h-4 w-4 mr-2" />
                      Stop Voice
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div>
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender_type === "patient" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.sender_type === "patient"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.created_at), "p")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={() => handleSendMessage()} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTelemedicine;