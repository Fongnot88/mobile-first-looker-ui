import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAlertSound, getNotificationsEnabled, NOTIFICATIONS_ENABLED_KEY } from '@/hooks/useAlertSound';
import { useAuth } from '@/components/AuthProvider';

/**
 * Moisture Notification Hook - ระบบแจ้งเตือนสำหรับ moisture meter
 */
interface MoistureNotification {
  id: string;
  device_code: string;
  threshold_type: string;
  value: number;
  notification_message: string;
  timestamp: string;
  notification_count: number;
  user_id: string;
  read: boolean;
}

interface MoistureNotificationSetting {
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
  user_id: string;
}

export const useMoistureNotifications = () => {
  const { user } = useAuth();
  
  const lastNotificationRef = useRef<string | null>(null);
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(getNotificationsEnabled());

  // ติดตามการเปลี่ยนแปลงการตั้งค่าแจ้งเตือน
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_ENABLED_KEY) {
        const enabled = getNotificationsEnabled();
        setNotificationsEnabled(enabled);
        if (!enabled) {
          setIsAlertActive(false);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  
  // ใช้เสียงแจ้งเตือน
  useAlertSound(isAlertActive, {
    enabled: notificationsEnabled && getNotificationsEnabled(),
    playOnce: true,
    repeatCount: 2,
    repeatGapMs: 1000,
  });

  // Fetch user's moisture notification settings
  const { data: userSettings } = useQuery({
    queryKey: ['moisture-notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('moisture_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);
      
      if (error) {
        console.error('❌ Failed to fetch moisture notification settings:', error);
        return [];
      }
      
      console.log('✅ Fetched moisture notification settings:', data?.length || 0, 'items');
      return data as MoistureNotificationSetting[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Calculate hasActiveSettings
  const hasActiveSettings = useMemo(() => {
    if (!user?.id || !userSettings) return false;
    return userSettings.length > 0;
  }, [user?.id, userSettings]);

  // Fetch moisture notifications
  const { data: notifications, refetch } = useQuery({
    queryKey: ['moisture-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('moisture_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('❌ Failed to fetch moisture notifications:', error);
        return [];
      }
      
      console.log('✅ Fetched moisture notifications:', data?.length || 0, 'items');
      return data as MoistureNotification[];
    },
    enabled: !!user?.id && hasActiveSettings,
    staleTime: 60000,
  });

  // Check for new notifications and show alerts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latestNotification = notifications[0];
    const notificationId = `${latestNotification.id}-${latestNotification.notification_count}`;
    
    if (
      latestNotification.id !== lastNotificationRef.current &&
      !processedNotificationsRef.current.has(notificationId)
    ) {
      console.log('🚨 New moisture notification detected:', {
        id: latestNotification.id,
        message: latestNotification.notification_message,
        device: latestNotification.device_code,
        value: latestNotification.value,
        type: latestNotification.threshold_type
      });
      
      if (!getNotificationsEnabled()) {
        console.log('🚫 Global notifications disabled - blocking sound');
        return;
      }
      
      // Activate alert sound
      setIsAlertActive(true);
      
      // Show toast notification
      toast({
        title: "🚨 แจ้งเตือนความชื้น",
        description: latestNotification.notification_message,
        variant: "destructive",
        duration: 10000,
      });

      // Update refs
      lastNotificationRef.current = latestNotification.id;
      processedNotificationsRef.current.add(notificationId);
      
      // Clean up old processed notifications
      if (processedNotificationsRef.current.size > 20) {
        const processedArray = Array.from(processedNotificationsRef.current);
        processedNotificationsRef.current = new Set(processedArray.slice(-20));
      }

      // Stop alert after some time
      setTimeout(() => {
        setIsAlertActive(false);
      }, 10000);
    }
  }, [notifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !hasActiveSettings) {
      return;
    }

    console.log("🔗 Moisture notifications: Setting up real-time subscription for user:", user.id);

    try {
      const channel = supabase
        .channel('moisture-notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'moisture_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Real-time moisture notification received:', payload);
            refetch();
          }
        )
        .subscribe((status) => {
          console.log('📡 Moisture notifications real-time status:', status);
        });

      return () => {
        console.log('🔌 Moisture notifications: Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn('⚠️ Moisture notifications: Realtime subscription failed:', error);
      return () => {};
    }
  }, [user?.id, hasActiveSettings, refetch]);

  return {
    notifications,
    userSettings,
    hasActiveSettings,
    isAlertActive,
    refetch,
  };
};
