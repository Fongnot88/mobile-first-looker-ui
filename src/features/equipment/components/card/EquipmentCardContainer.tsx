import { Card } from "@/components/ui/card";
import { EquipmentCardHeader } from "./EquipmentCardHeader";
import { EquipmentCardContent } from "./EquipmentCardContent";
import { EquipmentCardDialogs } from "./EquipmentCardDialogs";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { UserAccessDialog } from "../access/UserAccessDialog";
import { useEquipmentCard } from "./hooks/useEquipmentCard";
import { useMoistureMeterCard } from "@/features/moisture-meter/hooks/useMoistureMeterCard";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useQueryClient } from "@tanstack/react-query";

interface EquipmentCardContainerProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
  deviceData?: any; // เพิ่ม prop สำหรับข้อมูลอุปกรณ์
  isMoistureMeter?: boolean; // เพิ่ม prop สำหรับเครื่องวัดความชื้น
}

export function EquipmentCardContainer({
  deviceCode,
  lastUpdated,
  isAdmin = false,
  isSuperAdmin = false,
  displayName,
  onDeviceUpdated,
  deviceData,
  isMoistureMeter = false
}: EquipmentCardContainerProps) {
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // ใช้ hook ที่เหมาะสมตามประเภทอุปกรณ์
  const equipmentHook = useEquipmentCard(deviceCode, displayName, onDeviceUpdated);
  const moistureMeterHook = useMoistureMeterCard(deviceCode, displayName, onDeviceUpdated);
  
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    newDisplayName,
    setNewDisplayName,
    handleSaveDisplayName
  } = isMoistureMeter ? moistureMeterHook : equipmentHook;

  const handleDeleteConfirm = async () => {
    console.log('🗑️ Starting complete device deletion for:', deviceCode);
    setIsDeleting(true);
    try {
      // ลบข้อมูลจาก rice_quality_analysis ก่อน (ข้อมูลหลัก)
      const { error: analysisError } = await supabase
        .from('rice_quality_analysis')
        .delete()
        .eq('device_code', deviceCode);

      if (analysisError) {
        console.error('❌ Error deleting from rice_quality_analysis:', analysisError);
        throw analysisError;
      }
      console.log('✅ Successfully deleted from rice_quality_analysis');

      // ลบข้อมูลจาก notification_settings  
      const { error: notificationError } = await supabase
        .from('notification_settings')
        .delete()
        .eq('device_code', deviceCode);

      if (notificationError) {
        console.warn('⚠️ Warning deleting notification settings:', notificationError);
      } else {
        console.log('✅ Successfully deleted from notification_settings');
      }

      // ลบข้อมูลจาก device_settings
      const { error: deviceSettingsError } = await supabase
        .from('device_settings')
        .delete()
        .eq('device_code', deviceCode);

      if (deviceSettingsError) {
        console.error('❌ Error deleting from device_settings:', deviceSettingsError);
        throw deviceSettingsError;
      }
      console.log('✅ Successfully deleted from device_settings');

      // ลบข้อมูลจาก user_device_access
      const { error: userAccessError } = await supabase
        .from('user_device_access')
        .delete()
        .eq('device_code', deviceCode);

      if (userAccessError) {
        console.warn('⚠️ Warning deleting user device access:', userAccessError);
      } else {
        console.log('✅ Successfully deleted from user_device_access');
      }

      // ลบข้อมูลจาก guest_device_access
      const { error: guestAccessError } = await supabase
        .from('guest_device_access')
        .delete()
        .eq('device_code', deviceCode);

      if (guestAccessError) {
        console.warn('⚠️ Warning deleting guest device access:', guestAccessError);
      } else {
        console.log('✅ Successfully deleted from guest_device_access');
      }

      // แสดงข้อความสำเร็จ
      toast({
        title: t('general', 'success'),
        description: `${t('device', 'equipment')} ${displayName || deviceCode} ${t('buttons', 'delete')}สำเร็จ`,
        variant: "default",
      });

      // ปิด dialog ทันที
      setIsDeleteDialogOpen(false);

      // Invalidate React Query cache แบบ aggressive
      console.log('🔄 Invalidating React Query cache...');
      
      // ใช้ removeQueries เพื่อลบ cache ทันที
      queryClient.removeQueries({ 
        queryKey: ['guest-devices-no-cache'] 
      });
      queryClient.removeQueries({ 
        queryKey: ['authenticated-devices'] 
      });
      queryClient.removeQueries({ 
        queryKey: ['device-count'] 
      });

      // Force refetch ทันที
      await queryClient.refetchQueries({ 
        queryKey: ['guest-devices-no-cache'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['authenticated-devices'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['device-count'] 
      });

      console.log('✅ React Query cache removed and refetched');

      // เรียก callback เพื่อ refresh component
      console.log('🔄 Calling onDeviceUpdated callback...');
      onDeviceUpdated?.();
      console.log('✅ Device deletion completed successfully');
      
    } catch (error) {
      console.error('❌ Error deleting device:', error);
      toast({
        title: t('general', 'error'),
        description: `${t('general', 'error')} ไม่สามารถลบ${t('device', 'equipment')}ได้`,
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Setting isDeleting to false');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="duration-300 border border-gray-200 dark:border-gray-700 bg-emerald-100 dark:bg-emerald-800 bg-[linear-gradient(rgba(255,255,255,0.98),rgba(255,255,255,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] dark:bg-[linear-gradient(rgba(30,41,59,0.98),rgba(30,41,59,0.98)),url('/lovable-uploads/6b12828f-a844-4f45-be72-ca664963430d.png')] bg-repeat shadow-none">
        <EquipmentCardHeader
          deviceCode={deviceCode}
          displayName={displayName}
          isSuperAdmin={isSuperAdmin}
          onUsersClick={() => setIsUsersDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        
        <EquipmentCardContent
          deviceCode={deviceCode}
          displayName={displayName}
          lastUpdated={lastUpdated}
          isAdmin={isAdmin || isSuperAdmin}
          onEditClick={() => setIsEditDialogOpen(true)}
          deviceData={deviceData}
          isMoistureMeter={isMoistureMeter}
        />
      </Card>
      
      {/* Delete Confirmation Dialog for Super Admin */}
      {isSuperAdmin && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          deviceName={displayName || deviceCode}
          isLoading={isDeleting}
        />
      )}

      {/* User Access Dialog for Super Admin */}
      {isSuperAdmin && (
        <UserAccessDialog
          deviceCode={deviceCode}
          isOpen={isUsersDialogOpen}
          onOpenChange={setIsUsersDialogOpen}
        />
      )}
      
      {/* Edit Dialog for Admin/Super Admin */}
      {(isAdmin || isSuperAdmin) && (
        <EquipmentCardDialogs
          deviceCode={deviceCode}
          isUsersDialogOpen={false}
          onUsersDialogChange={() => {}}
          isEditDialogOpen={isEditDialogOpen}
          onEditDialogChange={setIsEditDialogOpen}
          newDisplayName={newDisplayName}
          onDisplayNameChange={setNewDisplayName}
          onSaveDisplayName={handleSaveDisplayName}
        />
      )}
    </>
  );
}
