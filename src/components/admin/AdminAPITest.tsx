import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminAPITest = () => {
  const { toast } = useToast();
  const [emailTesting, setEmailTesting] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);
  
  const [emailTest, setEmailTest] = useState({
    email: '',
    name: 'Test User',
  });
  
  const [smsTest, setSmsTest] = useState({
    phone: '',
    message: 'This is a test message from MedRxPro',
  });

  const testEmail = async () => {
    if (!emailTest.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to test',
        variant: 'destructive',
      });
      return;
    }

    setEmailTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          eventType: 'appointment_reminder',
          recipientEmail: emailTest.email,
          recipientName: emailTest.name,
          templateData: {
            patient_name: emailTest.name,
            doctor_name: 'Dr. Test',
            appointment_date: new Date().toLocaleDateString(),
            clinic_name: 'MedRxPro Test',
            clinic_address: 'Test Address',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: 'Email Test Failed',
          description: data.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email Sent!',
          description: `Test email sent successfully to ${emailTest.email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Email Test Failed',
        description: error.message || 'Failed to send test email. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setEmailTesting(false);
    }
  };

  const testSMS = async () => {
    if (!smsTest.phone) {
      toast({
        title: 'Phone Required',
        description: 'Please enter a phone number to test',
        variant: 'destructive',
      });
      return;
    }

    setSmsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber: smsTest.phone,
          message: smsTest.message,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: 'SMS Test Failed',
          description: data.error,
          variant: 'destructive',
        });
      } else if (data?.success) {
        toast({
          title: 'SMS Sent!',
          description: `Test SMS sent successfully to ${smsTest.phone}`,
        });
      } else {
        throw new Error('Unknown SMS response');
      }
    } catch (error: any) {
      toast({
        title: 'SMS Test Failed',
        description: error.message || 'Failed to send test SMS. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setSmsTesting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5" />
          <h3 className="text-xl font-semibold">Test Email Service</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              value={emailTest.email}
              onChange={(e) => setEmailTest(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="test-name">Recipient Name</Label>
            <Input
              id="test-name"
              type="text"
              placeholder="Test User"
              value={emailTest.name}
              onChange={(e) => setEmailTest(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <Button onClick={testEmail} disabled={emailTesting} className="w-full">
            {emailTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-xl font-semibold">Test SMS Service</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-phone">Phone Number</Label>
            <Input
              id="test-phone"
              type="tel"
              placeholder="01712345678"
              value={smsTest.phone}
              onChange={(e) => setSmsTest(prev => ({ ...prev, phone: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bangladesh format: 01XXXXXXXXX
            </p>
          </div>
          
          <div>
            <Label htmlFor="test-sms-message">Message</Label>
            <Textarea
              id="test-sms-message"
              placeholder="Test message"
              value={smsTest.message}
              onChange={(e) => setSmsTest(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>
          
          <Button onClick={testSMS} disabled={smsTesting} className="w-full">
            {smsTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Test SMS
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
