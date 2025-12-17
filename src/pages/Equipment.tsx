
import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { DevicesHeader, DevicesGrid } from "@/features/equipment";
import { AppLayout } from "@/components/layouts";
import { DeviceHistoryTable } from "@/features/device-details/components/DeviceHistoryTable";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useMemo } from "react";
import { useDevicesQuery } from "@/features/equipment/hooks/useDevicesQuery";
import { useTranslation } from "@/hooks/useTranslation";

export default function Equipment() {
  const {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    refetch,
    isAdmin,
    isSuperAdmin
  } = useDevicesQuery();
  
  const { isGuest } = useGuestMode();
  const { t } = useTranslation();

  // Constants for Guest mode
  const GUEST_ALLOWED_DEVICES = [
    '6400000401398',
    '6400000401483',
    '6400000401493',
    '6400000401497'
  ];
  
  // Memoize deviceIds to prevent unnecessary re-renders
  const deviceIds = useMemo(() => {
    if (isGuest) {
      return GUEST_ALLOWED_DEVICES;
    }
    return devices.map(d => d.device_code);
  }, [devices, isGuest]);
  
  // Memoize refresh handler to prevent recreating on every render
  const handleRefresh = useMemo(() => {
    return async () => {
      console.log('🔄 Manual refresh triggered from Equipment page');
      await refetch();
      console.log('✅ Manual refresh completed');
    };
  }, [refetch]);
  
  return (
    <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-40 right-12 w-48 h-48 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          
      {/* Devices Section Header */}
      <div className="mb-8 relative">
        <DevicesHeader 
          isRefreshing={isRefreshing} 
          handleRefresh={handleRefresh} 
          totalUniqueDevices={totalUniqueDevices} 
          isSuperAdmin={isSuperAdmin} 
        />
      </div>
      
      {/* Add Device Form - Only for superadmin (not guests and not regular admins) */}
      {isSuperAdmin && !isGuest && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('device', 'addNewDevice')}</h2>
          <AddDeviceForm onDeviceAdded={handleRefresh} />
        </div>
      )}
      
      {/* Devices Grid - Show for both authenticated users and guests */}
      <DevicesGrid 
        devices={devices} 
        isAdmin={isAdmin && !isGuest} 
        isLoading={isLoading} 
        isSuperAdmin={isSuperAdmin && !isGuest} 
        onDeviceUpdated={handleRefresh} 
      />

      {/* Device History Table - Show to all users including guests */}
      <div id="device-history" className="mt-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <DeviceHistoryTable deviceIds={deviceIds} title={t('dataCategories', 'riceQualityHistoryTitle')} />
      </div>
    </AppLayout>
  );
}
