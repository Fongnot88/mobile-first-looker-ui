import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureHistoryReading {
  id: string;
  moisture_machine: number | null;
  moisture_model: number | null;
  temperature: number | null;
  reading_time: string | null;
}

interface UseMoistureHistoryOptions {
  limit?: number;
}

export function useMoistureHistory(deviceCode: string, options: UseMoistureHistoryOptions = {}) {
  const { limit = 50 } = options;

  return useQuery({
    queryKey: ['moisture-history', deviceCode, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moisture_meter_readings')
        .select('id, moisture_machine, moisture_model, temperature, reading_time')
        .eq('device_code', deviceCode)
        .order('reading_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching moisture history:', error);
        throw error;
      }

      return (data || []) as MoistureHistoryReading[];
    },
    staleTime: 60000,
    refetchInterval: 120000,
    enabled: !!deviceCode,
  });
}
