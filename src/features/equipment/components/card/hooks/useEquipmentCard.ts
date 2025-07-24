import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useEquipmentCard = (deviceCode: string, displayName?: string, onDeviceUpdated?: () => void) => {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || deviceCode);
  const { toast } = useToast();

  const handleSaveDisplayName = async () => {
    try {
      // Check if there is already a record for this device
      const { data: existingSettings } = await supabase
        .from('device_settings')
        .select('*')
        .eq('device_code', deviceCode)
        .maybeSingle();

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('device_settings')
          .update({ display_name: newDisplayName })
          .eq('device_code', deviceCode);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('device_settings')
          .insert({
            device_code: deviceCode,
            display_name: newDisplayName
          });

        if (error) throw error;
      }

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
