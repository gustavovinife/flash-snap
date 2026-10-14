import { createClient, type User } from 'jsr:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

/** The signed-in user making the request, from the Authorization header. */
export async function getCaller(req: Request): Promise<User | null> {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  })
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}

const DEFAULT_RETURN_URL = 'flash-snap://subscription-callback'

// Stripe may only send people back to Flash Snap's own apps and site
const ALLOWED_RETURN_PREFIXES = [
  'flash-snap://',
  'flashsnap://',
  'exp://',
  'https://www.flashsnap.com.br/',
  'https://flashsnap.com.br/',
  'http://localhost:'
]

/** The client's return URL with extra query params, or the desktop deep link when it isn't allowed. */
export function returnUrl(requested: unknown, params: Record<string, string>): string {
  const base =
    typeof requested === 'string' && ALLOWED_RETURN_PREFIXES.some((prefix) => requested.startsWith(prefix))
      ? requested
      : DEFAULT_RETURN_URL
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}
