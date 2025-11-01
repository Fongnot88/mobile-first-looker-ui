
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";
import { EquipmentTabs } from "@/components/EquipmentTabs";

interface DevicesHeaderProps {
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  totalUniqueDevices: number;
  isSuperAdmin: boolean;
}

export function DevicesHeader({
  isRefreshing,
  handleRefresh,
  totalUniqueDevices,
  isSuperAdmin
}: DevicesHeaderProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {/* Equipment Tabs */}
      <EquipmentTabs />
      
      {/* Header with title and refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-white`}>{t('device', 'equipment')}</h1>
          {isSuperAdmin && totalUniqueDevices > 0 && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{t('device', 'totalDevicesInSystem')}: {totalUniqueDevices} {t('device', 'units')}</p>
          )}
          {!isSuperAdmin && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{t('device', 'authorizedDevicesOnly')}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs">{t('buttons', 'refresh')}</span>
        </Button>
      </div>
    </div>
  );
}
