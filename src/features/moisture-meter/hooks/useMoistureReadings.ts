import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureReading {
  id: string;
  event: string | null;
  moisture_machine: number | null;
  moisture_model: number | null;
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

      return (data || []) as MoistureReading[];
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto refetch every minute for MQTT data
  });
}
