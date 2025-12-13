-- Create moisture notification settings table
CREATE TABLE public.moisture_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_code TEXT NOT NULL,
  
  -- Master enable switch
  enabled BOOLEAN DEFAULT true,
  
  -- Moisture thresholds
  moisture_enabled BOOLEAN DEFAULT true,
  moisture_min_enabled BOOLEAN DEFAULT true,
  moisture_max_enabled BOOLEAN DEFAULT true,
  moisture_min_threshold NUMERIC DEFAULT 10,
  moisture_max_threshold NUMERIC DEFAULT 20,
  
  -- Temperature thresholds
  temperature_enabled BOOLEAN DEFAULT true,
  temperature_min_enabled BOOLEAN DEFAULT true,
  temperature_max_enabled BOOLEAN DEFAULT true,
  temperature_min_threshold NUMERIC DEFAULT 20,
  temperature_max_threshold NUMERIC DEFAULT 40,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint per user per device
  UNIQUE(user_id, device_code)
);

-- Enable RLS
ALTER TABLE public.moisture_notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view their own moisture notification settings"
ON public.moisture_notification_settings
FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own settings
CREATE POLICY "Users can create their own moisture notification settings"
ON public.moisture_notification_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "Users can update their own moisture notification settings"
ON public.moisture_notification_settings
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own settings
CREATE POLICY "Users can delete their own moisture notification settings"
ON public.moisture_notification_settings
FOR DELETE
USING (user_id = auth.uid());

-- Admins can view all settings
CREATE POLICY "Admins can view all moisture notification settings"
ON public.moisture_notification_settings
FOR SELECT
USING (is_admin_or_superadmin_safe(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_moisture_notification_settings_updated_at
BEFORE UPDATE ON public.moisture_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();