-- Create table for moisture meter readings from MQTT
CREATE TABLE public.moisture_meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_code TEXT NOT NULL,
  event TEXT,
  moisture_machine NUMERIC,
  moisture_model NUMERIC,
  reading_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moisture_meter_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Guests can view moisture readings for enabled devices"
ON public.moisture_meter_readings
FOR SELECT
USING (device_code IN (SELECT device_code FROM guest_device_access WHERE enabled = true));

CREATE POLICY "Authenticated users can view their device readings"
ON public.moisture_meter_readings
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    device_code IN (SELECT device_code FROM user_device_access WHERE user_id = auth.uid())
    OR is_admin_or_superadmin_safe(auth.uid())
  )
);

CREATE POLICY "System can insert moisture readings"
ON public.moisture_meter_readings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage moisture readings"
ON public.moisture_meter_readings
FOR ALL
USING (is_admin_or_superadmin_safe(auth.uid()))
WITH CHECK (is_admin_or_superadmin_safe(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_moisture_readings_device_code ON public.moisture_meter_readings(device_code);
CREATE INDEX idx_moisture_readings_time ON public.moisture_meter_readings(reading_time DESC);