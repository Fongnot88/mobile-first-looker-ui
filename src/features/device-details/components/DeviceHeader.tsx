
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { Monitor, Layout, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface DeviceHeaderProps {
  deviceCode: string;
  displayName?: string | null;
  onBack?: () => void;
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({
  deviceCode,
  displayName: propDisplayName,
  onBack,
}) => {
  const [deviceDisplayName, setDeviceDisplayName] = useState<string | null>(propDisplayName || null);

  const { t } = useTranslation();

  // Check if this is a moisture meter device (starts with 'mm' case-insensitive)
  const isMoistureMeter = deviceCode?.toLowerCase().startsWith('mm');

  // Fetch device display name if not provided as prop
  useEffect(() => {
    const fetchDeviceDisplayName = async () => {
      if (propDisplayName) {
        setDeviceDisplayName(propDisplayName);
        return;
      }

      if (!deviceCode) return;

      try {
        // Use different table based on device type
        const tableName = isMoistureMeter ? 'moisture_meter_settings' : 'device_settings';

        const { data, error } = await supabase
          .from(tableName)
          .select('display_name')
          .eq('device_code', deviceCode)
          .maybeSingle();

        if (error) {
          console.error('Error fetching device display name:', error);
          setDeviceDisplayName(null);
        } else {
          setDeviceDisplayName(data?.display_name || null);
        }
      } catch (error) {
        console.error('Error fetching device display name:', error);
        setDeviceDisplayName(null);
      }
    };

    fetchDeviceDisplayName();
  }, [deviceCode, propDisplayName, isMoistureMeter]);



  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Header with back button and device info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('buttons', 'back')}
            </Button>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('device', 'deviceName')}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {deviceDisplayName || t('device', 'equipment')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('device', 'deviceCode')}: {deviceCode}
            </p>
          </div>
        </div>
      </div>

      {/* Graph navigation buttons */}
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.DEVICE_GRAPH_SUMMARY(deviceCode)}>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
          >
            <Layout className="h-4 w-4 mr-2" />
            Graph Summary
          </Button>
        </Link>

      </div>
    </div>
  );
};
