-- Add SELECT policy for public access to moisture meter readings
CREATE POLICY "Allow public to view moisture readings"
ON public.moisture_meter_readings
FOR SELECT
USING (true);