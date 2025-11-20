import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Bell } from "lucide-react";

interface NotificationConfig {
  id: string;
  event_type: string;
  channel: string;
  is_enabled: boolean;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications_config")
        .select("*")
        .order("event_type", { ascending: true });

      if (error) throw error;
      setConfigs((data || []) as NotificationConfig[]);
    } catch (error: any) {
      toast({ title: "Error loading settings", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("notifications_config")
        .update({ is_enabled: enabled })
        .eq("id", id);

      if (error) throw error;
      toast({ title: `Notification ${enabled ? "enabled" : "disabled"}` });
      loadConfigs();
    } catch (error: any) {
      toast({ title: "Error updating setting", description: error.message, variant: "destructive" });
    }
  };

  const createDefaultConfigs = async () => {
    const defaults = [
      { event_type: "appointment_created", channel: "email", is_enabled: true },
      { event_type: "appointment_reminder", channel: "sms", is_enabled: true },
      { event_type: "appointment_cancelled", channel: "email", is_enabled: true },
      { event_type: "health_advice_sent", channel: "email", is_enabled: true },
      { event_type: "milestone_completed", channel: "email", is_enabled: false },
    ];

    try {
      const { error } = await supabase.from("notifications_config").insert(defaults);
      if (error) throw error;
      toast({ title: "Default configurations created" });
      loadConfigs();
    } catch (error: any) {
      toast({ title: "Error creating defaults", description: error.message, variant: "destructive" });
    }
  };

  const getIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-5 h-5" />;
      case "sms":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground">Configure when and how notifications are sent</p>
        </div>
        {configs.length === 0 && (
          <Button onClick={createDefaultConfigs}>Create Default Settings</Button>
        )}
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notification settings configured yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(config.channel)}
                    <div>
                      <CardTitle className="text-base">
                        {config.event_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </CardTitle>
                      <CardDescription>
                        Channel: {config.channel.toUpperCase()}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={config.is_enabled}
                    onCheckedChange={(checked) => toggleConfig(config.id, checked)}
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li><strong>appointment_created</strong> - When a new appointment is scheduled</li>
            <li><strong>appointment_reminder</strong> - 24 hours before appointment</li>
            <li><strong>appointment_cancelled</strong> - When an appointment is cancelled</li>
            <li><strong>health_advice_sent</strong> - When doctor sends health advice</li>
            <li><strong>milestone_completed</strong> - When patient completes a health milestone</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
