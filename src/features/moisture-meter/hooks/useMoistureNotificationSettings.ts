import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface MoistureNotificationSettings {
  id: string;
  user_id: string;
  device_code: string;
  enabled: boolean;
  moisture_enabled: boolean;
  moisture_min_enabled: boolean;
  moisture_max_enabled: boolean;
  moisture_min_threshold: number;
  moisture_max_threshold: number;
  temperature_enabled: boolean;
  temperature_min_enabled: boolean;
  temperature_max_enabled: boolean;
  temperature_min_threshold: number;
  temperature_max_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface MoistureNotificationSettingsState {
  enabled: boolean;
  moistureEnabled: boolean;
  moistureMinEnabled: boolean;
  moistureMaxEnabled: boolean;
  moistureMinThreshold: string;
  moistureMaxThreshold: string;
  temperatureEnabled: boolean;
  temperatureMinEnabled: boolean;
  temperatureMaxEnabled: boolean;
  temperatureMinThreshold: string;
  temperatureMaxThreshold: string;
}

const defaultSettings: MoistureNotificationSettingsState = {
  enabled: false,
  moistureEnabled: true,
  moistureMinEnabled: true,
  moistureMaxEnabled: true,
  moistureMinThreshold: '10',
  moistureMaxThreshold: '20',
  temperatureEnabled: true,
  temperatureMinEnabled: true,
  temperatureMaxEnabled: true,
  temperatureMinThreshold: '20',
  temperatureMaxThreshold: '40',
};

export function useMoistureNotificationSettings(deviceCode: string | undefined) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MoistureNotificationSettingsState>(defaultSettings);
  const [existingId, setExistingId] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user?.id || !deviceCode) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moisture_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_code', deviceCode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingId(data.id);
        setSettings({
          enabled: data.enabled ?? false,
          moistureEnabled: data.moisture_enabled ?? true,
          moistureMinEnabled: data.moisture_min_enabled ?? true,
          moistureMaxEnabled: data.moisture_max_enabled ?? true,
          moistureMinThreshold: String(data.moisture_min_threshold ?? 10),
          moistureMaxThreshold: String(data.moisture_max_threshold ?? 20),
          temperatureEnabled: data.temperature_enabled ?? true,
          temperatureMinEnabled: data.temperature_min_enabled ?? true,
          temperatureMaxEnabled: data.temperature_max_enabled ?? true,
          temperatureMinThreshold: String(data.temperature_min_threshold ?? 20),
          temperatureMaxThreshold: String(data.temperature_max_threshold ?? 40),
        });
      } else {
        setExistingId(null);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading moisture notification settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, deviceCode]);

  const saveSettings = useCallback(async (): Promise<{ success: boolean; isNew: boolean }> => {
    if (!user?.id || !deviceCode) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return { success: false, isNew: false };
    }

    setSaving(true);
    const isNew = existingId === null;
    try {
      const payload = {
        user_id: user.id,
        device_code: deviceCode,
        enabled: settings.enabled,
        moisture_enabled: settings.moistureEnabled,
        moisture_min_enabled: settings.moistureMinEnabled,
        moisture_max_enabled: settings.moistureMaxEnabled,
        moisture_min_threshold: parseFloat(settings.moistureMinThreshold) || 10,
        moisture_max_threshold: parseFloat(settings.moistureMaxThreshold) || 20,
        temperature_enabled: settings.temperatureEnabled,
        temperature_min_enabled: settings.temperatureMinEnabled,
        temperature_max_enabled: settings.temperatureMaxEnabled,
        temperature_min_threshold: parseFloat(settings.temperatureMinThreshold) || 20,
        temperature_max_threshold: parseFloat(settings.temperatureMaxThreshold) || 40,
      };

      if (existingId) {
        const { error } = await supabase
          .from('moisture_notification_settings')
          .update(payload)
          .eq('id', existingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('moisture_notification_settings')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        setExistingId(data.id);
      }

      return { success: true, isNew };
    } catch (error) {
      console.error('Error saving moisture notification settings:', error);
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
      return { success: false, isNew: false };
    } finally {
      setSaving(false);
    }
  }, [user?.id, deviceCode, settings, existingId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    loading,
    saving,
    settings,
    setSettings,
    saveSettings,
    loadSettings,
    hasSettings: existingId !== null,
  };
}
