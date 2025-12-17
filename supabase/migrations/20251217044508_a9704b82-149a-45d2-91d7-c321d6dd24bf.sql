-- Add new column machine_unix_time_minus_1h
ALTER TABLE public.rice_quality_analysis 
ADD COLUMN machine_unix_time_minus_1h timestamp without time zone;

-- Create function to calculate machine_unix_time_minus_1h
CREATE OR REPLACE FUNCTION public.update_machine_time_minus_1h()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Set machine_unix_time_minus_1h to machine_unix_time - 1 hour
    IF NEW.machine_unix_time IS NOT NULL THEN
        NEW.machine_unix_time_minus_1h := NEW.machine_unix_time - INTERVAL '1 hour';
    END IF;
    RETURN NEW;
END;
$function$;

-- Create trigger to auto-calculate on insert/update
CREATE TRIGGER trigger_update_machine_time_minus_1h
BEFORE INSERT OR UPDATE ON public.rice_quality_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_machine_time_minus_1h();

-- Backfill existing data
UPDATE public.rice_quality_analysis 
SET machine_unix_time_minus_1h = machine_unix_time - INTERVAL '1 hour'
WHERE machine_unix_time IS NOT NULL;