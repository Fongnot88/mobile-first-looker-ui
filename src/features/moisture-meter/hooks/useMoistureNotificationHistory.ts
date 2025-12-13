import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface MoistureNotification {
  id: string;
  user_id: string;
  device_code: string;
  threshold_type: string;
  value: number;
  notification_message: string | null;
  notification_count: number;
  reading_id: string | null;
  settings_snapshot: any;
  read: boolean;
  timestamp: string;
  created_at: string;
}

interface UseMoistureNotificationHistoryProps {
  deviceCode?: string;
  limit?: number;
}

export const useMoistureNotificationHistory = ({
  deviceCode,
  limit = 10
}: UseMoistureNotificationHistoryProps = {}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MoistureNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('moisture_notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (deviceCode) {
        query = query.eq('device_code', deviceCode);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setNotifications(data || []);
    } catch (err: any) {
      console.error('Error fetching moisture notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('moisture_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('moisture_notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, deviceCode]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    deleteNotification
  };
};
