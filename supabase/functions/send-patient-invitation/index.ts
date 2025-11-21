import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { patientId, email, doctorName } = await req.json();

    // Generate invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Create invitation
    const { error: inviteError } = await supabaseClient
      .from("patient_invitations")
      .insert({
        patient_id: patientId,
        invited_by: user.id,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) throw inviteError;

    // Update patient record
    const { error: updateError } = await supabaseClient
      .from("patients")
      .update({
        invitation_token: token,
        invitation_sent_at: new Date().toISOString(),
        email: email,
      })
      .eq("id", patientId);

    if (updateError) throw updateError;

    // TODO: Send email via Resend when RESEND_API_KEY is configured
    // For now, return the invitation link for manual sharing
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const projectId = baseUrl?.split("//")[1]?.split(".")[0] || "";
    const appUrl = `https://${projectId}.lovable.app`;
    const invitationLink = `${appUrl}/patient-invite?token=${token}`;

    console.log("Patient invitation created:", {
      patientId,
      email,
      invitationLink,
    });

    return new Response(
      JSON.stringify({
        success: true,
        invitationLink,
        message: "Invitation created successfully. Share this link with the patient.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending patient invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});