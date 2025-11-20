import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get appointments for the next 24 hours that haven't had reminders sent
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const { data: appointments, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        patients (name, phone)
      `)
      .eq('status', 'scheduled')
      .eq('sms_reminder_sent', false)
      .gte('start_time', tomorrow.toISOString())
      .lt('start_time', dayAfter.toISOString())

    if (error) throw error

    const results = []

    for (const appointment of appointments || []) {
      const patient = appointment.patients
      if (!patient?.phone) {
        console.log(`No phone number for appointment ${appointment.id}`)
        continue
      }

      const appointmentDate = new Date(appointment.start_time)
      const message = `Reminder: You have an appointment tomorrow at ${appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Reply CONFIRM to confirm or RESCHEDULE to reschedule.`

      // Add to SMS queue
      const { error: queueError } = await supabaseClient
        .from('sms_queue')
        .insert({
          appointment_id: appointment.id,
          phone_number: patient.phone,
          message: message,
          status: 'pending'
        })

      if (queueError) {
        console.error(`Error queuing SMS for appointment ${appointment.id}:`, queueError)
        continue
      }

      // Mark reminder as sent
      await supabaseClient
        .from('appointments')
        .update({
          sms_reminder_sent: true,
          sms_reminder_sent_at: new Date().toISOString()
        })
        .eq('id', appointment.id)

      results.push({
        appointment_id: appointment.id,
        patient_name: patient.name,
        status: 'queued'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})