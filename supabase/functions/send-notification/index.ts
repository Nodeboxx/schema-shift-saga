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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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
        JSON.stringify({ message: "Notification disabled" }),
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
        JSON.stringify({ error: "Email template not found" }),
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
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});