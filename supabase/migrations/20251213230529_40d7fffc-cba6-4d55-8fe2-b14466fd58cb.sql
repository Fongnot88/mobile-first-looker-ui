-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call edge function when moisture reading is inserted
CREATE OR REPLACE FUNCTION public.trigger_check_moisture_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
BEGIN
  -- Get Supabase URL and anon key from environment
  project_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- If settings are not available, use hardcoded values (will be replaced by Lovable)
  IF project_url IS NULL OR project_url = '' THEN
    project_url := 'https://kpimycfhkgwnmsmfyhxe.supabase.co';
  END IF;
  
  IF anon_key IS NULL OR anon_key = '' THEN
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwaW15Y2Zoa2d3bm1zbWZ5aHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjY1NjgsImV4cCI6MjA1MjAwMjU2OH0.p0TFlCPQGPCTwn_xUG_1-gH02vSLnQKoJ4A3y27B9RA';
  END IF;

  -- Log trigger activation
  RAISE NOTICE 'Moisture reading trigger fired for device: %', NEW.device_code;
  
  -- Call edge function asynchronously using pg_net
  BEGIN
    PERFORM net.http_post(
      url := project_url || '/functions/v1/check_moisture_notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'deviceCode', NEW.device_code,
        'triggerType', 'auto'
      )
    );
    RAISE NOTICE 'Edge function call initiated for device: %', NEW.device_code;
  EXCEPTION WHEN OTHERS THEN
    -- Don't block the insert if edge function call fails
    RAISE WARNING 'Failed to call moisture notification edge function: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger on moisture_meter_readings table
DROP TRIGGER IF EXISTS trigger_moisture_notification_check ON moisture_meter_readings;

CREATE TRIGGER trigger_moisture_notification_check
AFTER INSERT ON moisture_meter_readings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_check_moisture_notifications();

-- Add comment for documentation
COMMENT ON FUNCTION public.trigger_check_moisture_notifications() IS 
'Automatically calls check_moisture_notifications edge function when new moisture readings are inserted';