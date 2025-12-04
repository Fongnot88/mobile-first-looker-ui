import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { DevicesHeader, DevicesGrid } from "@/features/equipment";
import { AppLayout } from "@/components/layouts";
import { DeviceHistoryTable } from "@/features/device-details/components/DeviceHistoryTable";
import { MoistureReadingsTable } from "@/features/moisture-meter/components/MoistureReadingsTable";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useMemo, useEffect, useState } from "react";
import { useDevicesQuery } from "@/features/equipment/hooks/useDevicesQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
import demoMoistureMeterData from "@/data/demo-moisture-meter.json";

export default function MoistureMeterEquipment() {
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
  const { saveNavigationHistory } = useNavigationHistory();
  
  // Filter devices for moisture meters only
  const moistureMeterDevices = useMemo(() => {
    const filteredDevices = devices.filter(device => 
      device.display_name?.toLowerCase().includes('ความชื้น') ||
      device.display_name?.toLowerCase().includes('moisture') ||
      device.device_code?.toLowerCase().includes('mm') ||
      device.deviceData?.device_name?.toLowerCase().includes('ความชื้น') ||
      device.deviceData?.device_name?.toLowerCase().includes('moisture') ||
      device.deviceData?.device_type?.toLowerCase().includes('moisture')
    );
    
    // If no real devices found, add demo data
    if (filteredDevices.length === 0 && !isLoading) {
      console.log('📋 No moisture meter devices found, adding demo data');
      return [demoMoistureMeterData as any];
    }
    
    return filteredDevices;
  }, [devices, isLoading]);
  
  // Memoize deviceIds to prevent unnecessary re-renders
  const deviceIds = useMemo(() => {
    return moistureMeterDevices.map(d => d.device_code);
  }, [moistureMeterDevices]);
  
  // Memoize refresh handler to prevent recreating on every render
  const handleRefresh = useMemo(() => {
    return async () => {
      console.log('🔄 Manual refresh triggered from Moisture Meter page');
      await refetch();
      console.log('✅ Manual refresh completed');
    };
  }, [refetch]);

  // Save navigation history when component mounts
  useEffect(() => {
    saveNavigationHistory('/equipment/moisture-meter');
  }, [saveNavigationHistory]);
  
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
          totalUniqueDevices={moistureMeterDevices.length} 
          isSuperAdmin={isSuperAdmin} 
        />
      </div>
      
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          เครื่องวัดความชื้นข้าว
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          แสดงเฉพาะอุปกรณ์ที่เกี่ยวข้องกับการวัดความชื้นข้าว
        </p>
        {moistureMeterDevices.length > 0 && moistureMeterDevices[0]?.is_demo && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ข้อมูลตัวอย่าง
          </div>
        )}
      </div>
      
      {/* Add Device Form - Only for superadmin (not guests and not regular admins) */}
      {isSuperAdmin && !isGuest && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('device', 'addNewDevice')}</h2>
          <AddDeviceForm onDeviceAdded={handleRefresh} />
        </div>
      )}
      
      {/* Moisture Meter Devices Grid - Show for both authenticated users and guests */}
      <DevicesGrid 
        devices={moistureMeterDevices} 
        isAdmin={isAdmin && !isGuest} 
        isLoading={isLoading} 
        isSuperAdmin={isSuperAdmin && !isGuest} 
        onDeviceUpdated={handleRefresh} 
      />

      {/* Empty State when no moisture meters found */}
      {!isLoading && moistureMeterDevices.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            ไม่พบเครื่องวัดความชื้นข้าว
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            ไม่มีอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหาเครื่องวัดความชื้นข้าว
          </p>
        </div>
      )}

      {/* Moisture Readings Table - MQTT Data */}
      <div className="mt-8">
        <MoistureReadingsTable title="ประวัติเครื่องวัดความชื้นข้าว" />
      </div>

      {/* Device History Table - Show to all users including guests */}
      {moistureMeterDevices.length > 0 && (
        <div id="device-history" className="mt-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <DeviceHistoryTable deviceIds={deviceIds} title="ประวัติข้อมูลวิเคราะห์" />
        </div>
      )}
    </AppLayout>
  );
}
