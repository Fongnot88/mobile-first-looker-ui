import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuccessDialog } from '@/components/ui/success-dialog';
import { toast } from 'sonner';
import { 
  Bell, 
  BellOff, 
  Droplets, 
  Thermometer, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface MoistureNotification {
  id: string;
  device_code: string;
  threshold_type: string;
  value: number;
  notification_message: string;
  timestamp: string;
  notification_count: number;
  read: boolean;
  created_at: string;
}

const MoistureNotificationHistory: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    variant: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['moisture-notification-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('moisture_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as MoistureNotification[];
    },
    enabled: !!user?.id,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('moisture_notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moisture-notification-history'] });
      queryClient.invalidateQueries({ queryKey: ['moisture-notifications'] });
      toast.success('ทำเครื่องหมายอ่านแล้ว');
    },
    onError: () => {
      toast.error('เกิดข้อผิดพลาด');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('moisture_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moisture-notification-history'] });
      queryClient.invalidateQueries({ queryKey: ['moisture-notifications'] });
      setDialogConfig({
        title: 'สำเร็จ!',
        description: 'ทำเครื่องหมายอ่านแล้วทั้งหมด',
        variant: 'success',
      });
      setShowSuccessDialog(true);
    },
    onError: () => {
      toast.error('เกิดข้อผิดพลาด');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('moisture_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moisture-notification-history'] });
      queryClient.invalidateQueries({ queryKey: ['moisture-notifications'] });
      toast.success('ลบการแจ้งเตือนแล้ว');
    },
    onError: () => {
      toast.error('เกิดข้อผิดพลาด');
    },
  });

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('moisture_notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moisture-notification-history'] });
      queryClient.invalidateQueries({ queryKey: ['moisture-notifications'] });
      setDialogConfig({
        title: 'สำเร็จ!',
        description: 'ลบการแจ้งเตือนทั้งหมดแล้ว',
        variant: 'success',
      });
      setShowSuccessDialog(true);
    },
    onError: () => {
      toast.error('เกิดข้อผิดพลาด');
    },
  });

  const getThresholdIcon = (type: string) => {
    if (type.includes('moisture')) {
      return <Droplets className="h-4 w-4 text-cyan-500" />;
    }
    return <Thermometer className="h-4 w-4 text-orange-500" />;
  };

  const getThresholdLabel = (type: string) => {
    const labels: Record<string, string> = {
      'moisture_min': 'ความชื้นต่ำ',
      'moisture_max': 'ความชื้นสูง',
      'temperature_min': 'อุณหภูมิต่ำ',
      'temperature_max': 'อุณหภูมิสูง',
    };
    return labels[type] || type;
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อดูประวัติการแจ้งเตือน</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/equipment/moisture-meter">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-amber-500" />
              ประวัติการแจ้งเตือน Moisture Meter
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {notifications?.length || 0} รายการ
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} ยังไม่อ่าน
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {notifications && notifications.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              อ่านทั้งหมด
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบทั้งหมด
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all ${
                  notification.read 
                    ? 'bg-muted/30 border-muted' 
                    : 'bg-background border-amber-200 dark:border-amber-800/50 shadow-sm'
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${
                      notification.read 
                        ? 'bg-muted' 
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      {getThresholdIcon(notification.threshold_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={notification.read ? 'secondary' : 'default'}>
                          {getThresholdLabel(notification.threshold_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notification.device_code}
                        </span>
                        {notification.notification_count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            x{notification.notification_count}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.notification_message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(notification.timestamp), 'dd MMM yyyy HH:mm', { locale: th })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">ยังไม่มีประวัติการแจ้งเตือน</p>
              <p className="text-sm text-muted-foreground mt-1">
                เมื่อมีค่าเกินเกณฑ์ที่ตั้งไว้ การแจ้งเตือนจะปรากฏที่นี่
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={dialogConfig.title}
        description={dialogConfig.description}
        variant={dialogConfig.variant}
      />
    </AppLayout>
  );
};

export default MoistureNotificationHistory;
