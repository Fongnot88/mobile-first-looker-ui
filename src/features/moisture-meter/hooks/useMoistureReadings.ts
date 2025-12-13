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

      // ใช้ device_name จากตาราง moisture_meter_readings โดยตรง และ fallback เป็น device_code หากไม่มี
      return readings.map((item) => ({
        ...item,
        device_name: item.device_name ?? item.device_code ?? null,
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto refetch every minute for MQTT data
  });
}
