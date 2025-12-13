import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestMoistureReading {
  id: string;
  device_code: string | null;
  moisture_machine: number | null;
  moisture_model: number | null;
  temperature: number | null;
  reading_time: string | null;
  display_name?: string | null;
}

export function useLatestMoistureReading(deviceCode: string) {
  return useQuery({
    queryKey: ['moisture-reading-latest', deviceCode],
    queryFn: async () => {
      // Get latest reading for this device
      const { data: reading, error } = await supabase
        .from('moisture_meter_readings')
        .select('*')
        .eq('device_code', deviceCode)
        .order('reading_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching latest moisture reading:', error);
        throw error;
      }

      if (!reading) return null;

      // Get display_name from settings
      const { data: settings } = await supabase
        .from('moisture_meter_settings')
        .select('display_name')
        .eq('device_code', deviceCode)
        .maybeSingle();

      return {
        ...reading,
        display_name: settings?.display_name || deviceCode,
      } as LatestMoistureReading;
    },
    staleTime: 30000,
    refetchInterval: 60000,
    enabled: !!deviceCode,
  });
}
