import React from 'react';
import { MapPin, Thermometer, Clock, TrendingUp, Droplets } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { th } from 'date-fns/locale';
import { LatestMoistureReading } from '../hooks/useLatestMoistureReading';
import { MoistureMeterSetting } from '../hooks/useMoistureMeterSettings';

interface MoistureDeviceDetailProps {
  reading: LatestMoistureReading | null;
  settings: MoistureMeterSetting | null;
  isLoading?: boolean;
  onViewHistory?: () => void;
}

export const MoistureDeviceDetail: React.FC<MoistureDeviceDetailProps> = ({
  reading,
  settings,
  isLoading = false,
  onViewHistory,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-32 bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
        <p className="text-center text-gray-500 dark:text-gray-400">
          ไม่พบข้อมูลการวัดความชื้น
        </p>
      </div>
    );
  }

  const displayName = settings?.display_name || reading.device_code || 'ไม่ระบุ';
  const location = settings?.location || 'โรงงาน 1';
  const isActive = settings?.is_active ?? true;
  
  const lastUpdated = reading.reading_time 
    ? formatDistanceToNow(new Date(reading.reading_time), { addSuffix: true, locale: th })
    : 'ไม่ทราบ';

  const formattedTime = reading.reading_time
    ? format(new Date(reading.reading_time), 'd MMM yyyy HH:mm', { locale: th })
    : '-';

  return (
    <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📱 {displayName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {reading.device_code}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {isActive ? 'ออนไลน์' : 'ออฟไลน์'}
        </div>
      </div>

      {/* Current Moisture - Main Display */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-5 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Droplets size={14} />
              ความชื้น (เครื่อง)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                {reading.moisture_machine?.toFixed(1) ?? '-'}
              </span>
              <span className="text-xl text-cyan-600 dark:text-cyan-400">%</span>
            </div>
          </div>
          {reading.moisture_model !== null && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1 justify-end">
                <Droplets size={12} />
                ความชื้น (โมเดล)
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {reading.moisture_model?.toFixed(1) ?? '-'}
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
              {location}
            </p>
          </div>
        </div>

        {/* Temperature */}
        {reading.temperature !== null && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Thermometer className="text-orange-600 dark:text-orange-400" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">อุณหภูมิ</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {reading.temperature?.toFixed(1)}°C
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Clock size={14} />
        <span>อัพเดตล่าสุด: {lastUpdated}</span>
        <span className="text-xs text-gray-400">({formattedTime})</span>
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
