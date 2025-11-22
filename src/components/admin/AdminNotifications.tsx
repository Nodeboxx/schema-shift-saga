import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const AdminNotifications = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const notificationTypes = [
    // Email Notifications
    { channel: 'email', event_type: 'prescription_created', label: 'Prescription Created (Email)' },
    { channel: 'email', event_type: 'appointment_created', label: 'Appointment Created (Email)' },
    { channel: 'email', event_type: 'appointment_approved', label: 'Appointment Approved (Email)' },
    { channel: 'email', event_type: 'appointment_reminder', label: 'Appointment Reminder (Email)' },
    { channel: 'email', event_type: 'appointment_rescheduled', label: 'Appointment Rescheduled (Email)' },
    { channel: 'email', event_type: 'health_advice_sent', label: 'Health Advice (Email)' },
    
    // SMS Notifications
    { channel: 'sms', event_type: 'prescription_created', label: 'Prescription Created (SMS)' },
    { channel: 'sms', event_type: 'appointment_created', label: 'Appointment Created (SMS)' },
    { channel: 'sms', event_type: 'appointment_approved', label: 'Appointment Approved (SMS)' },
    { channel: 'sms', event_type: 'appointment_reminder', label: 'Appointment Reminder (SMS)' },
    { channel: 'sms', event_type: 'appointment_rescheduled', label: 'Appointment Rescheduled (SMS)' },
    { channel: 'sms', event_type: 'otp_verification', label: 'OTP Verification (SMS)' },
    { channel: 'sms', event_type: 'password_reset', label: 'Password Reset (SMS)' },
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications_config')
        .select('*');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (channel: string, eventType: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('notifications_config')
        .upsert({
          clinic_id: null,
          channel,
          event_type: eventType,
          is_enabled: enabled,
          settings: {}
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification settings updated'
      });

      loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const isEnabled = (channel: string, eventType: string) => {
    const config = configs.find(
      (c) => c.channel === channel && c.event_type === eventType
    );
    return config?.is_enabled ?? false;
  };

  if (loading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Notification Channels</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Notification Type</TableHead>
            <TableHead className="text-right">Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notificationTypes.map(({ channel, event_type, label }) => (
            <TableRow key={`${channel}-${event_type}`}>
              <TableCell>{label}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Switch
                    id={`${channel}-${event_type}`}
                    checked={isEnabled(channel, event_type)}
                    onCheckedChange={(checked) =>
                      handleToggle(channel, event_type, checked)
                    }
                  />
                  <Label htmlFor={`${channel}-${event_type}`}>
                    {isEnabled(channel, event_type) ? 'On' : 'Off'}
                  </Label>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
