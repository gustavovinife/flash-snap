-- Web push reminders: per-user schedule plus each browser's push subscription.
-- The send-reminders Edge Function reads these with the service role.

CREATE TABLE IF NOT EXISTS public.reminder_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  hour smallint NOT NULL DEFAULT 9 CHECK (hour BETWEEN 0 AND 23),
  -- The cron job runs every 15 minutes
  minute smallint NOT NULL DEFAULT 0 CHECK (minute IN (0, 15, 30, 45)),
  timezone text NOT NULL DEFAULT 'UTC',
  language text NOT NULL DEFAULT 'en-US',
  streak_nudge boolean NOT NULL DEFAULT true,
  -- Local dates of the last reminders, so each goes out at most once a day
  last_daily_sent date,
  last_streak_sent date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can read their reminder settings" ON public.reminder_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can create their reminder settings" ON public.reminder_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can update their reminder settings" ON public.reminder_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can read their push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their push subscriptions" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- A browser has one subscription; when another account enables reminders on the same browser,
-- the subscription moves to that account (RLS alone would block updating the other user's row)
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.push_subscriptions (endpoint, user_id, p256dh, auth, user_agent)
  SELECT p_endpoint, auth.uid(), p_p256dh, p_auth, p_user_agent
  WHERE auth.uid() IS NOT NULL
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
$$;

REVOKE ALL ON FUNCTION public.save_push_subscription(text, text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(text, text, text, text) TO authenticated;
