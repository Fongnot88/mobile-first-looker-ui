-- Create table for moisture meter notifications
CREATE TABLE public.moisture_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_code TEXT NOT NULL,
  threshold_type TEXT NOT NULL, -- 'moisture_min', 'moisture_max', 'temperature_min', 'temperature_max'
  value NUMERIC NOT NULL,
  notification_message TEXT,
  notification_count INTEGER NOT NULL DEFAULT 1,
  reading_id UUID REFERENCES public.moisture_meter_readings(id),
  settings_snapshot JSONB,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moisture_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own moisture notifications"
ON public.moisture_notifications
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all moisture notifications"
ON public.moisture_notifications
FOR SELECT
USING (is_admin_or_superadmin_safe(auth.uid()));

-- Admins can manage all notifications
CREATE POLICY "Admins can manage moisture notifications"
ON public.moisture_notifications
FOR ALL
USING (is_admin_or_superadmin_safe(auth.uid()))
WITH CHECK (is_admin_or_superadmin_safe(auth.uid()));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own moisture notifications"
ON public.moisture_notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own moisture notifications"
ON public.moisture_notifications
FOR DELETE
USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert moisture notifications"
ON public.moisture_notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_moisture_notifications_user_id ON public.moisture_notifications(user_id);
CREATE INDEX idx_moisture_notifications_device_code ON public.moisture_notifications(device_code);
CREATE INDEX idx_moisture_notifications_timestamp ON public.moisture_notifications(timestamp DESC);