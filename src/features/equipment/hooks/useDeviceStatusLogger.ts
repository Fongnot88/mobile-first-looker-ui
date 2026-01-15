import { useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogStatusChangeParams {
  device_code: string;
  display_name?: string;
  device_type: 'rice_quality' | 'moisture_meter';
  previous_status: 'online' | 'offline';
  new_status: 'online' | 'offline';
  last_data_time?: string | null;
}

async function logStatusChange(params: LogStatusChangeParams) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const { error } = await supabase
      .from('device_status_logs')
      .insert({
        device_code: params.device_code,
        display_name: params.display_name || null,
        device_type: params.device_type,
        previous_status: params.previous_status,
        new_status: params.new_status,
        last_data_time: params.last_data_time ? new Date(params.last_data_time).toISOString() : null,
        detected_by_user: userId,
      });

    if (error) {
      console.error('❌ Failed to log device status change:', error);
    } else {
      console.log(`📝 Device status logged: ${params.device_code} (${params.display_name || 'N/A'}) ${params.previous_status} → ${params.new_status}`);
    }
  } catch (err) {
    console.error('❌ Error logging device status:', err);
  }
}

/**
 * Hook สำหรับบันทึก log เมื่อสถานะอุปกรณ์เปลี่ยน (online ↔ offline)
 * @param deviceCode รหัสอุปกรณ์
 * @param displayName ชื่อแสดงผลของอุปกรณ์
 * @param isRecent สถานะปัจจุบัน (true = online/เขียว, false = offline/แดง)
 * @param deviceType ประเภทอุปกรณ์
 * @param lastDataTime เวลาข้อมูลล่าสุด
 */
export function useDeviceStatusLogger(
  deviceCode: string,
  displayName: string | undefined,
  isRecent: boolean,
  deviceType: 'rice_quality' | 'moisture_meter',
  lastDataTime?: string | null
) {
  const previousStatusRef = useRef<boolean | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // ข้ามการบันทึกครั้งแรก (initial render) - รอจนกว่าจะมีค่าแรก
    if (!isInitializedRef.current) {
      previousStatusRef.current = isRecent;
      isInitializedRef.current = true;
      console.log(`📊 Device ${deviceCode} initialized with status: ${isRecent ? 'online' : 'offline'}`);
      return;
    }

    // ตรวจสอบว่าสถานะเปลี่ยนหรือไม่
    if (previousStatusRef.current !== isRecent) {
      const previousStatus = previousStatusRef.current ? 'online' : 'offline';
      const newStatus = isRecent ? 'online' : 'offline';
      
      console.log(`🔄 Device ${deviceCode} status changed: ${previousStatus} → ${newStatus}`);
      
      // บันทึก log
      logStatusChange({
        device_code: deviceCode,
        display_name: displayName,
        device_type: deviceType,
        previous_status: previousStatus as 'online' | 'offline',
        new_status: newStatus as 'online' | 'offline',
        last_data_time: lastDataTime,
      });

      previousStatusRef.current = isRecent;
    }
  }, [isRecent, deviceCode, displayName, deviceType, lastDataTime]);
}
