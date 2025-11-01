import React, { useState, useMemo } from 'react';
import { MoistureDevice, MoistureThreshold } from '../types';
import { MoistureOverviewCard } from './MoistureOverviewCard';
import { MoistureComparisonChart } from './MoistureComparisonChart';
import { MoistureLegend } from './MoistureLegend';
import { MoistureDeviceDetailCard } from './MoistureDeviceDetailCard';
import { calculateMoistureOverview, DEFAULT_MOISTURE_THRESHOLD } from '../utils/moistureCalculations';

interface MoistureMeterDashboardProps {
  devices: MoistureDevice[];
  threshold?: MoistureThreshold;
  onViewHistory?: (deviceId: string) => void;
}

export const MoistureMeterDashboard: React.FC<MoistureMeterDashboardProps> = ({
  devices,
  threshold = DEFAULT_MOISTURE_THRESHOLD,
  onViewHistory,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    devices.length > 0 ? devices[0].id : undefined
  );

  const overview = useMemo(() => calculateMoistureOverview(devices), [devices]);
  const selectedDevice = useMemo(
    () => devices.find(d => d.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleViewHistory = () => {
    if (selectedDevice && onViewHistory) {
      onViewHistory(selectedDevice.id);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-8 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm text-center">
        <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลเครื่องวัดความชื้น</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      {overview && <MoistureOverviewCard overview={overview} />}

      {/* Comparison Chart */}
      <MoistureComparisonChart
        devices={devices}
        threshold={threshold}
        selectedDeviceId={selectedDeviceId}
        onDeviceClick={handleDeviceClick}
      />

      {/* Legend */}
      <MoistureLegend />

      {/* Device Detail Card */}
      <MoistureDeviceDetailCard
        device={selectedDevice}
        onViewHistory={onViewHistory ? handleViewHistory : undefined}
      />
    </div>
  );
};
