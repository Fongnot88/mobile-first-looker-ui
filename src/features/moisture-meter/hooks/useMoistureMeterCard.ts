import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMoistureMeterCard = (deviceCode: string, displayName?: string, onDeviceUpdated?: () => void) => {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || deviceCode);
  const { toast } = useToast();

  const handleSaveDisplayName = async () => {
    try {
      // อัพเดท device_name ใน moisture_meter_readings สำหรับ device_code นี้
      const { error } = await supabase
        .from('moisture_meter_readings')
        .update({ device_name: newDisplayName })
        .eq('device_code', deviceCode);

      if (error) throw error;

      toast({
        title: "บันทึกสำเร็จ",
        description: "ชื่ออุปกรณ์ถูกอัพเดทเรียบร้อยแล้ว"
      });

      setIsEditDialogOpen(false);

      // Trigger refresh if callback is provided
      if (onDeviceUpdated) {
        onDeviceUpdated();
      }
    } catch (error) {
      console.error("Error updating device name:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทชื่ออุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };

  return {
    isUsersDialogOpen,
    setIsUsersDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newDisplayName,
    setNewDisplayName,
    handleSaveDisplayName
  };
};
