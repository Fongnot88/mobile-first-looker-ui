-- Add device_code and temperature columns to moisture_meter_readings table
ALTER TABLE public.moisture_meter_readings 
ADD COLUMN device_code text,
ADD COLUMN temperature numeric;