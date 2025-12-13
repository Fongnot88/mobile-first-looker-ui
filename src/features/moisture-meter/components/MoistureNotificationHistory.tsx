import React from 'react';
import { Bell, AlertTriangle, Droplets, Thermometer, Clock, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMoistureNotificationHistory } from '../hooks/useMoistureNotificationHistory';
import { cn } from '@/lib/utils';

interface MoistureNotificationHistoryProps {
  deviceCode: string;
  limit?: number;
}

export const MoistureNotificationHistory: React.FC<MoistureNotificationHistoryProps> = ({
  deviceCode,
  limit = 5
}) => {
  const { notifications, loading, error, markAsRead, deleteNotification } = useMoistureNotificationHistory({
    deviceCode,
    limit
  });

  const getThresholdIcon = (type: string) => {
    if (type.includes('moisture')) {
      return <Droplets className="w-4 h-4 text-white" />;
    }
    return <Thermometer className="w-4 h-4 text-white" />;
  };

  const getThresholdColor = (type: string) => {
    if (type.includes('max')) {
      return {
        bg: 'bg-red-500',
        badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        text: 'text-red-600 dark:text-red-400'
      };
    }
    return {
      bg: 'bg-orange-500',
      badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400'
    };
  };

  const getThresholdLabel = (type: string) => {
    switch (type) {
      case 'moisture_min':
        return 'ความชื้นต่ำกว่าเกณฑ์';
      case 'moisture_max':
        return 'ความชื้นเกินเกณฑ์';
      case 'temperature_min':
        return 'อุณหภูมิต่ำกว่าเกณฑ์';
      case 'temperature_max':
        return 'อุณหภูมิเกินเกณฑ์';
      default:
        return type;
    }
  };

  const getValueUnit = (type: string) => {
    if (type.includes('moisture')) return '%';
    return '°C';
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: th });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-600 dark:text-amber-400" size={18} />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ประวัติการแจ้งเตือน</h4>
        </div>
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-600 dark:text-amber-400" size={18} />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ประวัติการแจ้งเตือน</h4>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="text-amber-600 dark:text-amber-400" size={18} />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">ประวัติการแจ้งเตือน</h4>
        </div>
        {notifications.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {notifications.length} รายการ
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <AlertTriangle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ยังไม่มีประวัติการแจ้งเตือน
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const colors = getThresholdColor(notification.threshold_type);
            return (
              <Card
                key={notification.id}
                className={cn(
                  'p-3 transition-all duration-200 hover:shadow-md',
                  notification.read
                    ? 'bg-gray-50 dark:bg-gray-800/50'
                    : 'bg-white dark:bg-gray-800 border-l-4 border-l-amber-500'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      colors.bg
                    )}
                  >
                    {getThresholdIcon(notification.threshold_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getThresholdLabel(notification.threshold_type)}
                      </span>
                      <Badge variant="outline" className={cn('text-xs', colors.badge)}>
                        {notification.threshold_type.includes('max') ? 'สูงสุด' : 'ต่ำสุด'}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {notification.notification_message || `ค่า: ${notification.value}${getValueUnit(notification.threshold_type)}`}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className={cn('font-semibold', colors.text)}>
                        {notification.value?.toFixed(1)}{getValueUnit(notification.threshold_type)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>
                      {notification.notification_count > 1 && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                          {notification.notification_count}x
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-7 w-7 p-0"
                        title="ทำเครื่องหมายว่าอ่านแล้ว"
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="ลบการแจ้งเตือน"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
