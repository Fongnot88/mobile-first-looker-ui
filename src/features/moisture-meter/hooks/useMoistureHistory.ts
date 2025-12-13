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
  timeFrame?: MoistureTimeFrame;
}

export type MoistureTimeFrame = '5m' | '15m' | '30m' | '1h' | '24h' | '7d' | '30d';

const getTimeFrameMinutes = (frame: MoistureTimeFrame): number => {
  switch (frame) {
    case '5m':
      return 5;
    case '15m':
      return 15;
    case '30m':
      return 30;
    case '1h':
      return 60;
    case '24h':
      return 24 * 60;
    case '7d':
      return 24 * 7 * 60;
    case '30d':
      return 24 * 30 * 60;
    default:
      return 24 * 60;
  }
};

export function useMoistureHistory(deviceCode: string, options: UseMoistureHistoryOptions = {}) {
  const { limit = 50, timeFrame } = options;

  return useQuery({
    queryKey: ['moisture-history', deviceCode, limit, timeFrame],
    queryFn: async () => {
      const query = supabase
        .from('moisture_meter_readings')
        .select('id, moisture_machine, moisture_model, temperature, reading_time')
        .eq('device_code', deviceCode)
        .order('reading_time', { ascending: true });

      if (timeFrame) {
        const minutes = getTimeFrameMinutes(timeFrame);
        const cutoffDate = new Date();
        cutoffDate.setMinutes(cutoffDate.getMinutes() - minutes);
        query.gte('reading_time', cutoffDate.toISOString());
      } else {
        query.limit(limit);
      }

      const { data, error } = await query;

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
