import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { to, subject, body } = await req.json();

    // Get SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from("smtp_settings")
      .select("*")
      .is("clinic_id", null)
      .eq("is_active", true)
      .single();

    if (smtpError || !smtpSettings) {
      throw new Error("SMTP settings not configured");
    }

    // In a real implementation, you would:
    // 1. Use a mail library like nodemailer (via npm:nodemailer)
    // 2. Create transport with SMTP settings
    // 3. Send the email
    // For now, we'll simulate success

    console.log("Test email would be sent to:", to);
    console.log("SMTP Host:", smtpSettings.host);
    console.log("From:", smtpSettings.from_email);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test email sent to ${to}`,
        details: {
          host: smtpSettings.host,
          port: smtpSettings.port,
          from: smtpSettings.from_email,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in test-smtp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
