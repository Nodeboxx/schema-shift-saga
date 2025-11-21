import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find expired trials
    const { data: expiredTrials, error: trialError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, trial_ends_at')
      .eq('subscription_status', 'trial')
      .lt('trial_ends_at', new Date().toISOString())

    if (trialError) throw trialError

    // Deactivate expired trials
    if (expiredTrials && expiredTrials.length > 0) {
      const expiredIds = expiredTrials.map(p => p.id)
      
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          subscription_tier: 'free'
        })
        .in('id', expiredIds)

      console.log(`Deactivated ${expiredIds.length} expired trials`)
    }

    // Find expired subscriptions
    const { data: expiredSubs, error: subError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, subscription_end_date')
      .eq('subscription_status', 'active')
      .lt('subscription_end_date', new Date().toISOString())

    if (subError) throw subError

    // Deactivate expired subscriptions
    if (expiredSubs && expiredSubs.length > 0) {
      const expiredSubIds = expiredSubs.map(p => p.id)
      
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          subscription_tier: 'free'
        })
        .in('id', expiredSubIds)

      console.log(`Deactivated ${expiredSubIds.length} expired subscriptions`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiredTrials: expiredTrials?.length || 0,
        expiredSubscriptions: expiredSubs?.length || 0
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
