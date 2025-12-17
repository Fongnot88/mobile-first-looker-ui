import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface NotificationStatus {
  hasSettings: boolean;
  isTriggered: boolean;
  triggeredSettings: Array<{
    rice_type_id: string;
    threshold_type: 'min' | 'max';
    threshold: number;
    currentValue: number;
  }>;
}

export const useNotificationStatus = (deviceCode: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['notification-status', deviceCode, user?.id],
    queryFn: async (): Promise<NotificationStatus> => {
      if (!user?.id) {
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      // ดึงการตั้งค่าแจ้งเตือนเฉพาะของผู้ใช้ปัจจุบันสำหรับเครื่องนี้
      const { data: settings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('device_code', deviceCode)
        .eq('enabled', true)
        .eq('user_id', user.id);

      if (settingsError) {
        console.error('Error fetching notification settings:', settingsError);
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      if (!settings || settings.length === 0) {
        return { hasSettings: false, isTriggered: false, triggeredSettings: [] };
      }

      // การตั้งค่าของผู้ใช้ปัจจุบัน (จาก Query แล้ว)
      const userSettings = settings;

      // ดึงข้อมูลล่าสุดของเครื่อง
      const { data: latestData, error: dataError } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (dataError || !latestData || latestData.length === 0) {
        console.error('Error fetching latest device data:', dataError);
        return { hasSettings: userSettings.length > 0, isTriggered: false, triggeredSettings: [] };
      }

      const latestMeasurement = latestData[0];
      const triggeredSettings: NotificationStatus['triggeredSettings'] = [];

      // ตรวจสอบแต่ละการตั้งค่าของ user ปัจจุบันว่าเข้าเงื่อนไขหรือไม่
      for (const setting of userSettings) {
        // แปลง rice_type_id เป็น column name ในตาราง
        const columnMapping: { [key: string]: string } = {
          'whiteness': 'whiteness',
          'yellow_rice_ratio': 'yellow_rice_rate',
          'head_rice': 'head_rice',
          'whole_kernels': 'whole_kernels',
          'total_brokens': 'total_brokens',
          'small_brokens': 'small_brokens',
          'class1': 'class1',
          'class2': 'class2',
          'class3': 'class3',
          'broken_rice': 'total_brokens',
          'chalky_rice': 'heavy_chalkiness_rate',
          'paddy_rate': 'paddy_rate',
          'red_rice': 'red_line_rate',
          'parboiled_rice': 'parboiled_white_rice',
          'glutinous_rice': 'sticky_rice_rate'
        };

        const columnName = columnMapping[setting.rice_type_id];
        if (!columnName) continue;

        const currentValue = (latestMeasurement as any)[columnName];
        if (currentValue === null || currentValue === undefined) continue;

        // ตรวจสอบเกณฑ์ต่ำสุด
        if (setting.min_enabled && currentValue < setting.min_threshold) {
          triggeredSettings.push({
            rice_type_id: setting.rice_type_id,
            threshold_type: 'min' as const,
            threshold: setting.min_threshold,
            currentValue
          });
        }

        // ตรวจสอบเกณฑ์สูงสุด
        if (setting.max_enabled && currentValue > setting.max_threshold) {
          triggeredSettings.push({
            rice_type_id: setting.rice_type_id,
            threshold_type: 'max' as const,
            threshold: setting.max_threshold,
            currentValue
          });
        }
      }

      return {
        hasSettings: userSettings.length > 0, // แสดง icon เฉพาะเมื่อผู้ใช้ปัจจุบันมีการตั้งค่า
        isTriggered: triggeredSettings.length > 0, // trigger เฉพาะของ user ปัจจุบัน
        triggeredSettings
      };
    },
    enabled: !!user?.id && !!deviceCode,
    staleTime: 30000, // 30 วินาที
    refetchInterval: 60000, // รีเฟรชทุก 1 นาที
    refetchOnMount: 'always', // เข้าเพจแล้วดึงใหม่เสมอ เพื่อลดโอกาสแคชค้าง
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Subscribe to realtime changes for immediate UI update
export const useNotificationStatusRealtime = (deviceCode: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id || !deviceCode) return;

    const channel = supabase
      .channel(`notification-settings-${user.id}-${deviceCode}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT | UPDATE | DELETE
          schema: 'public',
          table: 'notification_settings',
        },
        (payload) => {
          const row: any = payload.new ?? payload.old;
          if (!row) return;
          if (row.user_id === user.id && row.device_code === deviceCode) {
            queryClient.invalidateQueries({ queryKey: ['notification-status', deviceCode, user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user?.id, deviceCode, queryClient]);
};