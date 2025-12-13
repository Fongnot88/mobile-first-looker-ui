import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoistureMeterSetting {
  id: string;
  device_code: string;
  display_name: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMoistureMeterSettings() {
  return useQuery({
    queryKey: ['moisture-meter-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moisture_meter_settings')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching moisture meter settings:', error);
        throw error;
      }

      return (data || []) as MoistureMeterSetting[];
    },
    staleTime: 60000,
  });
}

export function useMoistureMeterSettingByDeviceCode(deviceCode: string) {
  return useQuery({
    queryKey: ['moisture-meter-settings', deviceCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moisture_meter_settings')
        .select('*')
        .eq('device_code', deviceCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching moisture meter setting:', error);
        throw error;
      }

      return data as MoistureMeterSetting | null;
    },
    staleTime: 60000,
    enabled: !!deviceCode,
  });
}
