-- สร้างตาราง moisture_meter_settings สำหรับจัดการการตั้งค่าเครื่องวัดความชื้น
CREATE TABLE public.moisture_meter_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code TEXT NOT NULL UNIQUE,
    display_name TEXT,
    location TEXT DEFAULT 'โรงงาน 1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moisture_meter_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Admins can manage all moisture meter settings
CREATE POLICY "Admins can manage moisture meter settings"
ON public.moisture_meter_settings
FOR ALL
USING (is_admin_or_superadmin_safe(auth.uid()))
WITH CHECK (is_admin_or_superadmin_safe(auth.uid()));

-- 2. Users can view settings for devices they have access to
CREATE POLICY "Users can view accessible moisture meter settings"
ON public.moisture_meter_settings
FOR SELECT
USING (
    device_code IN (
        SELECT uda.device_code 
        FROM user_device_access uda 
        WHERE uda.user_id = auth.uid()
    )
);

-- 3. Guest can view settings for enabled guest devices
CREATE POLICY "Guests can view enabled moisture meter settings"
ON public.moisture_meter_settings
FOR SELECT
USING (
    device_code IN (
        SELECT gda.device_code 
        FROM guest_device_access gda 
        WHERE gda.enabled = true
    )
);

-- Trigger สำหรับอัพเดท updated_at
CREATE TRIGGER update_moisture_meter_settings_updated_at
    BEFORE UPDATE ON public.moisture_meter_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ลบคอลัมน์ device_name ออกจาก moisture_meter_readings (ย้ายไปใช้จาก moisture_meter_settings แทน)
ALTER TABLE public.moisture_meter_readings DROP COLUMN IF EXISTS device_name;