// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Email Configuration - Using Resend API (works with Supabase Edge Functions)
// You can get a free API key at https://resend.com
// Alternatively, configure your own domain with Resend to send from support@flashsnap.com.br
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const senderEmail = Deno.env.get('SMTP_SENDER_EMAIL') || 'onboarding@resend.dev'
const senderName = Deno.env.get('SMTP_SENDER_NAME') || 'Flash Snap'

console.info('Email Config:', { senderEmail, senderName, hasApiKey: !!RESEND_API_KEY })

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    email: string
    raw_user_meta_data?: {
      full_name?: string
    }
    created_at: string
  }
  schema: string
  old_record: null | Record<string, unknown>
}

/**
 * Generates the welcome email HTML content in Brazilian Portuguese
 */
function generateWelcomeEmailHTML(userName: string): string {
  const displayName = userName || 'usuário'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obrigado por se cadastrar!</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.7;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
    }
    .logo span {
      color: #f59e0b;
    }
    h1 {
      color: #1f2937;
      font-size: 22px;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .content p {
      margin-bottom: 16px;
      color: #4b5563;
    }
    .tip {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .tip strong {
      color: #4b5563;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Flash<span>Snap</span> ⚡</div>
    </div>
    
    <h1>Olá, ${displayName}!</h1>
    
    <div class="content">
      <p>
        Obrigado por criar sua conta no Flash Snap! Ficamos felizes em ter você por aqui.
      </p>
      
      <p>
        O app já está pronto para você usar. Crie seus flashcards, explore os templates 
        disponíveis e comece a estudar no seu ritmo.
      </p>
      
      
      <p>
        Se precisar de mais baralhos no futuro, temos uma opção Premium bem acessível. 
        Mas sem pressa — aproveite o app primeiro!
      </p>
      
      <p>
        Qualquer dúvida, é só responder este e-mail.
      </p>
      
      <p>Bons estudos!</p>
    </div>
    
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Flash Snap
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Generates the welcome email plain text content in Brazilian Portuguese
 */
function generateWelcomeEmailText(userName: string): string {
  const displayName = userName || 'usuário'

  return `Olá, ${displayName}!

Obrigado por criar sua conta no Flash Snap! Ficamos felizes em ter você por aqui.

O app já está pronto para você usar. Crie seus flashcards, explore os templates disponíveis e comece a estudar no seu ritmo.

Se precisar de mais baralhos no futuro, temos uma opção Premium bem acessível. Mas sem pressa — aproveite o app primeiro!

Qualquer dúvida, é só responder este e-mail.

Bons estudos!

---
© ${new Date().getFullYear()} Flash Snap
`
}

/**
 * Sends the welcome email using Resend API
 * Resend is compatible with Supabase Edge Functions (HTTP-based)
 * Get your API key at https://resend.com
 */
async function sendWelcomeEmail(
  toEmail: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  // Check if API key is set
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const htmlContent = generateWelcomeEmailHTML(userName)
    const textContent = generateWelcomeEmailText(userName)

    console.info(`Sending welcome email to ${toEmail}...`)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [toEmail],
        subject: 'Obrigado por se cadastrar no Flash Snap!',
        html: htmlContent,
        text: textContent
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }

    console.info(`Welcome email sent successfully to ${toEmail}, id: ${data.id}`)
    return { success: true }
  } catch (error) {
    console.error(`Failed to send welcome email to ${toEmail}:`, error)
    return { success: false, error: error?.message || String(error) }
  }
}

console.info('Welcome email edge function started')

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the webhook payload from Supabase Database Webhooks
    const payload: WebhookPayload = await req.json()

    console.info(`Received webhook: ${payload.type} on ${payload.table}`)

    // Only process INSERT events on the users table
    if (payload.type !== 'INSERT') {
      console.info('Ignoring non-INSERT event')
      return new Response(
        JSON.stringify({ message: 'Ignoring non-INSERT event' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { record } = payload

    if (!record.email) {
      console.error('No email in user record')
      return new Response(JSON.stringify({ error: 'No email in user record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract user name from metadata
    const userName = record.raw_user_meta_data?.full_name || ''

    // Send the welcome email
    const result = await sendWelcomeEmail(record.email, userName)

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Welcome email sent' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
