import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface TelemedicineSessionProps {
  session: any;
  onEnd: () => void;
}

const TelemedicineSession = ({ session, onEnd }: TelemedicineSessionProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    getCurrentUser();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`session_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemedicine_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("telemedicine_messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("telemedicine_messages")
        .insert({
          session_id: session.id,
          sender_id: user.id,
          sender_type: "doctor",
          message: newMessage.trim(),
          message_type: "text",
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onEnd}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.appointments.patients.name}</h1>
            <p className="text-sm text-muted-foreground">
              Virtual Consultation - {format(new Date(), "PPp")}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={onEnd}>
          End Session
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Video Area */}
        <Card className="col-span-2 p-6 h-[600px] flex flex-col">
          <div className="flex-1 bg-secondary rounded-lg flex items-center justify-center mb-4">
            <div className="text-center space-y-4">
              <Video className="h-24 w-24 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Video consultation area</p>
              <p className="text-sm text-muted-foreground">
                Integrate with your preferred video conferencing platform
              </p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMicOn ? "default" : "destructive"}
              size="lg"
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="lg"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="p-6 h-[600px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Chat</h3>

          <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {format(new Date(msg.created_at), "p")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Patient Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{session.appointments.patients.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-medium">{session.appointments.patients.age || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{session.appointments.patients.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Appointment Time</p>
            <p className="font-medium">
              {format(new Date(session.appointments.start_time), "PPp")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TelemedicineSession;
