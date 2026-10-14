// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@17.7.0'
import { corsHeaders, getCaller, json, returnUrl } from '../_shared/stripeAuth.ts'

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-12-18.acacia'
})

console.info('Create checkout session server started')

interface CreateCheckoutRequest {
  priceId: string
  userId?: string
  userEmail?: string
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
    if (!user?.email) {
      return json({ error: 'You need to be signed in to upgrade.' }, 401)
    }

    const { priceId, userId, returnUrl: requestedReturnUrl }: CreateCheckoutRequest = await req.json()

    if (!priceId) {
      return json({ error: 'priceId is required' }, 400)
    }

    // Older clients also send userId; it must belong to the caller
    if (userId && userId !== user.id) {
      return json({ error: 'You can only upgrade your own account.' }, 403)
    }

    console.info(`Creating checkout session for user ${user.id} with price ${priceId}`)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: user.email,
      metadata: {
        user_id: user.id
      },
      success_url: returnUrl(requestedReturnUrl, { success: 'true' }),
      cancel_url: returnUrl(requestedReturnUrl, { canceled: 'true' })
    })

    console.info(`Checkout session created: ${session.id}`)

    return json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: 'Failed to create checkout session', details: errorMessage }, 500)
  }
})
