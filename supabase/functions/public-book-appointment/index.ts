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

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const {
      doctorId,
      patientName,
      patientPhone,
      patientEmail,
      startTime,
      endTime,
    } = body as {
      doctorId?: string;
      patientName?: string;
      patientPhone?: string;
      patientEmail?: string;
      startTime?: string;
      endTime?: string;
    };

    console.log("public-book-appointment payload", body);

    if (!doctorId || !patientName || !patientPhone || !startTime || !endTime) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Load doctor profile to determine clinic ownership
    const { data: doctorProfile, error: doctorError } = await supabaseClient
      .from("profiles")
      .select("id, clinic_id")
      .eq("id", doctorId)
      .maybeSingle();

    if (doctorError || !doctorProfile) {
      console.error("Invalid doctor profile", doctorError);
      return new Response(
        JSON.stringify({ error: "Invalid doctor selected" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Find or create patient owned by this doctor
    const { data: existingPatient, error: existingError } = await supabaseClient
      .from("patients")
      .select("id")
      .eq("name", patientName)
      .eq("user_id", doctorProfile.id)
      .eq("doctor_id", doctorProfile.id)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error looking up existing patient", existingError);
      throw existingError;
    }

    let patientId = existingPatient?.id as string | undefined;

    if (!patientId) {
      const { data: newPatient, error: patientError } = await supabaseClient
        .from("patients")
        .insert({
          name: patientName,
          phone: patientPhone,
          email: patientEmail,
          user_id: doctorProfile.id,
          doctor_id: doctorProfile.id,
          clinic_id: doctorProfile.clinic_id,
        })
        .select("id")
        .single();

      if (patientError) {
        console.error("Error creating patient from public booking", patientError);
        throw patientError;
      }

      patientId = newPatient.id;
    }

    // Create the appointment
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .insert({
        doctor_id: doctorProfile.id,
        patient_id: patientId,
        clinic_id: doctorProfile.clinic_id,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        type: "in-person",
        patient_type: "walk_in",
        notes: `Public appointment request - Contact: ${patientPhone}${
          patientEmail ? `, Email: ${patientEmail}` : ""
        }`,
      })
      .select("id")
      .single();

    if (appointmentError) {
      console.error("Error creating appointment from public booking", appointmentError);
      throw appointmentError;
    }

    console.log("public-book-appointment success", {
      appointmentId: appointment.id,
      patientId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        appointmentId: appointment.id,
        patientId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("public-book-appointment unhandled error", error);
    const anyError = error as any;
    const message = anyError?.message || JSON.stringify(anyError) || "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
