import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureReading {
  id: string;
  device_code: string;
  event: string | null;
  moisture_machine: number | null;
  moisture_model: number | null;
  reading_time: string | null;
  created_at: string;
}

interface UseMoistureReadingsOptions {
  deviceCodes?: string[];
  limit?: number;
}

export function useMoistureReadings(options: UseMoistureReadingsOptions = {}) {
  const { deviceCodes, limit = 100 } = options;

  return useQuery({
    queryKey: ['moisture-readings', deviceCodes, limit],
    queryFn: async () => {
      let query = supabase
        .from('moisture_meter_readings')
        .select('*')
        .order('reading_time', { ascending: false })
        .limit(limit);

      if (deviceCodes && deviceCodes.length > 0) {
        query = query.in('device_code', deviceCodes);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching moisture readings:', error);
        throw error;
      }

      return (data || []) as MoistureReading[];
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto refetch every minute for MQTT data
  });
}
