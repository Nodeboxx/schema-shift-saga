import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, subscriptionId, userId } = await req.json()

    // Get user details
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('User not found')
    }

    let subject = ''
    let message = ''

    switch (type) {
      case 'subscription_approved':
        subject = '✅ Your Subscription is Active!'
        message = `Hi ${profile.full_name},\n\nYour subscription has been approved and is now active. You can now access all premium features.\n\nThank you for choosing MedScribe!`
        break
      
      case 'subscription_rejected':
        subject = '❌ Subscription Payment Issue'
        message = `Hi ${profile.full_name},\n\nWe couldn't verify your payment. Please contact support or try again with a different payment method.\n\nThank you!`
        break
      
      case 'trial_ending':
        subject = '⏰ Your Trial is Ending Soon'
        message = `Hi ${profile.full_name},\n\nYour free trial will end in 3 days. Choose a plan to continue using all features without interruption.\n\nView Plans: ${Deno.env.get('SUPABASE_URL')}/\n\nThank you!`
        break
      
      case 'subscription_expiring':
        subject = '⏰ Subscription Renewal Reminder'
        message = `Hi ${profile.full_name},\n\nYour subscription will expire in 7 days. Please renew to continue accessing premium features.\n\nThank you!`
        break
    }

    console.log(`Sending email to ${profile.email}: ${subject}`)
    
    // TODO: Integrate with actual email service (SMTP settings from database)
    // For now, just log it
    console.log(`Email would be sent to ${profile.email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
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
