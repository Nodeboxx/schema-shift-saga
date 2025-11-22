import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  eventType: string;
  recipientEmail: string;
  recipientName: string;
  templateData: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Resend API key from site_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'api_settings')
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching API settings:', settingsError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch API settings. Please configure your settings in Admin > API Settings.',
          details: settingsError.message,
          code: 'SETTINGS_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resendApiKey = settingsData?.value?.resend_api_key;
    
    if (!resendApiKey) {
      console.error('Resend API key not found in settings');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured. Please add your Resend API key in Admin > API Settings > Email/SMS tab.',
          code: 'MISSING_API_KEY'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const { eventType, recipientEmail, recipientName, templateData }: NotificationRequest = await req.json();

    console.log("Processing notification:", { eventType, recipientEmail });

    // Check if notification is enabled
    const { data: config } = await supabase
      .from("notifications_config")
      .select("is_enabled")
      .eq("event_type", eventType)
      .eq("channel", "email")
      .single();

    if (!config?.is_enabled) {
      console.log("Notification disabled for event:", eventType);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Email notifications are disabled for this event type. Enable in Admin > Notifications.'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get email template based on event type
    const eventToCategory: Record<string, string> = {
      prescription_created: "prescription",
      appointment_created: "appointment",
      appointment_approved: "appointment",
      appointment_reminder: "reminder",
      appointment_rescheduled: "appointment",
      health_advice_sent: "health_advice"
    };

    const category = eventToCategory[eventType];

    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (templateError || !template) {
      console.error("Template not found:", templateError);
      return new Response(
        JSON.stringify({ 
          error: `Email template not found for "${eventType}". Please configure templates in Admin > Email Templates.`,
          code: 'TEMPLATE_NOT_FOUND'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Replace variables in template
    let emailBody = template.body_html;
    let emailSubject = template.subject;

    Object.keys(templateData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      emailBody = emailBody.replace(regex, templateData[key]);
      emailSubject = emailSubject.replace(regex, templateData[key]);
    });

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "MedRxPro <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: emailSubject,
      html: emailBody,
    });

    if (error) {
      console.error("Error sending email:", error);
      
      let errorMessage = 'Failed to send email. ';
      if (error.message?.includes('API key')) {
        errorMessage += 'Please verify your Resend API key in Admin > API Settings.';
      } else if (error.message?.includes('domain')) {
        errorMessage += 'Please verify your domain in Resend dashboard.';
      } else {
        errorMessage += error.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: error.message,
          code: 'RESEND_ERROR'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data?.id,
        message: 'Email sent successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    
    let errorMessage = 'Failed to send email notification.';
    if (error instanceof Error) {
      if (error.message?.includes('API key')) {
        errorMessage = 'Invalid Resend API key. Please check your configuration in Admin > API Settings.';
      } else if (error.message?.includes('domain')) {
        errorMessage = 'Email domain not verified. Please verify your domain in Resend dashboard.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: 'NOTIFICATION_ERROR'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
