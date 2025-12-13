
import { useState } from "react";
import { EquipmentCard } from "./EquipmentCard";
import { DeviceInfo } from "../types";
import { DevicesSortDropdown, SortOption } from "./DevicesSortDropdown";

interface DevicesGridProps {
  devices: DeviceInfo[];
  isAdmin: boolean;
  isLoading: boolean;
  isSuperAdmin?: boolean;
  onDeviceUpdated?: () => void;
  isMoistureMeter?: boolean;
}

export function DevicesGrid({ 
  devices, 
  isAdmin, 
  isLoading, 
  isSuperAdmin = false,
  onDeviceUpdated,
  isMoistureMeter = false
}: DevicesGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("device_code");

  console.log("🏗️ DevicesGrid rendering with devices:", devices.map(d => ({
    code: d.device_code,
    hasDeviceData: !!d.deviceData,
    deviceData: d.deviceData
  })));

  // Sort devices based on selected option
  const sortedDevices = [...devices].sort((a, b) => {
    switch (sortBy) {
      case "device_code":
        return a.device_code.localeCompare(b.device_code);
      case "display_name":
        const nameA = a.display_name || a.device_code;
        const nameB = b.display_name || b.device_code;
        return nameA.localeCompare(nameB);
      case "updated_at":
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA; // Most recent first
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <DevicesSortDropdown value={sortBy} onChange={setSortBy} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">ไม่พบอุปกรณ์</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <DevicesSortDropdown value={sortBy} onChange={setSortBy} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedDevices.map((device) => {
          console.log(`🎯 Rendering card for ${device.device_code} with deviceData:`, device.deviceData);
          
          // สำหรับเครื่องวัดความชื้นใช้ reading_time, สำหรับเครื่องวัดคุณภาพใช้ machine_unix_time
          const lastUpdatedTime = isMoistureMeter 
            ? device.deviceData?.reading_time || device.updated_at
            : device.deviceData?.machine_unix_time || device.updated_at;
          
          return (
            <EquipmentCard
              key={device.device_code}
              deviceCode={device.device_code}
              lastUpdated={lastUpdatedTime}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              displayName={device.display_name}
              onDeviceUpdated={onDeviceUpdated}
              deviceData={device.deviceData}
              isMoistureMeter={isMoistureMeter}
            />
          );
        })}
      </div>
    </div>
  );
}
