-- Drop all cur_material auto-fill related functions
-- These functions are no longer needed as the auto-fill feature has been disabled

-- Drop the trigger function first (if it wasn't fully dropped before)
DROP FUNCTION IF EXISTS public.auto_fill_cur_material() CASCADE;

-- Drop the get latest function
DROP FUNCTION IF EXISTS public.get_latest_cur_material(text) CASCADE;

-- Drop the backfill functions
DROP FUNCTION IF EXISTS public.backfill_cur_material_for_device(text) CASCADE;
DROP FUNCTION IF EXISTS public.backfill_all_cur_material() CASCADE;