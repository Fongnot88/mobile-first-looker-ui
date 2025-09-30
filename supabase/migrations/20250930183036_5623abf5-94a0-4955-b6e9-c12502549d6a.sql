-- Function to get latest non-null/non-empty cur_material for a device
CREATE OR REPLACE FUNCTION get_latest_cur_material(device_code_param text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  latest_material text;
BEGIN
  -- Find latest cur_material that is not null and not empty
  SELECT cur_material INTO latest_material
  FROM rice_quality_analysis 
  WHERE device_code = device_code_param 
    AND cur_material IS NOT NULL 
    AND TRIM(cur_material) != ''
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_material, '');
END;
$$;

-- Trigger function to auto-fill cur_material when null/empty
CREATE OR REPLACE FUNCTION auto_fill_cur_material()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  latest_material text;
BEGIN
  -- Check if cur_material is null or empty string
  IF NEW.cur_material IS NULL OR TRIM(NEW.cur_material) = '' THEN
    -- Find latest cur_material from same device (excluding current record)
    SELECT cur_material INTO latest_material
    FROM rice_quality_analysis 
    WHERE device_code = NEW.device_code 
      AND cur_material IS NOT NULL 
      AND TRIM(cur_material) != ''
      AND id != COALESCE(NEW.id, 0)
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
    
    -- If found, use it to fill the new record
    IF latest_material IS NOT NULL AND TRIM(latest_material) != '' THEN
      NEW.cur_material := latest_material;
      RAISE NOTICE 'Auto-filled cur_material for device % with value: %', NEW.device_code, latest_material;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_fill_cur_material ON rice_quality_analysis;

-- Create trigger on rice_quality_analysis table
CREATE TRIGGER trigger_auto_fill_cur_material
  BEFORE INSERT OR UPDATE ON rice_quality_analysis
  FOR EACH ROW
  EXECUTE FUNCTION auto_fill_cur_material();

-- Function to backfill cur_material for a specific device
CREATE OR REPLACE FUNCTION backfill_cur_material_for_device(device_code_param text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  updated_count integer := 0;
  rec RECORD;
  latest_material text := '';
BEGIN
  -- Loop through all records for this device ordered by time
  FOR rec IN 
    SELECT id, cur_material, created_at
    FROM rice_quality_analysis 
    WHERE device_code = device_code_param 
    ORDER BY created_at ASC, id ASC
  LOOP
    -- If we find a non-null/non-empty value, keep it
    IF rec.cur_material IS NOT NULL AND TRIM(rec.cur_material) != '' THEN
      latest_material := rec.cur_material;
    -- If null/empty and we have a latest value, update it
    ELSIF latest_material != '' AND (rec.cur_material IS NULL OR TRIM(rec.cur_material) = '') THEN
      UPDATE rice_quality_analysis 
      SET cur_material = latest_material 
      WHERE id = rec.id;
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$;

-- Function to backfill cur_material for all devices
CREATE OR REPLACE FUNCTION backfill_all_cur_material()
RETURNS TABLE(device_code text, updated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  device_rec RECORD;
  count_result integer;
BEGIN
  -- Loop through all distinct devices
  FOR device_rec IN 
    SELECT DISTINCT rqa.device_code
    FROM rice_quality_analysis rqa
    WHERE rqa.device_code IS NOT NULL
    ORDER BY rqa.device_code
  LOOP
    -- Backfill data for each device
    SELECT backfill_cur_material_for_device(device_rec.device_code) INTO count_result;
    
    -- Return results
    device_code := device_rec.device_code;
    updated_count := count_result;
    RETURN NEXT;
  END LOOP;
END;
$$;