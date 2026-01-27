# Welcome Email Setup Guide

This guide explains how to set up the welcome email edge function that sends a thank-you email to new users in Brazilian Portuguese.

## Overview

When a new user signs up for Flash Snap, they receive a welcome email that:
- Thanks them for joining
- Explains the key features of the app
- Mentions the Premium license for users who need more decks
- Uses Locaweb SMTP (support@flashsnap.com.br)

## Files Created

```
supabase/
├── functions/
│   └── send-welcome-email/
│       ├── index.ts        # Edge function code
│       ├── deno.json       # Deno configuration
│       └── .npmrc          # NPM configuration
└── migrations/
    └── 20260127000000_create_welcome_email_trigger.sql  # Database trigger
```

## Setup Instructions

### Option 1: Using Supabase Database Webhooks (Recommended)

This is the easiest approach for production:

1. **Deploy the Edge Function**
   ```bash
   cd packages/desktop
   supabase functions deploy send-welcome-email
   ```

2. **Set Environment Variables**
   
   Go to Supabase Dashboard > Edge Functions > send-welcome-email > Secrets and add:
   
   | Secret Name | Value | Description |
   |-------------|-------|-------------|
   | `SMTP_HOST` | `smtp.locaweb.com.br` | Locaweb SMTP server |
   | `SMTP_PORT` | `587` | SMTP port with TLS |
   | `SMTP_USER` | `support@flashsnap.com.br` | SMTP username |
   | `SMTP_PASS` | `your_password` | SMTP password |
   | `SMTP_SENDER_EMAIL` | `support@flashsnap.com.br` | From address |
   | `SMTP_SENDER_NAME` | `Flash Snap` | From name |

3. **Create Database Webhook**
   
   Go to Supabase Dashboard > Database > Webhooks > Create Webhook:
   
   - **Name**: `send-welcome-email`
   - **Table**: `auth.users`
   - **Events**: `INSERT`
   - **Type**: `Supabase Edge Function`
   - **Edge Function**: `send-welcome-email`
   - **HTTP Headers**: None needed (handled internally)

### Option 2: Using Database Trigger

If you prefer using a database trigger:

1. **Deploy the Edge Function** (same as Option 1)

2. **Set Environment Variables** (same as Option 1)

3. **Run the Migration**
   ```bash
   cd packages/desktop
   supabase db push
   ```

4. **Configure App Settings**
   
   You need to set the `app.settings` in your database:
   ```sql
   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
   ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
   ```
   
   ⚠️ **Security Note**: Storing the service role key in database settings is not recommended for production. Use Option 1 (Database Webhooks) instead.

## Testing Locally

1. **Start Supabase locally**
   ```bash
   cd packages/desktop
   supabase start
   ```

2. **Serve the edge function**
   ```bash
   supabase functions serve send-welcome-email --env-file .env.local
   ```

3. **Create a `.env.local` file** with your SMTP credentials:
   ```env
   SMTP_HOST=smtp.locaweb.com.br
   SMTP_PORT=587
   SMTP_USER=support@flashsnap.com.br
   SMTP_PASS=your_password_here
   SMTP_SENDER_EMAIL=support@flashsnap.com.br
   SMTP_SENDER_NAME=Flash Snap
   ```

4. **Test the function**
   ```bash
   curl -X POST http://localhost:54321/functions/v1/send-welcome-email \
     -H "Content-Type: application/json" \
     -d '{
       "type": "INSERT",
       "table": "users",
       "schema": "auth",
       "record": {
         "id": "test-123",
         "email": "test@example.com",
         "raw_user_meta_data": {"full_name": "Test User"},
         "created_at": "2026-01-27T00:00:00Z"
       },
       "old_record": null
     }'
   ```

## Email Content

The welcome email is sent in **Brazilian Portuguese** and includes:

- A warm welcome greeting
- Explanation of Flash Snap's spaced repetition features
- List of free tier features (3 decks, templates, SM-2 algorithm, TTS)
- Promotion of the Premium license (R$ 9,90/mês) for unlimited decks
- Professional HTML design with fallback plain text

## Troubleshooting

### Email not sending
- Check SMTP credentials in Supabase Edge Function secrets
- Verify Locaweb SMTP settings (host, port, TLS)
- Check edge function logs in Supabase Dashboard

### Webhook not triggering
- Ensure the webhook is enabled in Database > Webhooks
- Check that the `auth.users` table is selected
- Verify INSERT event is checked

### Database trigger not working
- Check if `pg_net` extension is installed
- Verify `app.settings` are properly configured
- Check PostgreSQL logs for errors

## Locaweb SMTP Settings

| Setting | Value |
|---------|-------|
| Server | smtp.locaweb.com.br |
| Port | 587 (TLS) or 465 (SSL) |
| Authentication | Required |
| Username | Your email (support@flashsnap.com.br) |
| Password | Your email password |

## Support

If you have issues with the welcome email system, check:
1. Supabase Edge Function logs
2. Database webhook logs
3. Locaweb SMTP service status
