import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

export const AdminSMTP = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    use_tls: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .is('clinic_id', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings({
          host: data.host,
          port: data.port,
          username: data.username,
          password: '', // Don't show encrypted password
          from_email: data.from_email,
          from_name: data.from_name || '',
          use_tls: data.use_tls
        });
      }
    } catch (error: any) {
      console.error('Error loading SMTP settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('smtp_settings')
        .upsert({
          clinic_id: null,
          host: settings.host,
          port: settings.port,
          username: settings.username,
          password_encrypted: settings.password, // In production, encrypt this
          from_email: settings.from_email,
          from_name: settings.from_name,
          use_tls: settings.use_tls,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'SMTP settings saved successfully'
      });
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

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          to: settings.from_email,
          subject: 'SMTP Test',
          body: 'This is a test email from your MedEx system.'
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Test email sent successfully! Check your inbox.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">SMTP Configuration</h2>

      <div className="space-y-4 max-w-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="host">SMTP Host</Label>
            <Input
              id="host"
              value={settings.host}
              onChange={(e) => setSettings({ ...settings, host: e.target.value })}
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={settings.port}
              onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={settings.username}
            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
            placeholder="your-email@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={settings.password}
            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
            placeholder="Enter new password to update"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="from_email">From Email</Label>
            <Input
              id="from_email"
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
              placeholder="noreply@medex.com"
            />
          </div>

          <div>
            <Label htmlFor="from_name">From Name</Label>
            <Input
              id="from_name"
              value={settings.from_name}
              onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
              placeholder="MedEx System"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="use_tls"
            checked={settings.use_tls}
            onCheckedChange={(checked) => setSettings({ ...settings, use_tls: checked })}
          />
          <Label htmlFor="use_tls">Use TLS</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>

          <Button variant="outline" onClick={handleTest} disabled={testing || !settings.host}>
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!testing && <Send className="mr-2 h-4 w-4" />}
            Send Test Email
          </Button>
        </div>
      </div>
    </Card>
  );
};
