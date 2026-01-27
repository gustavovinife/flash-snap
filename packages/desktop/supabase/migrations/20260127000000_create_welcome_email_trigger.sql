-- Migration: Create webhook trigger for welcome emails on new user signup
-- This trigger calls the send-welcome-email edge function when a new user is created

-- Create the http extension if not exists (required for pg_net)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function to call the edge function via HTTP
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
  supabase_url text;
  service_role_key text;
BEGIN
  -- Get the Supabase URL and service role key from vault or environment
  -- Note: In production, you should use Supabase Vault to store secrets
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Build the payload matching the WebhookPayload interface
  payload := json_build_object(
    'type', 'INSERT',
    'table', 'users',
    'schema', 'auth',
    'record', json_build_object(
      'id', NEW.id::text,
      'email', NEW.email,
      'raw_user_meta_data', NEW.raw_user_meta_data,
      'created_at', NEW.created_at::text
    ),
    'old_record', NULL
  );

  -- Call the edge function asynchronously using pg_net
  -- This allows the trigger to complete without waiting for the email to send
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload::jsonb
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
-- Note: This requires enabling the trigger on the auth schema which may need
-- to be done via Supabase Dashboard > Database > Webhooks instead
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome_email ON auth.users;

CREATE TRIGGER on_auth_user_created_send_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.send_welcome_email_on_signup() TO postgres, service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.send_welcome_email_on_signup() IS 
'Trigger function that sends a welcome email to new users via the send-welcome-email edge function';
