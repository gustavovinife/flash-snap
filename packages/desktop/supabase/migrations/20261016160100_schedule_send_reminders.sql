-- Calls the send-reminders Edge Function every 15 minutes.
-- The bearer token is the Vault secret 'send_reminders_cron_secret', which must match the function's
-- CRON_SECRET; create it once (outside version control) with:
--   select vault.create_secret('<random value>', 'send_reminders_cron_secret');
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-reminders';

SELECT cron.schedule(
  'send-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://svufbwjdrbmiyvhimutm.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'send_reminders_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
