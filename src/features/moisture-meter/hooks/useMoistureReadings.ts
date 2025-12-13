import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureReading {
  id: string;
  event: string | null;
  device_code: string | null;
  display_name?: string | null;
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
      // ดึงข้อมูล readings
      const { data: readings, error } = await supabase
        .from('moisture_meter_readings')
        .select('*')
        .order('reading_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching moisture readings:', error);
        throw error;
      }

      // ดึง display_name จาก moisture_meter_settings
      const deviceCodes = [...new Set((readings || []).map(r => r.device_code).filter(Boolean))];
      
      let settingsMap: Record<string, string> = {};
      if (deviceCodes.length > 0) {
        const { data: settings } = await supabase
          .from('moisture_meter_settings')
          .select('device_code, display_name')
          .in('device_code', deviceCodes);
        
        if (settings) {
          settingsMap = settings.reduce((acc, s) => {
            if (s.device_code) {
              acc[s.device_code] = s.display_name || s.device_code;
            }
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // รวม display_name เข้ากับ readings
      return (readings || []).map((item) => ({
        ...item,
        display_name: settingsMap[item.device_code || ''] || item.device_code || null,
      })) as MoistureReading[];
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto refetch every minute for MQTT data
  });
}
