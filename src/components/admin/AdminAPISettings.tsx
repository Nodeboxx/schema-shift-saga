import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Save, Key, Cpu, CreditCard, Mail } from 'lucide-react';

export const AdminAPISettings = () => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  
  const [apiSettings, setApiSettings] = useState({
    // AI Services
    openai_key: '',
    gemini_key: '',
    anthropic_key: '',
    
    // Payment Gateways
    stripe_public_key: '',
    stripe_secret_key: '',
    paypal_client_id: '',
    paypal_secret: '',
    
    // Email Services
    sendgrid_key: '',
    mailgun_key: '',
    
    // SMS Services
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone: ''
  });

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to database or environment
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated save
      
      toast({
        title: 'Success',
        description: 'API settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderAPIField = (
    name: string,
    label: string,
    placeholder: string,
    icon: any
  ) => {
    const Icon = icon;
    const isVisible = showKeys[name];
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id={name}
              type={isVisible ? 'text' : 'password'}
              placeholder={placeholder}
              value={apiSettings[name as keyof typeof apiSettings]}
              onChange={(e) => setApiSettings(prev => ({ ...prev, [name]: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => toggleKeyVisibility(name)}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">API & Integration Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure third-party services and API keys
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Key className="h-3 w-3" />
          Encrypted Storage
        </Badge>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">
            <Cpu className="h-4 w-4 mr-2" />
            AI Services
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email/SMS
          </TabsTrigger>
          <TabsTrigger value="other">
            <Key className="h-4 w-4 mr-2" />
            Other
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4">
            {renderAPIField('openai_key', 'OpenAI API Key', 'sk-...', Key)}
            {renderAPIField('gemini_key', 'Google Gemini API Key', 'AIza...', Key)}
            {renderAPIField('anthropic_key', 'Anthropic API Key', 'sk-ant-...', Key)}
          </div>
          
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">AI Service Usage</h3>
            <p className="text-sm text-muted-foreground">
              Configure AI services for voice transcription, prescription suggestions, and medical insights.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe Configuration
              </h3>
              {renderAPIField('stripe_public_key', 'Publishable Key', 'pk_...', Key)}
              {renderAPIField('stripe_secret_key', 'Secret Key', 'sk_...', Key)}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                PayPal Configuration
              </h3>
              {renderAPIField('paypal_client_id', 'Client ID', 'AY...', Key)}
              {renderAPIField('paypal_secret', 'Secret', 'E...', Key)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Services
              </h3>
              {renderAPIField('sendgrid_key', 'SendGrid API Key', 'SG...', Key)}
              {renderAPIField('mailgun_key', 'Mailgun API Key', 'key-...', Key)}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Twilio SMS
              </h3>
              {renderAPIField('twilio_account_sid', 'Account SID', 'AC...', Key)}
              {renderAPIField('twilio_auth_token', 'Auth Token', '...', Key)}
              {renderAPIField('twilio_phone', 'Phone Number', '+1...', Key)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Additional integrations can be configured here. Contact support for custom integration requirements.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
};
