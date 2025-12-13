import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureReading {
  id: string;
  event: string | null;
  device_code: string | null;
  device_name?: string | null;
  moisture_machine: number | null;
  moisture_model: number | null;
  temperature: number | null;
  reading_time: string | null;
}

interface UseMoistureReadingsOptions {
  limit?: number;
}

export function useMoistureReadings(options: UseMoistureReadingsOptions = {}) {
  const { limit = 100 } = options;

  return useQuery({
    queryKey: ['moisture-readings', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moisture_meter_readings')
        .select('*')
        .order('reading_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching moisture readings:', error);
        throw error;
      }

      const readings = (data || []) as MoistureReading[];

      // map device_code -> display_name from device_settings
      const deviceCodes = [...new Set(readings.map((item) => item.device_code).filter(Boolean))] as string[];
      let nameMap: Record<string, string | null> = {};
      if (deviceCodes.length > 0) {
        const { data: deviceSettings, error: deviceError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', deviceCodes);

        if (deviceError) {
          console.error('Error fetching device settings for moisture readings:', deviceError);
        } else if (deviceSettings) {
          nameMap = deviceSettings.reduce(
            (acc, cur) => ({
              ...acc,
              [cur.device_code]: cur.display_name || cur.device_code,
            }),
            {} as Record<string, string | null>
          );
        }
      }

      return readings.map((item) => ({
        ...item,
        device_name: item.device_code ? nameMap[item.device_code] ?? item.device_code : null,
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto refetch every minute for MQTT data
  });
}
