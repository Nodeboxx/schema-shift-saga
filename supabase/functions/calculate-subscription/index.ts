import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionData {
  subscription_status: string;
  subscription_tier: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  trial_ends_at: string | null;
  trial_started_at: string | null;
  is_lifetime?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('subscription_status, subscription_tier, subscription_start_date, subscription_end_date, trial_ends_at, trial_started_at')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const subscription = profile as SubscriptionData;
    const now = new Date();

    // Check if lifetime subscription
    const isLifetime = subscription.subscription_tier === 'lifetime' || 
                      (subscription.subscription_end_date && 
                       new Date(subscription.subscription_end_date).getFullYear() > 2099);

    if (isLifetime) {
      return new Response(
        JSON.stringify({
          hasAccess: true,
          status: 'active',
          tier: subscription.subscription_tier,
          isLifetime: true,
          remainingDays: null,
          statusColor: 'green'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate remaining days
    let remainingDays = 0;
    let endDate: Date | null = null;

    if (subscription.subscription_status === 'trial' && subscription.trial_ends_at) {
      endDate = new Date(subscription.trial_ends_at);
    } else if (subscription.subscription_end_date) {
      endDate = new Date(subscription.subscription_end_date);
    }

    if (endDate) {
      const diff = endDate.getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Determine status color
    let statusColor = 'red';
    if (remainingDays > 7) {
      statusColor = 'green';
    } else if (remainingDays > 0) {
      statusColor = 'orange';
    }

    // Check if has access
    const hasAccess = subscription.subscription_status === 'active' ||
                     (subscription.subscription_status === 'trial' && remainingDays > 0);

    return new Response(
      JSON.stringify({
        hasAccess,
        status: subscription.subscription_status,
        tier: subscription.subscription_tier,
        isLifetime: false,
        remainingDays,
        statusColor,
        startDate: subscription.subscription_start_date || subscription.trial_started_at,
        endDate: subscription.subscription_end_date || subscription.trial_ends_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
