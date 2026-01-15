-- สร้างตาราง device_status_logs สำหรับเก็บประวัติการเปลี่ยนสถานะอุปกรณ์
CREATE TABLE public.device_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code TEXT NOT NULL,
  display_name TEXT,
  device_type TEXT NOT NULL CHECK (device_type IN ('rice_quality', 'moisture_meter')),
  previous_status TEXT NOT NULL CHECK (previous_status IN ('online', 'offline')),
  new_status TEXT NOT NULL CHECK (new_status IN ('online', 'offline')),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_data_time TIMESTAMPTZ,
  detected_by_user UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index สำหรับ query ที่เร็วขึ้น
CREATE INDEX idx_device_status_logs_device_code ON public.device_status_logs(device_code);
CREATE INDEX idx_device_status_logs_status_changed_at ON public.device_status_logs(status_changed_at DESC);
CREATE INDEX idx_device_status_logs_device_type ON public.device_status_logs(device_type);
CREATE INDEX idx_device_status_logs_new_status ON public.device_status_logs(new_status);

-- Enable RLS
ALTER TABLE public.device_status_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view logs
CREATE POLICY "Allow authenticated users to view device status logs"
ON public.device_status_logs FOR SELECT TO authenticated
USING (true);

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert device status logs"
ON public.device_status_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow anon users to view logs (for guest access)
CREATE POLICY "Allow anon users to view device status logs"
ON public.device_status_logs FOR SELECT TO anon
USING (true);

-- Allow anon users to insert logs (for guest access)
CREATE POLICY "Allow anon users to insert device status logs"
ON public.device_status_logs FOR INSERT TO anon
WITH CHECK (true);