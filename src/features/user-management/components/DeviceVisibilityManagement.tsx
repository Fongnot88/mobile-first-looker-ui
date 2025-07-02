import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeviceVisibilityManagementProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function DeviceVisibilityManagement({ isAdmin, isSuperAdmin }: DeviceVisibilityManagementProps) {
  const [hiddenDevices, setHiddenDevices] = useState<string[]>([]);
  const [newDeviceCode, setNewDeviceCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const { toast } = useToast();

  // Only show for superadmin only
  if (!isSuperAdmin) {
    return null;
  }

  useEffect(() => {
    loadHiddenDevices();
  }, []);

  const loadHiddenDevices = async () => {
    try {
      setIsLoading(true);
      // For now, we'll store this in localStorage since it's admin-specific settings
      // In a production app, you might want to store this in a database table
      const stored = localStorage.getItem('admin_hidden_devices');
      if (stored) {
        setHiddenDevices(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading hidden devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHiddenDevices = async (devices: string[]) => {
    try {
      localStorage.setItem('admin_hidden_devices', JSON.stringify(devices));
      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าการแสดงผลอุปกรณ์ได้รับการบันทึกแล้ว"
      });
    } catch (error) {
      console.error('Error saving hidden devices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    }
  };

  const addHiddenDevice = async () => {
    if (!newDeviceCode.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาใส่รหัสอุปกรณ์",
        variant: "destructive"
      });
      return;
    }

    if (hiddenDevices.includes(newDeviceCode.trim())) {
      toast({
        title: "รหัสอุปกรณ์ซ้ำ",
        description: "รหัสอุปกรณ์นี้มีอยู่ในรายการแล้ว",
        variant: "destructive"
      });
      return;
    }

    setIsAddingDevice(true);
    try {
      const newHiddenDevices = [...hiddenDevices, newDeviceCode.trim()];
      setHiddenDevices(newHiddenDevices);
      await saveHiddenDevices(newHiddenDevices);
      setNewDeviceCode("");
    } catch (error) {
      console.error('Error adding hidden device:', error);
    } finally {
      setIsAddingDevice(false);
    }
  };

  const removeHiddenDevice = async (deviceCode: string) => {
    try {
      const newHiddenDevices = hiddenDevices.filter(code => code !== deviceCode);
      setHiddenDevices(newHiddenDevices);
      await saveHiddenDevices(newHiddenDevices);
    } catch (error) {
      console.error('Error removing hidden device:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            การควบคุมการแสดงผลอุปกรณ์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          การควบคุมการแสดงผลอุปกรณ์ (Super Admin เท่านั้น)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จัดการรหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin (เฉพาะ Super Admin เท่านั้นที่สามารถควบคุมได้)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add device form */}
        <div className="flex gap-2">
          <Input
            placeholder="รหัสอุปกรณ์ที่ต้องการซ่อน เช่น 6400000401493"
            value={newDeviceCode}
            onChange={(e) => setNewDeviceCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addHiddenDevice();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={addHiddenDevice}
            disabled={isAddingDevice || !newDeviceCode.trim()}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            เพิ่ม
          </Button>
        </div>

        {/* Hidden devices list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            รายการอุปกรณ์ที่ซ่อนการแสดงผล ({hiddenDevices.length} เครื่อง)
          </h4>
          
          {hiddenDevices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>แสดงอุปกรณ์ทั้งหมด</p>
              <p className="text-xs">ยังไม่มีอุปกรณ์ที่ซ่อนการแสดงผล</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hiddenDevices.map((deviceCode) => (
                <Badge
                  key={deviceCode}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <EyeOff className="h-3 w-3" />
                  <span className="font-mono text-xs">{deviceCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeHiddenDevice(deviceCode)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">📋 วิธีการใช้งาน:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>ใส่รหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin</li>
            <li>อุปกรณ์ที่ซ่อนจะไม่แสดงในหน้ารายการอุปกรณ์สำหรับบัญชี Admin</li>
            <li>การตั้งค่านี้ใช้ได้เฉพาะบัญชี Super Admin เท่านั้น</li>
            <li>สามารถเอาอุปกรณ์กลับมาแสดงได้โดยกดปุ่ม X</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}