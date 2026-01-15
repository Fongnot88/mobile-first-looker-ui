import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { RefreshCw, Activity, Info, Clock, Database, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DeviceStatusLog {
  id: string;
  device_code: string;
  display_name: string | null;
  device_type: string;
  previous_status: string;
  new_status: string;
  status_changed_at: string;
  last_data_time: string | null;
  detected_by_user: string | null;
  created_at: string;
}

export default function DeviceStatusLogs() {
  const { user, userRoles, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DeviceStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    if (!authLoading && (!user || !isSuperAdmin)) {
      navigate('/');
    }
  }, [user, isSuperAdmin, authLoading, navigate]);

  const fetchLogs = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('device_status_logs')
        .select('*')
        .order('status_changed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching device status logs:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchLogs();
    }
  }, [user, isSuperAdmin]);

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Online</Badge>;
    }
    return <Badge className="bg-red-500 hover:bg-red-600 text-white">Offline</Badge>;
  };

  const getDeviceTypeBadge = (type: string) => {
    if (type === 'rice_quality') {
      return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Rice Quality</Badge>;
    }
    return <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">Moisture Meter</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss', { locale: th });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Online/Offline Log
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Conditions Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="font-semibold mb-2">เงื่อนไขการตรวจสอบสถานะ Online/Offline:</div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>เวลาข้อมูลล่าสุด:</strong> ต้องมี timestamp ที่ถูกต้อง (ไม่เป็น null หรือ "-")</span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>ข้อมูลครบถ้วน:</strong> ค่าสำคัญต้องไม่ว่างเปล่า (เช่น class1, whiteness สำหรับ Rice Quality หรือ moisture_machine, temperature สำหรับ Moisture Meter)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><strong>ความใหม่ของข้อมูล:</strong> timestamp ต้องอยู่ภายใน 30 นาทีล่าสุด</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              * อุปกรณ์จะถือว่า <span className="text-green-600 dark:text-green-400 font-semibold">Online</span> เมื่อผ่านทั้ง 3 เงื่อนไข, ถ้าไม่ผ่านข้อใดข้อหนึ่งจะเป็น <span className="text-red-600 dark:text-red-400 font-semibold">Offline</span>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Recent Status Changes
            </CardTitle>
            <CardDescription>
              แสดง 100 รายการล่าสุด
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No status change logs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Device Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Changed At</TableHead>
                      <TableHead>Last Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.display_name || log.device_code}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.device_code}
                        </TableCell>
                        <TableCell>{getDeviceTypeBadge(log.device_type)}</TableCell>
                        <TableCell>{getStatusBadge(log.previous_status)}</TableCell>
                        <TableCell>{getStatusBadge(log.new_status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(log.status_changed_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.last_data_time ? formatDateTime(log.last_data_time) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
