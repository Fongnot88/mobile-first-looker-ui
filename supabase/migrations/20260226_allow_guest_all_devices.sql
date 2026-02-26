-- Migration: Allow guest users to view all rice quality analysis data
-- This removes the restriction that only allowed guest access to specific devices

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Public can view rice quality data for guest-enabled devices or shared links" ON rice_quality_analysis;

-- Create new policy that allows all users (including guests/anon) to view all data
CREATE POLICY "Public can view all rice quality data" 
ON rice_quality_analysis FOR SELECT TO anon, authenticated
USING (true);

-- Note: The policy for authenticated users with device-specific access 
-- is still handled by the existing "Users can view data for accessible devices" policy
-- which checks user_device_access table

-- Comment describing the change
COMMENT ON POLICY "Public can view all rice quality data" ON rice_quality_analysis IS 
'Allows all users (including unauthenticated guests) to view all rice quality analysis data without restriction';