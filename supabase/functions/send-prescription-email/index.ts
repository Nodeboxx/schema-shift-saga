import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  prescriptionId: string;
  patientEmail: string;
  patientName: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { prescriptionId, patientEmail, patientName }: EmailRequest = await req.json();

    console.log("Sending prescription email", { prescriptionId, patientEmail, patientName });

    if (!prescriptionId || !patientEmail) {
      throw new Error("Missing required fields");
    }

    // Get SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from("smtp_settings")
      .select("*")
      .is("clinic_id", null)
      .eq("is_active", true)
      .single();

    if (smtpError || !smtpSettings) {
      console.error("SMTP settings error:", smtpError);
      throw new Error("SMTP settings not configured. Please configure in Admin Dashboard.");
    }

    // Get prescription details
    const { data: prescription, error: rxError } = await supabaseClient
      .from("prescriptions")
      .select("*, patient_id")
      .eq("id", prescriptionId)
      .single();

    if (rxError || !prescription) {
      throw new Error("Prescription not found");
    }

    // Get doctor details
    const { data: doctor, error: docError } = await supabaseClient
      .from("profiles")
      .select("full_name, email, phone, specialization, address")
      .eq("id", prescription.user_id)
      .single();

    if (docError) {
      console.error("Doctor fetch error:", docError);
    }

    // Get patient details
    const { data: patient, error: patError } = await supabaseClient
      .from("patients")
      .select("*")
      .eq("id", prescription.patient_id)
      .maybeSingle();

    const prescriptionUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "")}/prescription/${prescriptionId}`;

    // Prepare email content
    const subject = `Prescription from ${doctor?.full_name || "Your Doctor"}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .doctor-info { margin-bottom: 20px; padding: 15px; background-color: #f1f3f5; border-radius: 6px; }
          .prescription-info { margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          h2 { color: #2c3e50; margin-bottom: 15px; }
          .info-row { margin: 8px 0; }
          .label { font-weight: bold; color: #495057; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #2c3e50;">MedRxPro - Prescription</h1>
          </div>
          
          <div class="content">
            <h2>Dear ${patientName},</h2>
            <p>Your prescription has been prepared and is ready for you.</p>
            
            <div class="doctor-info">
              <h3 style="margin-top: 0;">Doctor Information</h3>
              <div class="info-row"><span class="label">Name:</span> ${doctor?.full_name || "N/A"}</div>
              ${doctor?.specialization ? `<div class="info-row"><span class="label">Specialization:</span> ${doctor.specialization}</div>` : ""}
              ${doctor?.phone ? `<div class="info-row"><span class="label">Phone:</span> ${doctor.phone}</div>` : ""}
              ${doctor?.email ? `<div class="info-row"><span class="label">Email:</span> ${doctor.email}</div>` : ""}
              ${doctor?.address ? `<div class="info-row"><span class="label">Address:</span> ${doctor.address}</div>` : ""}
            </div>

            <div class="prescription-info">
              <h3>Prescription Details</h3>
              <div class="info-row"><span class="label">Patient:</span> ${prescription.patient_name}</div>
              <div class="info-row"><span class="label">Date:</span> ${new Date(prescription.prescription_date || prescription.created_at).toLocaleDateString()}</div>
              ${prescription.patient_age ? `<div class="info-row"><span class="label">Age:</span> ${prescription.patient_age}</div>` : ""}
              ${prescription.patient_sex ? `<div class="info-row"><span class="label">Sex:</span> ${prescription.patient_sex}</div>` : ""}
            </div>

            <p style="margin: 25px 0;">
              <a href="${prescriptionUrl}" class="button">View Full Prescription</a>
            </p>

            <p style="color: #666; font-size: 14px;">
              Click the button above to view your complete prescription online. You can also print it for your records.
            </p>
          </div>

          <div class="footer">
            <p><strong>Important:</strong> Please follow the prescription as directed by your doctor.</p>
            <p>For any questions or concerns, please contact your healthcare provider.</p>
            <p style="margin-top: 20px; font-size: 12px;">
              This email was sent from MedRxPro - Prescription Management System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using SMTP settings
    const encoder = new TextEncoder();
    const auth = btoa(`${smtpSettings.username}:${smtpSettings.password_encrypted}`);

    // Construct email message
    const boundary = "----=_Part_" + Date.now();
    const message = [
      `From: ${smtpSettings.from_name} <${smtpSettings.from_email}>`,
      `To: ${patientEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      "",
      htmlBody,
      `--${boundary}--`,
    ].join("\r\n");

    // Note: Direct SMTP sending from Deno is complex. This is a simplified example.
    // In production, you might want to use a service like Resend, SendGrid, or Mailgun

    console.log("Email prepared successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email prepared. Note: Direct SMTP sending requires additional configuration. Consider using an email service provider.",
        prescriptionUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-prescription-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
