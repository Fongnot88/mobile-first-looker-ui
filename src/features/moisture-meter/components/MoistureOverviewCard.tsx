import React from 'react';
import { MoistureOverview } from '../types';
import { TrendingUp, TrendingDown, AlertCircle, Droplets } from 'lucide-react';

interface MoistureOverviewCardProps {
  overview: MoistureOverview;
}

export const MoistureOverviewCard: React.FC<MoistureOverviewCardProps> = ({ overview }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800/40 p-6 rounded-xl border border-emerald-100 dark:border-gray-700/30 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="text-emerald-600 dark:text-emerald-400" size={24} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ภาพรวมความชื้นทั้งหมด
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Average */}
        <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">ค่าเฉลี่ย</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {overview.average.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            จาก {overview.totalDevices} เครื่อง
          </div>
        </div>

        {/* Highest */}
        <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-red-500" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">สูงสุด</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overview.highest.currentMoisture.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {overview.highest.deviceCode}
          </div>
        </div>

        {/* Lowest */}
        <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="text-green-500" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">ต่ำสุด</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {overview.lowest.currentMoisture.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {overview.lowest.deviceCode}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-orange-500" size={14} />
            <span className="text-xs text-gray-600 dark:text-gray-400">แจ้งเตือน</span>
          </div>
          <div className={`text-2xl font-bold ${
            overview.alertCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'
          }`}>
            {overview.alertCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {overview.alertCount === 0 ? 'ปกติทั้งหมด' : 'ต้องตรวจสอบ'}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {overview.alertCount > 0 && (
        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-orange-600 dark:text-orange-400" size={18} />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              มีเครื่องวัด {overview.alertCount} เครื่องที่ต้องตรวจสอบ
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
