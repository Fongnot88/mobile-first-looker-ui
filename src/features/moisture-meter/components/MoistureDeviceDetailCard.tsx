import React from 'react';
import { MoistureDevice } from '../types';
import { MapPin, Thermometer, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface MoistureDeviceDetailCardProps {
  device: MoistureDevice | null;
  onViewHistory?: () => void;
}

export const MoistureDeviceDetailCard: React.FC<MoistureDeviceDetailCardProps> = ({
  device,
  onViewHistory,
}) => {
  if (!device) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
        <p className="text-center text-gray-500 dark:text-gray-400">
          กรุณาเลือกเครื่องวัดเพื่อดูรายละเอียด
        </p>
      </div>
    );
  }

  const lastUpdated = formatDistanceToNow(new Date(device.lastUpdated), {
    addSuffix: true,
    locale: th,
  });

  return (
    <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📱 {device.displayName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {device.deviceCode}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          device.status === 'online'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : device.status === 'warning'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {device.status === 'online' ? 'ออนไลน์' : device.status === 'warning' ? 'ต้องตรวจสอบ' : 'ออฟไลน์'}
        </div>
      </div>

      {/* Current Moisture - Main Display */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-5 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ความชื้นปัจจุบัน</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                {device.currentMoisture.toFixed(1)}
              </span>
              <span className="text-xl text-cyan-600 dark:text-cyan-400">%</span>
            </div>
          </div>
          {device.realtimeMoisture && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Real-time</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {device.realtimeMoisture.toFixed(1)}
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-400">%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <MapPin className="text-emerald-600 dark:text-emerald-400" size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">สถานที่</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {device.location}
            </p>
          </div>
        </div>

        {/* Temperature */}
        {device.temperature && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Thermometer className="text-orange-600 dark:text-orange-400" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">อุณหภูมิ</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {device.temperature.toFixed(1)}°C
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Clock size={14} />
        <span>อัพเดตล่าสุด: {lastUpdated}</span>
      </div>

      {/* View History Button */}
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <TrendingUp size={18} />
          ดูกราฟย้อนหลัง
        </button>
      )}
    </div>
  );
};
