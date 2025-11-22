import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { doctorId, newPassword } = await req.json();

    if (!doctorId || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing doctorId or newPassword' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the requesting user is a clinic admin
    const { data: requesterProfile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !requesterProfile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if user is clinic_admin or super_admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const isClinicAdmin = userRoles.includes('clinic_admin');
    const isSuperAdmin = userRoles.includes('super_admin');

    if (!isClinicAdmin && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Only clinic admins can reset passwords' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Verify the doctor belongs to the same clinic
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('profiles')
      .select('clinic_id, role, email')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctorProfile) {
      console.error('Doctor profile error:', doctorError);
      return new Response(
        JSON.stringify({ error: 'Doctor not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify same clinic (unless super admin)
    if (!isSuperAdmin && doctorProfile.clinic_id !== requesterProfile.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Doctor not in your clinic' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Verify target is a doctor
    if (doctorProfile.role !== 'doctor') {
      return new Response(
        JSON.stringify({ error: 'Target user is not a doctor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Reset the password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      doctorId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reset password', details: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Password reset for doctor ${doctorId} by ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successfully',
        doctorEmail: doctorProfile.email 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in reset-doctor-password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
