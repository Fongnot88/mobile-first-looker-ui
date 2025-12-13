import React, { useEffect } from 'react';
import { useMoistureNotifications } from '@/hooks/useMoistureNotifications';
import { useMobileNotificationSound } from '@/hooks/useMobileNotificationSound';
import { getNotificationsEnabled } from '@/hooks/useAlertSound';

/**
 * Moisture Notification Manager
 * ระบบจัดการแจ้งเตือน moisture meter แบบ global
 * ✅ รองรับเสียงแจ้งเตือนและ real-time subscription
 */
export const MoistureNotificationManager: React.FC = () => {
  const { notifications, hasActiveSettings, isAlertActive } = useMoistureNotifications();
  const notificationsEnabled = getNotificationsEnabled();
  
  // Calculate if there are currently active notifications
  const hasActiveNotifications = Boolean(
    notifications && 
    notifications.length > 0 && 
    hasActiveSettings &&
    notificationsEnabled &&
    isAlertActive
  );

  // Use mobile-optimized notification sound
  const { isInitialized, getAudioInfo } = useMobileNotificationSound(
    hasActiveNotifications,
    {
      enabled: notificationsEnabled,
      playOnce: true,
      repeatCount: 2,
      repeatInterval: 1500
    }
  );

  // Log audio status for debugging
  useEffect(() => {
    if (isInitialized) {
      const audioInfo = getAudioInfo();
      console.log('🎵 Moisture notification audio status:', audioInfo);
    }
  }, [isInitialized, getAudioInfo]);

  // Log notification status changes
  useEffect(() => {
    if (hasActiveNotifications) {
      console.log('🔔 Active moisture notifications detected:', notifications?.length || 0);
    }
  }, [hasActiveNotifications, notifications]);

  return null; // Service component - no UI
};
