// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { adminClient, corsHeaders, getCaller, json, returnUrl } from '../_shared/stripeAuth.ts'

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-12-18.acacia'
})

console.info('Create portal session server started')

interface CreatePortalRequest {
  customerId?: string
  returnUrl?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const user = await getCaller(req)
    if (!user) {
      return json({ error: 'You need to be signed in to manage your subscription.' }, 401)
    }

    const { customerId, returnUrl: requestedReturnUrl }: CreatePortalRequest = await req.json()

    // The customer always comes from the caller's own subscription, never from the request
    const { data: subscription, error } = await adminClient()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      throw error
    }
    if (!subscription?.stripe_customer_id) {
      return json({ error: 'No subscription found for this account.' }, 404)
    }
    if (customerId && customerId !== subscription.stripe_customer_id) {
      return json({ error: 'You can only manage your own subscription.' }, 403)
    }

    console.info(`Creating portal session for user ${user.id}`)

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl(requestedReturnUrl, { portal: 'closed' })
    })

    console.info(`Portal session created: ${session.id}`)

    return json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: 'Failed to create portal session', details: errorMessage }, 500)
  }
})
