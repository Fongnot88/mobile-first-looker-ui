import React from 'react';
import { MoistureDevice, MoistureThreshold } from '../types';
import { AlertTriangle } from 'lucide-react';

interface MoistureComparisonChartProps {
  devices: MoistureDevice[];
  threshold: MoistureThreshold;
  selectedDeviceId?: string;
  onDeviceClick: (deviceId: string) => void;
}

export const MoistureComparisonChart: React.FC<MoistureComparisonChartProps> = ({
  devices,
  threshold,
  selectedDeviceId,
  onDeviceClick,
}) => {
  // Calculate max value for scaling (add 10% buffer)
  const maxValue = Math.max(...devices.map(d => Math.max(d.currentMoisture, d.realtimeMoisture || 0)), threshold.max) * 1.1;

  const getBarColor = (moisture: number, isRealtime: boolean) => {
    if (moisture >= threshold.critical) return isRealtime ? 'bg-red-500' : 'bg-red-400';
    if (moisture >= threshold.warning) return isRealtime ? 'bg-yellow-500' : 'bg-yellow-400';
    return isRealtime ? 'bg-purple-500' : 'bg-cyan-400';
  };

  const getBarHeight = (value: number) => {
    return `${(value / maxValue) * 100}%`;
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        📊 กราฟเปรียบเทียบความชื้น
      </h3>

      {/* Chart Area */}
      <div className="relative h-80 border-b-2 border-l-2 border-gray-300 dark:border-gray-600">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 -ml-12 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{Math.round(maxValue)}%</span>
          <span>{Math.round(maxValue * 0.75)}%</span>
          <span>{Math.round(maxValue * 0.5)}%</span>
          <span>{Math.round(maxValue * 0.25)}%</span>
          <span>0%</span>
        </div>

        {/* Threshold lines */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-red-400"
          style={{ bottom: getBarHeight(threshold.critical) }}
        >
          <span className="absolute -top-2 right-0 text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 px-1">
            Critical: {threshold.critical}%
          </span>
        </div>
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400"
          style={{ bottom: getBarHeight(threshold.warning) }}
        >
          <span className="absolute -top-2 right-0 text-xs text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-1">
            Warning: {threshold.warning}%
          </span>
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around px-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex-1 max-w-[80px] mx-2 relative"
            >
              <button
                onClick={() => onDeviceClick(device.id)}
                className={`w-full transition-all duration-200 hover:opacity-80 ${
                  selectedDeviceId === device.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                }`}
              >
                {/* Realtime bar (if exists) */}
                {device.realtimeMoisture && (
                  <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[45%] rounded-t-lg transition-all duration-300 ${getBarColor(
                      device.realtimeMoisture,
                      true
                    )}`}
                    style={{ height: getBarHeight(device.realtimeMoisture) }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                      {device.realtimeMoisture.toFixed(1)}%
                    </span>
                  </div>
                )}

                {/* Device bar */}
                <div
                  className={`absolute bottom-0 ${
                    device.realtimeMoisture ? 'left-0 w-[45%]' : 'left-1/2 transform -translate-x-1/2 w-full'
                  } rounded-t-lg transition-all duration-300 ${getBarColor(
                    device.currentMoisture,
                    false
                  )}`}
                  style={{ height: getBarHeight(device.currentMoisture) }}
                >
                  {!device.realtimeMoisture && (
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 whitespace-nowrap">
                      {device.currentMoisture.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Alert icon */}
                {device.hasAlert && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <AlertTriangle className="text-red-500 animate-pulse" size={16} />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex items-center justify-around mt-4 px-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex-1 max-w-[80px] mx-2 text-center"
          >
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {device.deviceCode}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  device.status === 'online'
                    ? 'bg-green-500'
                    : device.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
